import { pool } from '../config/database';
import { PoolClient } from 'pg';
import { Log } from '../types';

/**
 * Process a Transfer event from the blockchain
 */
export async function processTransferEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { from, to, value } = log.args as any;
  const fromAddress = (from as string).toLowerCase();
  const toAddress = (to as string).toLowerCase();
  const amount = value as bigint;
  const blockNumber = Number(log.blockNumber);

  // Determine event type
  let eventType = 'transfer';
  if (fromAddress === '0x0000000000000000000000000000000000000000') {
    eventType = 'mint';
  } else if (toAddress === '0x0000000000000000000000000000000000000000') {
    eventType = 'burn';
  }

  // Check if this transaction has already been processed
  const existing = await pool.query(
    'SELECT id FROM transfers WHERE transaction_hash = $1',
    [log.transactionHash]
  );

  // If transaction already exists, skip balance update
  if (existing.rows.length > 0) {
    console.log(`⏭️  Skipping duplicate transaction: ${log.transactionHash}`);
    return;
  }

  // Insert transfer record
  await pool.query(`
    INSERT INTO transfers (
      transaction_hash,
      block_number,
      block_timestamp,
      from_address,
      to_address,
      amount,
      event_type
    ) VALUES ($1, $2, to_timestamp($3), $4, $5, $6, $7)
    ON CONFLICT (transaction_hash) DO NOTHING
  `, [
    log.transactionHash,
    blockNumber,
    Number(blockTimestamp),
    fromAddress,
    toAddress,
    amount.toString(),
    eventType,
  ]);

  // Update balances (only if transaction wasn't a duplicate)
  await updateBalances(fromAddress, toAddress, amount, blockNumber);

  console.log(`✅ Processed ${eventType}: ${amount.toString()} from ${fromAddress.slice(0, 10)}... to ${toAddress.slice(0, 10)}...`);
}

/**
 * Update balances for sender and recipient
 */
async function updateBalances(
  fromAddress: string,
  toAddress: string,
  amount: bigint,
  blockNumber: number
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Decrease sender balance (if not mint)
    if (fromAddress !== '0x0000000000000000000000000000000000000000') {
      await client.query(`
        UPDATE balances
        SET balance = balance - $1,
            last_updated_block = $2,
            last_updated_at = NOW(),
            updated_at = NOW()
        WHERE address = $3
      `, [amount.toString(), blockNumber, fromAddress]);
    }

    // Increase recipient balance (if not burn)
    if (toAddress !== '0x0000000000000000000000000000000000000000') {
      await client.query(`
        INSERT INTO balances (address, balance, last_updated_block, last_updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (address)
        DO UPDATE SET
          balance = balances.balance + $2,
          last_updated_block = $3,
          last_updated_at = NOW(),
          updated_at = NOW()
      `, [toAddress, amount.toString(), blockNumber]);
    }

    // Recalculate ownership percentages
    await recalculateOwnershipPercentages(client);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Recalculate ownership percentages for all addresses
 */
async function recalculateOwnershipPercentages(client: PoolClient) {
  await client.query(`
    UPDATE balances
    SET ownership_percent = (
      balance::numeric / NULLIF((SELECT SUM(balance) FROM balances), 0) * 100
    )
    WHERE balance > 0
  `);
}

/**
 * Process a WalletApproved event
 */
export async function processWalletApprovedEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { wallet, timestamp } = log.args as any;
  const address = (wallet as string).toLowerCase();
  const blockNumber = Number(log.blockNumber);

  await pool.query(`
    INSERT INTO approvals (
      address,
      approved,
      approved_at,
      approved_at_block,
      transaction_hash
    ) VALUES ($1, true, to_timestamp($2), $3, $4)
    ON CONFLICT (address)
    DO UPDATE SET
      approved = true,
      approved_at = to_timestamp($2),
      approved_at_block = $3,
      transaction_hash = $4,
      updated_at = NOW()
  `, [
    address,
    Number(timestamp),
    blockNumber,
    log.transactionHash,
  ]);

  console.log(`✅ Wallet approved: ${address}`);
}

/**
 * Process a WalletRevoked event
 */
export async function processWalletRevokedEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { wallet, timestamp } = log.args as any;
  const address = (wallet as string).toLowerCase();
  const blockNumber = Number(log.blockNumber);

  await pool.query(`
    UPDATE approvals
    SET approved = false,
        revoked_at = to_timestamp($1),
        revoked_at_block = $2,
        updated_at = NOW()
    WHERE address = $3
  `, [
    Number(timestamp),
    blockNumber,
    address,
  ]);

  console.log(`✅ Wallet revoked: ${address}`);
}

/**
 * Process a StockSplit event
 */
export async function processStockSplitEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { multiplier, newTotalSupply, timestamp } = log.args as any;
  const blockNumber = Number(log.blockNumber);

  await pool.query(`
    INSERT INTO corporate_actions (
      transaction_hash,
      block_number,
      block_timestamp,
      action_type,
      action_data
    ) VALUES ($1, $2, to_timestamp($3), 'split', $4)
    ON CONFLICT (transaction_hash) DO NOTHING
  `, [
    log.transactionHash,
    blockNumber,
    Number(blockTimestamp),
    JSON.stringify({ 
      multiplier: Number(multiplier), 
      newTotalSupply: newTotalSupply.toString() 
    }),
  ]);

  console.log(`✅ Stock split processed: ${multiplier}x multiplier`);
}

/**
 * Process a SymbolChanged event
 */
export async function processSymbolChangedEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { oldSymbol, newSymbol, timestamp } = log.args as any;
  const blockNumber = Number(log.blockNumber);

  await pool.query(`
    INSERT INTO corporate_actions (
      transaction_hash,
      block_number,
      block_timestamp,
      action_type,
      action_data
    ) VALUES ($1, $2, to_timestamp($3), 'symbol_change', $4)
    ON CONFLICT (transaction_hash) DO NOTHING
  `, [
    log.transactionHash,
    blockNumber,
    Number(blockTimestamp),
    JSON.stringify({ oldSymbol, newSymbol }),
  ]);

  console.log(`✅ Symbol changed: ${oldSymbol} → ${newSymbol}`);
}

/**
 * Process TokensMinted event (same as Transfer with from=0x0)
 */
export async function processTokensMintedEvent(
  log: Log,
  blockTimestamp: bigint
) {
  // TokensMinted events are also captured by Transfer events
  // Just log for visibility
  const { to, amount } = log.args as any;
  console.log(`🪙 TokensMinted event: ${amount} to ${to}`);
}

/**
 * Process TokensBurned event (same as Transfer with to=0x0)
 */
export async function processTokensBurnedEvent(
  log: Log,
  blockTimestamp: bigint
) {
  // TokensBurned events are also captured by Transfer events
  // Just log for visibility
  const { from, amount } = log.args as any;
  console.log(`🔥 TokensBurned event: ${amount} from ${from}`);
}


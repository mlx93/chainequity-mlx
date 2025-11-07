import { pool } from '../config/database';
import {
  TransferRow,
  BalanceRow,
  ApprovalRow,
  CorporateActionRow,
} from '../types';

export async function getCapTable() {
  const result = await pool.query<BalanceRow>(`
    SELECT 
      address,
      balance,
      updated_at
    FROM balances
    WHERE balance::numeric > 0
    ORDER BY balance::numeric DESC
  `);
  
  return result.rows;
}

export async function getTransfers(filters: {
  address?: string;
  limit?: number;
  offset?: number;
  fromBlock?: number;
  toBlock?: number;
}) {
  let query = 'SELECT * FROM transfers WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;
  
  if (filters.address) {
    params.push(filters.address.toLowerCase(), filters.address.toLowerCase());
    query += ` AND (from_address = $${paramIndex} OR to_address = $${paramIndex + 1})`;
    paramIndex += 2;
  }
  
  if (filters.fromBlock !== undefined) {
    params.push(filters.fromBlock.toString());
    query += ` AND block_number >= $${paramIndex}`;
    paramIndex++;
  }
  
  if (filters.toBlock !== undefined) {
    params.push(filters.toBlock.toString());
    query += ` AND block_number <= $${paramIndex}`;
    paramIndex++;
  }
  
  query += ' ORDER BY block_number DESC, id DESC';
  
  const limit = Math.min(filters.limit || 100, 1000);
  params.push(limit.toString());
  query += ` LIMIT $${paramIndex}`;
  paramIndex++;
  
  if (filters.offset) {
    params.push(filters.offset.toString());
    query += ` OFFSET $${paramIndex}`;
  }
  
  const result = await pool.query<TransferRow>(query, params);
  return result.rows;
}

export async function getCorporateActions(filters: {
  type?: string;
  limit?: number;
  offset?: number;
}) {
  let query = 'SELECT * FROM corporate_actions WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;
  
  if (filters.type) {
    params.push(filters.type);
    query += ` AND action_type = $${paramIndex}`;
    paramIndex++;
  }
  
  query += ' ORDER BY block_number DESC, id DESC';
  
  const limit = Math.min(filters.limit || 50, 500);
  params.push(limit.toString());
  query += ` LIMIT $${paramIndex}`;
  paramIndex++;
  
  if (filters.offset) {
    params.push(filters.offset.toString());
    query += ` OFFSET $${paramIndex}`;
  }
  
  const result = await pool.query<CorporateActionRow>(query, params);
  return result.rows;
}

export async function getWalletInfo(address: string) {
  const normalizedAddress = address.toLowerCase();
  
  // Get balance
  const balanceResult = await pool.query<BalanceRow>(
    'SELECT balance, updated_at FROM balances WHERE address = $1',
    [normalizedAddress]
  );
  
  // Get approval status
  const approvalResult = await pool.query<ApprovalRow>(
    'SELECT approved as is_approved, approved_at, revoked_at FROM approvals WHERE address = $1',
    [normalizedAddress]
  );
  
  // Get transfer count and dates
  const transfersResult = await pool.query<{
    count: string;
    first_transfer: Date | null;
    last_transfer: Date | null;
  }>(`
    SELECT 
      COUNT(*)::text as count,
      MIN(block_timestamp) as first_transfer,
      MAX(block_timestamp) as last_transfer
    FROM transfers
    WHERE from_address = $1 OR to_address = $1
  `, [normalizedAddress]);
  
  return {
    balance: balanceResult.rows[0] || { balance: '0', updated_at: null },
    approval: approvalResult.rows[0] || {
      is_approved: false,
      approved_at: null,
      revoked_at: null,
    },
    transfers: transfersResult.rows[0] || {
      count: '0',
      first_transfer: null,
      last_transfer: null,
    },
  };
}

export async function isWalletApproved(address: string): Promise<boolean> {
  const result = await pool.query<{ approved: boolean }>(
    'SELECT approved FROM approvals WHERE address = $1',
    [address.toLowerCase()]
  );
  
  return result.rows[0]?.approved || false;
}

export async function getHistoricalBalances(blockNumber: number) {
  // Reconstruct balances from historical transfers up to the specified block
  const result = await pool.query<{ address: string; balance: string }>(`
    WITH historical_transfers AS (
      SELECT from_address AS address, -SUM(amount::numeric) AS net_change
      FROM transfers
      WHERE block_number::numeric <= $1
        AND from_address != '0x0000000000000000000000000000000000000000'
      GROUP BY from_address
      UNION ALL
      SELECT to_address AS address, SUM(amount::numeric) AS net_change
      FROM transfers
      WHERE block_number::numeric <= $1
        AND to_address != '0x0000000000000000000000000000000000000000'
      GROUP BY to_address
    )
    SELECT 
      address,
      SUM(net_change)::text AS balance
    FROM historical_transfers
    GROUP BY address
    HAVING SUM(net_change) > 0
    ORDER BY SUM(net_change) DESC
  `, [blockNumber]);
  
  return result.rows;
}

export async function getHistoricalSplitMultiplier(blockNumber: number): Promise<bigint> {
  // Check if a stock split occurred before or at the specified block
  const result = await pool.query<{ multiplier: string }>(`
    SELECT (action_data->>'multiplier')::text as multiplier
    FROM corporate_actions
    WHERE action_type = 'split'
      AND block_number::numeric <= $1
    ORDER BY block_number DESC
    LIMIT 1
  `, [blockNumber]);
  
  if (result.rows.length > 0 && result.rows[0].multiplier) {
    return BigInt(result.rows[0].multiplier);
  }
  
  return BigInt(1); // No split occurred before this block
}

export async function getBlockTimestamp(blockNumber: number): Promise<string | null> {
  const result = await pool.query<{ block_timestamp: Date }>(`
    SELECT block_timestamp
    FROM transfers
    WHERE block_number::numeric = $1
    LIMIT 1
  `, [blockNumber]);
  
  if (result.rows.length > 0) {
    return result.rows[0].block_timestamp.toISOString();
  }
  
  return null;
}

export async function getTransfersCount(filters: {
  address?: string;
  fromBlock?: number;
  toBlock?: number;
}): Promise<number> {
  let query = 'SELECT COUNT(*) as count FROM transfers WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;
  
  if (filters.address) {
    params.push(filters.address.toLowerCase(), filters.address.toLowerCase());
    query += ` AND (from_address = $${paramIndex} OR to_address = $${paramIndex + 1})`;
    paramIndex += 2;
  }
  
  if (filters.fromBlock !== undefined) {
    params.push(filters.fromBlock.toString());
    query += ` AND block_number >= $${paramIndex}`;
    paramIndex++;
  }
  
  if (filters.toBlock !== undefined) {
    params.push(filters.toBlock.toString());
    query += ` AND block_number <= $${paramIndex}`;
    paramIndex++;
  }
  
  const result = await pool.query<{ count: string }>(query, params);
  return parseInt(result.rows[0].count, 10);
}

export async function getCapTableSnapshots() {
  // Get significant events that represent cap table changes
  // Include: ALL transfers (mints, burns, regular transfers), splits, symbol changes
  // EXCLUDE: All events before the most recent "burn all" (cap table reset)
  const result = await pool.query<{
    block_number: string;
    block_timestamp: Date;
    event_type: string;
    description: string;
  }>(`
    WITH burn_all_block AS (
      -- Find the most recent block where total supply became zero (burn all event)
      SELECT MAX(block_number::numeric) as reset_block
      FROM (
        SELECT 
          block_number,
          SUM(CASE 
            WHEN to_address = '0x0000000000000000000000000000000000000000' THEN -amount::numeric
            WHEN from_address = '0x0000000000000000000000000000000000000000' THEN amount::numeric
            ELSE 0
          END) OVER (ORDER BY block_number::numeric, transaction_hash) as running_supply
        FROM transfers
        ORDER BY block_number::numeric
      ) supply_tracking
      WHERE running_supply = 0
    ),
    significant_events AS (
      -- Get all transfers (mints, burns, and regular transfers) AFTER the reset
      SELECT DISTINCT
        t.block_number::text as block_number,
        t.block_timestamp,
        CASE 
          WHEN t.from_address = '0x0000000000000000000000000000000000000000' THEN 'mint'
          WHEN t.to_address = '0x0000000000000000000000000000000000000000' THEN 'burn'
          ELSE 'transfer'
        END as event_type,
        CASE 
          WHEN t.from_address = '0x0000000000000000000000000000000000000000' THEN 'Token Mint'
          WHEN t.to_address = '0x0000000000000000000000000000000000000000' THEN 'Token Burn'
          ELSE 'Token Transfer'
        END as description
      FROM transfers t, burn_all_block b
      WHERE (b.reset_block IS NULL OR t.block_number::numeric > b.reset_block)
        -- Exclude the burn all event itself (when supply becomes zero)
        AND NOT (
          t.to_address = '0x0000000000000000000000000000000000000000'
          AND t.block_number::numeric = b.reset_block
        )
      
      UNION ALL
      
      -- Get stock splits AFTER the reset
      SELECT
        ca.block_number::text as block_number,
        ca.block_timestamp,
        'split' as event_type,
        'Stock Split (' || (ca.action_data->>'multiplier') || ':1)' as description
      FROM corporate_actions ca, burn_all_block b
      WHERE ca.action_type = 'split'
        AND (b.reset_block IS NULL OR ca.block_number::numeric > b.reset_block)
      
      UNION ALL
      
      -- Get symbol changes AFTER the reset
      SELECT
        ca.block_number::text as block_number,
        ca.block_timestamp,
        'symbol_change' as event_type,
        'Symbol Change' as description
      FROM corporate_actions ca, burn_all_block b
      WHERE ca.action_type = 'symbol_change'
        AND (b.reset_block IS NULL OR ca.block_number::numeric > b.reset_block)
    )
    SELECT 
      block_number,
      block_timestamp,
      event_type,
      description
    FROM significant_events
    ORDER BY block_number::numeric DESC, block_timestamp DESC
    LIMIT 50
  `);
  
  return result.rows.map(row => ({
    blockNumber: parseInt(row.block_number, 10),
    timestamp: row.block_timestamp.toISOString(),
    eventType: row.event_type,
    description: row.description,
  }));
}


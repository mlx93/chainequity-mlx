import { publicClient } from './config/viem';
import { env } from './config/env';
import GatedTokenABI from './abis/GatedToken.json';
import {
  processTransferEvent,
  processWalletApprovedEvent,
  processWalletRevokedEvent,
  processStockSplitEvent,
  processSymbolChangedEvent,
  processTokensMintedEvent,
  processTokensBurnedEvent,
} from './services/eventProcessor';
import { initializeSchema } from './db/initSchema';

const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as `0x${string}`;

async function startIndexer() {
  console.log('🚀 ChainEquity Event Indexer Starting...');
  console.log(`📜 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`📊 Starting from block: ${env.START_BLOCK}`);
  console.log(`⛓️  Chain ID: ${env.CHAIN_ID}`);

  try {
    // Initialize database schema on startup
    await initializeSchema();
    console.log('✅ Database schema ready');

    // Get current block
    const currentBlock = await publicClient.getBlockNumber();
    console.log(`⛓️  Current block: ${currentBlock}`);

    // Backfill historical events
    if (env.START_BLOCK < currentBlock) {
      console.log('⏪ Backfilling historical events...');
      await backfillEvents(BigInt(env.START_BLOCK), currentBlock);
      console.log('✅ Backfill complete');
    }

    // Watch for new events
    console.log('👀 Watching for new events...');

    // Watch Transfer events
    publicClient.watchEvent({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: false, name: 'value' },
        ],
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
            await processTransferEvent(log, block.timestamp);
          } catch (error) {
            console.error('Error processing Transfer event:', error);
          }
        }
      },
    });

    // Watch WalletApproved events
    publicClient.watchEvent({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'WalletApproved',
        inputs: [
          { type: 'address', indexed: true, name: 'wallet' },
          { type: 'uint256', indexed: false, name: 'timestamp' },
        ],
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
            await processWalletApprovedEvent(log, block.timestamp);
          } catch (error) {
            console.error('Error processing WalletApproved event:', error);
          }
        }
      },
    });

    // Watch WalletRevoked events
    publicClient.watchEvent({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'WalletRevoked',
        inputs: [
          { type: 'address', indexed: true, name: 'wallet' },
          { type: 'uint256', indexed: false, name: 'timestamp' },
        ],
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
            await processWalletRevokedEvent(log, block.timestamp);
          } catch (error) {
            console.error('Error processing WalletRevoked event:', error);
          }
        }
      },
    });

    // Watch StockSplit events
    publicClient.watchEvent({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'StockSplit',
        inputs: [
          { type: 'uint256', indexed: false, name: 'multiplier' },
          { type: 'uint256', indexed: false, name: 'newTotalSupply' },
          { type: 'uint256', indexed: false, name: 'timestamp' },
        ],
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
            await processStockSplitEvent(log, block.timestamp);
          } catch (error) {
            console.error('Error processing StockSplit event:', error);
          }
        }
      },
    });

    // Watch SymbolChanged events
    publicClient.watchEvent({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'SymbolChanged',
        inputs: [
          { type: 'string', indexed: false, name: 'oldSymbol' },
          { type: 'string', indexed: false, name: 'newSymbol' },
          { type: 'uint256', indexed: false, name: 'timestamp' },
        ],
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
            await processSymbolChangedEvent(log, block.timestamp);
          } catch (error) {
            console.error('Error processing SymbolChanged event:', error);
          }
        }
      },
    });

    // Watch TokensMinted events (optional, as Transfer covers this)
    publicClient.watchEvent({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'TokensMinted',
        inputs: [
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: false, name: 'amount' },
          { type: 'address', indexed: true, name: 'minter' },
        ],
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
            await processTokensMintedEvent(log, block.timestamp);
          } catch (error) {
            console.error('Error processing TokensMinted event:', error);
          }
        }
      },
    });

    // Watch TokensBurned events (optional, as Transfer covers this)
    publicClient.watchEvent({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'TokensBurned',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'uint256', indexed: false, name: 'amount' },
          { type: 'address', indexed: true, name: 'burner' },
        ],
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
            await processTokensBurnedEvent(log, block.timestamp);
          } catch (error) {
            console.error('Error processing TokensBurned event:', error);
          }
        }
      },
    });

    console.log('✅ Indexer running');
    console.log('📡 Listening for blockchain events...\n');
  } catch (error) {
    console.error('❌ Failed to start indexer:', error);
    process.exit(1);
  }
}

/**
 * Chunk block range into batches of maxBlockRange size to respect RPC limits
 */
function chunkBlockRange(fromBlock: bigint, toBlock: bigint, maxBlockRange: bigint = BigInt(100000)): Array<{ from: bigint; to: bigint }> {
  const chunks: Array<{ from: bigint; to: bigint }> = [];
  let current = fromBlock;
  
  while (current < toBlock) {
    const chunkEnd = current + maxBlockRange - BigInt(1);
    const end = chunkEnd > toBlock ? toBlock : chunkEnd;
    chunks.push({ from: current, to: end });
    current = end + BigInt(1);
  }
  
  return chunks;
}

async function backfillEvents(fromBlock: bigint, toBlock: bigint) {
  const totalBlocks = Number(toBlock - fromBlock);
  console.log(`📥 Fetching events from block ${fromBlock} to ${toBlock} (${totalBlocks.toLocaleString()} blocks)...`);

  // Chunk the range into batches of 100,000 blocks (RPC limit)
  const MAX_BLOCK_RANGE = BigInt(100000);
  const chunks = chunkBlockRange(fromBlock, toBlock, MAX_BLOCK_RANGE);
  console.log(`📦 Processing in ${chunks.length} batch(es) of up to ${MAX_BLOCK_RANGE.toLocaleString()} blocks each...`);

  let totalTransferEvents = 0;
  let totalApprovalEvents = 0;
  let totalRevokedEvents = 0;
  let totalSplitEvents = 0;
  let totalSymbolEvents = 0;
  let totalMintedEvents = 0;
  let totalBurnedEvents = 0;

  try {
    // Process each chunk sequentially
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkSize = Number(chunk.to - chunk.from + BigInt(1));
      console.log(`\n📦 Processing batch ${i + 1}/${chunks.length} (blocks ${chunk.from} to ${chunk.to}, ${chunkSize.toLocaleString()} blocks)...`);

      // Fetch all historical Transfer events for this chunk
      const transferLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', indexed: true, name: 'from' },
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: false, name: 'value' },
          ],
        },
        fromBlock: chunk.from,
        toBlock: chunk.to,
      });

      console.log(`  📥 Found ${transferLogs.length} Transfer events in this batch`);
      totalTransferEvents += transferLogs.length;

      for (const log of transferLogs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
          await processTransferEvent(log as any, block.timestamp);
        } catch (error) {
          console.error(`Error processing Transfer at block ${log.blockNumber}:`, error);
        }
      }

      // Fetch all WalletApproved events for this chunk
      const approvalLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'WalletApproved',
          inputs: [
            { type: 'address', indexed: true, name: 'wallet' },
            { type: 'uint256', indexed: false, name: 'timestamp' },
          ],
        },
        fromBlock: chunk.from,
        toBlock: chunk.to,
      });

      console.log(`  📥 Found ${approvalLogs.length} WalletApproved events in this batch`);
      totalApprovalEvents += approvalLogs.length;

      for (const log of approvalLogs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
          await processWalletApprovedEvent(log as any, block.timestamp);
        } catch (error) {
          console.error(`Error processing WalletApproved at block ${log.blockNumber}:`, error);
        }
      }

      // Fetch all WalletRevoked events for this chunk
      const revokedLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'WalletRevoked',
          inputs: [
            { type: 'address', indexed: true, name: 'wallet' },
            { type: 'uint256', indexed: false, name: 'timestamp' },
          ],
        },
        fromBlock: chunk.from,
        toBlock: chunk.to,
      });

      console.log(`  📥 Found ${revokedLogs.length} WalletRevoked events in this batch`);
      totalRevokedEvents += revokedLogs.length;

      for (const log of revokedLogs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
          await processWalletRevokedEvent(log as any, block.timestamp);
        } catch (error) {
          console.error(`Error processing WalletRevoked at block ${log.blockNumber}:`, error);
        }
      }

      // Fetch all StockSplit events for this chunk
      const splitLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'StockSplit',
          inputs: [
            { type: 'uint256', indexed: false, name: 'multiplier' },
            { type: 'uint256', indexed: false, name: 'newTotalSupply' },
            { type: 'uint256', indexed: false, name: 'timestamp' },
          ],
        },
        fromBlock: chunk.from,
        toBlock: chunk.to,
      });

      console.log(`  📥 Found ${splitLogs.length} StockSplit events in this batch`);
      totalSplitEvents += splitLogs.length;

      for (const log of splitLogs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
          await processStockSplitEvent(log as any, block.timestamp);
        } catch (error) {
          console.error(`Error processing StockSplit at block ${log.blockNumber}:`, error);
        }
      }

      // Fetch all SymbolChanged events for this chunk
      const symbolLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'SymbolChanged',
          inputs: [
            { type: 'string', indexed: false, name: 'oldSymbol' },
            { type: 'string', indexed: false, name: 'newSymbol' },
            { type: 'uint256', indexed: false, name: 'timestamp' },
          ],
        },
        fromBlock: chunk.from,
        toBlock: chunk.to,
      });

      console.log(`  📥 Found ${symbolLogs.length} SymbolChanged events in this batch`);
      totalSymbolEvents += symbolLogs.length;

      for (const log of symbolLogs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
          await processSymbolChangedEvent(log as any, block.timestamp);
        } catch (error) {
          console.error(`Error processing SymbolChanged at block ${log.blockNumber}:`, error);
        }
      }

      // Fetch all TokensMinted events for this chunk
      const mintedLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'TokensMinted',
          inputs: [
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: false, name: 'amount' },
            { type: 'address', indexed: true, name: 'minter' },
          ],
        },
        fromBlock: chunk.from,
        toBlock: chunk.to,
      });

      console.log(`  📥 Found ${mintedLogs.length} TokensMinted events in this batch`);
      totalMintedEvents += mintedLogs.length;

      for (const log of mintedLogs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
          await processTokensMintedEvent(log as any, block.timestamp);
        } catch (error) {
          console.error(`Error processing TokensMinted at block ${log.blockNumber}:`, error);
        }
      }

      // Fetch all TokensBurned events for this chunk
      const burnedLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'TokensBurned',
          inputs: [
            { type: 'address', indexed: true, name: 'from' },
            { type: 'uint256', indexed: false, name: 'amount' },
            { type: 'address', indexed: true, name: 'burner' },
          ],
        },
        fromBlock: chunk.from,
        toBlock: chunk.to,
      });

      console.log(`  📥 Found ${burnedLogs.length} TokensBurned events in this batch`);
      totalBurnedEvents += burnedLogs.length;

      for (const log of burnedLogs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
          await processTokensBurnedEvent(log as any, block.timestamp);
        } catch (error) {
          console.error(`Error processing TokensBurned at block ${log.blockNumber}:`, error);
        }
      }

      // Small delay between chunks to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }
    }

    console.log('\n✅ Historical events processed');
    console.log(`📊 Summary:`);
    console.log(`   - Transfer events: ${totalTransferEvents}`);
    console.log(`   - WalletApproved events: ${totalApprovalEvents}`);
    console.log(`   - WalletRevoked events: ${totalRevokedEvents}`);
    console.log(`   - StockSplit events: ${totalSplitEvents}`);
    console.log(`   - SymbolChanged events: ${totalSymbolEvents}`);
    console.log(`   - TokensMinted events: ${totalMintedEvents}`);
    console.log(`   - TokensBurned events: ${totalBurnedEvents}`);
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    throw error;
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down indexer...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down indexer...');
  process.exit(0);
});

// Start the indexer
startIndexer().catch((error) => {
  console.error('❌ Indexer failed to start:', error);
  process.exit(1);
});


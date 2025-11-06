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

const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as `0x${string}`;

async function startIndexer() {
  console.log('🚀 ChainEquity Event Indexer Starting...');
  console.log(`📜 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`📊 Starting from block: ${env.START_BLOCK}`);
  console.log(`⛓️  Chain ID: ${env.CHAIN_ID}`);

  try {
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
 * Backfill historical events from the blockchain
 */
async function backfillEvents(fromBlock: bigint, toBlock: bigint) {
  console.log(`📥 Fetching events from block ${fromBlock} to ${toBlock}...`);

  try {
    // Fetch all historical Transfer events
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
      fromBlock,
      toBlock,
    });

    console.log(`📥 Found ${transferLogs.length} Transfer events`);

    for (const log of transferLogs) {
      try {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processTransferEvent(log as any, block.timestamp);
      } catch (error) {
        console.error(`Error processing Transfer at block ${log.blockNumber}:`, error);
      }
    }

    // Fetch all WalletApproved events
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
      fromBlock,
      toBlock,
    });

    console.log(`📥 Found ${approvalLogs.length} WalletApproved events`);

    for (const log of approvalLogs) {
      try {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processWalletApprovedEvent(log as any, block.timestamp);
      } catch (error) {
        console.error(`Error processing WalletApproved at block ${log.blockNumber}:`, error);
      }
    }

    // Fetch all WalletRevoked events
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
      fromBlock,
      toBlock,
    });

    console.log(`📥 Found ${revokedLogs.length} WalletRevoked events`);

    for (const log of revokedLogs) {
      try {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processWalletRevokedEvent(log as any, block.timestamp);
      } catch (error) {
        console.error(`Error processing WalletRevoked at block ${log.blockNumber}:`, error);
      }
    }

    // Fetch all StockSplit events
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
      fromBlock,
      toBlock,
    });

    console.log(`📥 Found ${splitLogs.length} StockSplit events`);

    for (const log of splitLogs) {
      try {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processStockSplitEvent(log as any, block.timestamp);
      } catch (error) {
        console.error(`Error processing StockSplit at block ${log.blockNumber}:`, error);
      }
    }

    // Fetch all SymbolChanged events
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
      fromBlock,
      toBlock,
    });

    console.log(`📥 Found ${symbolLogs.length} SymbolChanged events`);

    for (const log of symbolLogs) {
      try {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processSymbolChangedEvent(log as any, block.timestamp);
      } catch (error) {
        console.error(`Error processing SymbolChanged at block ${log.blockNumber}:`, error);
      }
    }

    console.log('✅ Historical events processed');
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


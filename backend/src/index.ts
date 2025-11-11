import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import healthRouter from './routes/health';
import dataRouter from './routes/data';
import transactionsRouter from './routes/transactions';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api', dataRouter);
app.use('/api', transactionsRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = parseInt(env.PORT, 10);
app.listen(PORT, () => {
  console.log(`🚀 ChainEquity Backend API running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`⛓️  Network: Base Sepolia (Chain ID: ${env.CHAIN_ID})`);
  console.log(`📜 Contract: ${env.CONTRACT_ADDRESS}`);
});





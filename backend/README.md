# ChainEquity Backend API

Express/TypeScript REST API for ChainEquity cap-table queries and transaction submission.

## Features

- **Cap Table Queries**: Fast queries against PostgreSQL database (indexed by Phase 2B Indexer)
- **Transaction Submission**: Submit blockchain transactions via viem
- **Comprehensive Validation**: Request validation using zod
- **Error Handling**: Graceful error handling with detailed responses

## API Endpoints

### Data Endpoints (GET)

- `GET /api/health` - Service health check
- `GET /api/cap-table` - Current token balances for all holders
- `GET /api/transfers` - Transfer history with filters
- `GET /api/corporate-actions` - Stock splits, symbol changes, mints, burns
- `GET /api/wallet/:address` - Detailed wallet information

### Transaction Endpoints (POST)

- `POST /api/transfer` - Submit token transfer
- `POST /api/admin/approve-wallet` - Approve wallet for transfers
- `POST /api/admin/revoke-wallet` - Revoke wallet approval
- `POST /api/admin/stock-split` - Execute stock split
- `POST /api/admin/update-symbol` - Update token symbol

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (populated by Phase 2B Indexer)
- Valid `.env` file

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (PUBLIC URL)
- `BASE_SEPOLIA_RPC` - Base Sepolia RPC endpoint
- `CONTRACT_ADDRESS` - Deployed GatedToken contract address
- `CHAIN_ID` - Base Sepolia chain ID (84532)
- `ADMIN_PRIVATE_KEY` - Admin wallet private key (for transaction signing)
- `ADMIN_ADDRESS` - Admin wallet address

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Testing

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Cap Table

```bash
curl http://localhost:3000/api/cap-table
```

### Transfer History

```bash
curl http://localhost:3000/api/transfers?limit=10
```

### Wallet Info

```bash
curl http://localhost:3000/api/wallet/0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Express server entry point
│   ├── config/
│   │   ├── env.ts              # Environment variable validation
│   │   ├── database.ts         # PostgreSQL connection pool
│   │   └── viem.ts             # Blockchain client setup
│   ├── abis/
│   │   └── GatedToken.json     # Contract ABI
│   ├── routes/
│   │   ├── health.ts           # Health check endpoint
│   │   ├── data.ts             # GET endpoints (cap-table, transfers, etc.)
│   │   └── transactions.ts     # POST endpoints (submit txns)
│   ├── services/
│   │   ├── database.service.ts # Database queries
│   │   └── blockchain.service.ts # Transaction submission
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── middleware/
│       ├── errorHandler.ts     # Global error handling
│       └── validation.ts       # Request validation
├── package.json
├── tsconfig.json
├── .env                        # Environment variables (not in git)
└── README.md
```

## Deployment to Railway

See `PHASE2A_BACKEND_SPECIALIST_PROMPT.md` for detailed deployment instructions.

## License

MIT


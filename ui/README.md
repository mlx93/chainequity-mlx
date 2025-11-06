# ChainEquity Frontend

React + Vite + wagmi frontend for the ChainEquity tokenized security prototype.

## Features

- ✅ Wallet connection via MetaMask (Base Sepolia)
- ✅ Admin dashboard for wallet approvals, minting, and corporate actions
- ✅ Investor view with balance display and token transfers
- ✅ Real-time cap table with CSV/JSON export
- ✅ Transaction history with filtering
- ✅ Client-side validation to prevent failed transactions

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **wagmi** - Ethereum React hooks
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Sonner** - Toast notifications

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file with:

```bash
VITE_CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
VITE_SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
VITE_BACKEND_URL=https://tender-achievement-production-3aa5.up.railway.app/api
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_CHAIN_ID=84532
```

## Deployment

The app is configured for Vercel deployment:

1. Connect GitHub repository to Vercel
2. Set root directory to `ui/`
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
ui/
├── src/
│   ├── components/
│   │   ├── admin/        # Admin components (approval, mint, corporate actions)
│   │   ├── investor/     # Investor components (balance, transfer)
│   │   ├── captable/    # Cap table components (grid, export)
│   │   ├── layout/      # Layout components (header, layout)
│   │   ├── transactions/# Transaction history component
│   │   └── ui/          # shadcn/ui components
│   ├── config/          # Configuration (wagmi, contracts, API)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and API client
│   ├── pages/           # Page components
│   └── types/           # TypeScript types
├── public/
└── package.json
```

## Pages

- `/` - Admin Dashboard (redirects non-admins to `/investor`)
- `/investor` - Investor View (balance, transfers, transaction history)
- `/captable` - Cap Table (all token holders with export functionality)

## Admin Functions

- Approve/revoke wallets
- Mint tokens to approved wallets
- Execute stock splits
- Change token symbol

All admin functions require admin wallet addresses configured in `src/config/contracts.ts`.

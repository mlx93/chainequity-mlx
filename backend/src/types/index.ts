// Database row types
export interface TransferRow {
  id: number;
  transaction_hash: string;
  block_number: string; // BigInt as string
  block_timestamp: Date;
  from_address: string;
  to_address: string;
  amount: string; // BigInt as string
  created_at: Date;
}

export interface BalanceRow {
  address: string;
  balance: string; // BigInt as string
  updated_at: Date;
}

export interface ApprovalRow {
  address: string;
  is_approved: boolean;
  approved_at: Date | null;
  revoked_at: Date | null;
  updated_at: Date;
}

export interface CorporateActionRow {
  id: number;
  action_type: string;
  transaction_hash: string;
  block_number: string; // BigInt as string
  block_timestamp: Date;
  details: Record<string, any>; // JSONB
  created_at: Date;
}

// API response types
export interface CapTableEntry {
  address: string;
  balance: string;
  balanceFormatted: string;
  percentage: string;
  lastUpdated: string;
}

export interface TransferResponse {
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: string;
  from: string;
  to: string;
  amount: string;
  amountFormatted: string;
  type: 'mint' | 'burn' | 'transfer';
}

export interface CorporateActionResponse {
  id: number;
  actionType: string;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: string;
  details: Record<string, any>;
}

export interface WalletInfo {
  address: string;
  balance: string;
  balanceFormatted: string;
  isApproved: boolean;
  approvedAt: string | null;
  transferCount: number;
  firstTransferAt: string | null;
  lastTransferAt: string | null;
}





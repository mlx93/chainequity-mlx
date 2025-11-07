export interface CapTableEntry {
  address: string
  balance: string
  balanceFormatted: string
  percentage: string
  lastUpdated?: string
}

export interface CapTableResponse {
  totalSupply: string
  totalHolders: number
  blockNumber?: number
  timestamp: string
  capTable: CapTableEntry[]
  splitMultiplier?: number
}

export interface HistoricalCapTableResponse {
  blockNumber: number
  timestamp: string
  totalSupply: string
  holderCount: number
  splitMultiplier: number
  capTable: CapTableEntry[]
}

export interface CapTableSnapshot {
  blockNumber: number
  timestamp: string
  eventType: string
  description: string
}

export interface Transfer {
  transactionHash: string
  blockNumber: number
  blockTimestamp: string
  from: string
  to: string
  amount: string
  amountFormatted: string
  type: 'mint' | 'transfer' | 'burn'
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalRecords: number
  limit: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface TransfersResponse {
  transfers: Transfer[]
  pagination: PaginationInfo
  timestamp: string
}

export interface CorporateAction {
  id: number
  transactionHash: string
  blockNumber: number
  timestamp: string
  actionType: 'split' | 'symbol_change' | 'mint' | 'burn'
  data: Record<string, unknown>
}

export interface CorporateActionsResponse {
  actions: CorporateAction[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export interface WalletInfo {
  address: string
  balance: string
  isApproved: boolean
  approvedAt?: string
  revokedAt?: string
  transferCount: number
}

export interface TransactionResponse {
  success: boolean
  transactionHash: string
  from?: string
  to?: string
  amount?: string
  multiplier?: number
  oldSymbol?: string
  newSymbol?: string
  blockExplorerUrl: string
  message: string
  timestamp: string
}

export interface HealthResponse {
  status: string
  database: {
    connected: boolean
  }
  blockchain: {
    connected: boolean
    chainId: number
    blockNumber: number
  }
  timestamp: string
}


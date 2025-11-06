export interface CapTableEntry {
  address: string
  balance: string
  ownershipPercent: string
}

export interface CapTableResponse {
  totalSupply: string
  holderCount: number
  blockNumber: number
  timestamp: string
  capTable: CapTableEntry[]
}

export interface Transfer {
  transactionHash: string
  blockNumber: number
  timestamp: string
  from: string
  to: string
  amount: string
  eventType: 'mint' | 'transfer' | 'burn'
}

export interface TransfersResponse {
  transfers: Transfer[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
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


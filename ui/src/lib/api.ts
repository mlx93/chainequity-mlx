import { API_BASE } from '@/config/api'
import type {
  CapTableResponse,
  HistoricalCapTableResponse,
  CapTableSnapshot,
  TransfersResponse,
  CorporateActionsResponse,
  WalletInfo,
  TransactionResponse,
  HealthResponse,
} from '@/types'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export async function getHealth(): Promise<HealthResponse> {
  return fetchAPI<HealthResponse>('/health')
}

export async function getCapTable(): Promise<CapTableResponse> {
  return fetchAPI<CapTableResponse>('/cap-table')
}

export async function getCapTableSnapshots(): Promise<{ snapshots: CapTableSnapshot[] }> {
  return fetchAPI<{ snapshots: CapTableSnapshot[] }>('/cap-table/snapshots')
}

export async function getHistoricalCapTable(blockNumber: number): Promise<HistoricalCapTableResponse> {
  return fetchAPI<HistoricalCapTableResponse>(`/cap-table/historical?blockNumber=${blockNumber}`)
}

export async function getTransfers(params?: {
  address?: string
  page?: number
  limit?: number
  fromBlock?: number
  toBlock?: number
}): Promise<TransfersResponse> {
  const searchParams = new URLSearchParams()
  if (params?.address) searchParams.append('address', params.address)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.fromBlock) searchParams.append('fromBlock', params.fromBlock.toString())
  if (params?.toBlock) searchParams.append('toBlock', params.toBlock.toString())

  const query = searchParams.toString()
  return fetchAPI<TransfersResponse>(`/transfers${query ? `?${query}` : ''}`)
}

export async function getCorporateActions(params?: {
  type?: string
  limit?: number
  offset?: number
}): Promise<CorporateActionsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.type) searchParams.append('type', params.type)
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.offset) searchParams.append('offset', params.offset.toString())

  const query = searchParams.toString()
  return fetchAPI<CorporateActionsResponse>(`/corporate-actions${query ? `?${query}` : ''}`)
}

export async function getWalletInfo(address: string): Promise<WalletInfo> {
  return fetchAPI<WalletInfo>(`/wallet/${address}`)
}

export async function submitTransfer(to: string, amount: string): Promise<TransactionResponse> {
  return fetchAPI<TransactionResponse>('/transfer', {
    method: 'POST',
    body: JSON.stringify({ to, amount }),
  })
}

export async function approveWallet(address: string): Promise<TransactionResponse> {
  return fetchAPI<TransactionResponse>('/admin/approve-wallet', {
    method: 'POST',
    body: JSON.stringify({ address }),
  })
}

export async function revokeWallet(address: string): Promise<TransactionResponse> {
  return fetchAPI<TransactionResponse>('/admin/revoke-wallet', {
    method: 'POST',
    body: JSON.stringify({ address }),
  })
}

export async function mintTokens(to: string, amount: string): Promise<TransactionResponse> {
  return fetchAPI<TransactionResponse>('/admin/mint', {
    method: 'POST',
    body: JSON.stringify({ to, amount }),
  })
}

export async function executeStockSplit(multiplier: number): Promise<TransactionResponse> {
  return fetchAPI<TransactionResponse>('/admin/stock-split', {
    method: 'POST',
    body: JSON.stringify({ multiplier }),
  })
}

export async function updateSymbol(newSymbol: string): Promise<TransactionResponse> {
  return fetchAPI<TransactionResponse>('/admin/update-symbol', {
    method: 'POST',
    body: JSON.stringify({ newSymbol }),
  })
}

export async function burnAllTokens(): Promise<{ success: boolean; transactions: string[]; message: string }> {
  return fetchAPI<{ success: boolean; transactions: string[]; message: string }>('/admin/burn-all', {
    method: 'POST',
  })
}


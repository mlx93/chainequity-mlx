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
    'SELECT is_approved, approved_at, revoked_at FROM approvals WHERE address = $1',
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
  const result = await pool.query<ApprovalRow>(
    'SELECT is_approved FROM approvals WHERE address = $1',
    [address.toLowerCase()]
  );
  
  return result.rows[0]?.is_approved || false;
}


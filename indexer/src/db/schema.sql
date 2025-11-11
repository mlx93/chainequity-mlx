-- ChainEquity Event Indexer Database Schema
-- PostgreSQL Database Schema for indexing GatedToken contract events

-- Table 1: transfers
-- Stores all transfer events (including mints and burns)
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    event_type VARCHAR(20) NOT NULL, -- 'mint', 'transfer', 'burn'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transfers_block_number ON transfers(block_number);
CREATE INDEX IF NOT EXISTS idx_transfers_from_address ON transfers(from_address);
CREATE INDEX IF NOT EXISTS idx_transfers_to_address ON transfers(to_address);
CREATE INDEX IF NOT EXISTS idx_transfers_timestamp ON transfers(block_timestamp);

-- Table 2: balances
-- Maintains current balance for each address
CREATE TABLE IF NOT EXISTS balances (
    address VARCHAR(42) PRIMARY KEY,
    balance NUMERIC(78, 0) NOT NULL DEFAULT 0,
    ownership_percent DECIMAL(5, 2),
    last_updated_block BIGINT NOT NULL,
    last_updated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: approvals
-- Tracks wallet approval/revocation status
CREATE TABLE IF NOT EXISTS approvals (
    address VARCHAR(42) PRIMARY KEY,
    approved BOOLEAN NOT NULL DEFAULT false,
    approved_at TIMESTAMP,
    approved_at_block BIGINT,
    revoked_at TIMESTAMP,
    revoked_at_block BIGINT,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_approved ON approvals(approved);

-- Table 4: corporate_actions
-- Records stock splits and symbol changes
CREATE TABLE IF NOT EXISTS corporate_actions (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    action_type VARCHAR(20) NOT NULL, -- 'split', 'symbol_change'
    action_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_actions_block_number ON corporate_actions(block_number);
CREATE INDEX IF NOT EXISTS idx_corporate_actions_type ON corporate_actions(action_type);





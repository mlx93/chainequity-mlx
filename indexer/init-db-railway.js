#!/usr/bin/env node

/**
 * Railway Database Schema Initialization Script
 * Run this directly on Railway to create tables
 */

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

async function initializeSchema() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create transfers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id SERIAL PRIMARY KEY,
        transaction_hash TEXT NOT NULL UNIQUE,
        block_number BIGINT NOT NULL,
        block_timestamp TIMESTAMP NOT NULL,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        amount TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created transfers table');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transfers_from ON transfers(from_address);
      CREATE INDEX IF NOT EXISTS idx_transfers_to ON transfers(to_address);
      CREATE INDEX IF NOT EXISTS idx_transfers_block ON transfers(block_number);
    `);
    console.log('✅ Created transfers indexes');

    // Create balances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS balances (
        address TEXT PRIMARY KEY,
        balance TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created balances table');

    // Create approvals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS approvals (
        address TEXT PRIMARY KEY,
        is_approved BOOLEAN NOT NULL,
        approved_at TIMESTAMP,
        revoked_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created approvals table');

    // Create corporate_actions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS corporate_actions (
        id SERIAL PRIMARY KEY,
        action_type TEXT NOT NULL,
        transaction_hash TEXT NOT NULL UNIQUE,
        block_number BIGINT NOT NULL,
        block_timestamp TIMESTAMP NOT NULL,
        details JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created corporate_actions table');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_corporate_actions_type ON corporate_actions(action_type);
      CREATE INDEX IF NOT EXISTS idx_corporate_actions_block ON corporate_actions(block_number);
    `);
    console.log('✅ Created corporate_actions indexes');

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Database tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n🎉 Database schema initialized successfully!');

  } catch (error) {
    console.error('❌ Schema initialization failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeSchema();


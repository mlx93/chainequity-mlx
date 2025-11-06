import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

async function initializeSchema() {
  try {
    console.log('📦 Initializing database schema...');
    
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );

    await pool.query(schemaSQL);
    console.log('✅ Database schema initialized successfully');
    
    // Test query
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:', result.rows.map(r => r.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Schema initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeSchema();


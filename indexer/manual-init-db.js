// Manual database initialization using PUBLIC database URL
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const PUBLIC_DATABASE_URL = 'postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@nozomi.proxy.rlwy.net:25369/railway';

async function initDatabase() {
  const pool = new Pool({
    connectionString: PUBLIC_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Railway's SSL connection
    }
  });

  try {
    console.log('🔌 Connecting to Railway database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully');

    // Read schema SQL
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'src/db/schema.sql'),
      'utf-8'
    );

    console.log('📦 Initializing database schema...');
    await pool.query(schemaSQL);
    console.log('✅ Database schema initialized successfully');

    // Verify tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Created tables:', result.rows.map(r => r.table_name).join(', '));
    console.log('\n✅ Database initialization complete!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();





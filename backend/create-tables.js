// Script to create database tables
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createTables() {
  try {
    console.log('Creating database tables...\n');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'create-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute SQL
    await pool.query(sql);

    console.log('✅ Tables created successfully!');
    console.log('✅ users table created');
    console.log('✅ tasks table created');
    console.log('✅ Indexes created');
    console.log('✅ Triggers created\n');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'tasks')
    `);

    console.log('📋 Verification:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name} table exists`);
    });

    console.log('\n🎉 Database setup complete! You can now register users.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

createTables();


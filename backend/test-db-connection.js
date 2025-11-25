// Quick database connection test
const pool = require('./config/database');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Database config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });

    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].now);

    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📋 Existing tables:');
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found! You need to run the migration.');
      console.log('Run: psql -U postgres -d larklabs -f database/migrations/001_initial_schema.sql');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name}`);
      });
    }

    // Check if users table exists
    const usersTableExists = tablesResult.rows.some(row => row.table_name === 'users');
    const tasksTableExists = tablesResult.rows.some(row => row.table_name === 'tasks');

    if (!usersTableExists || !tasksTableExists) {
      console.log('\n⚠️  Missing tables!');
      if (!usersTableExists) console.log('  ❌ users table missing');
      if (!tasksTableExists) console.log('  ❌ tasks table missing');
      console.log('\nPlease run the migration SQL file.');
    } else {
      console.log('\n✅ All required tables exist!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. PostgreSQL is not running');
    console.error('2. Database "larklabs" does not exist');
    console.error('3. Wrong credentials in .env file');
    console.error('4. Wrong host/port in .env file');
    process.exit(1);
  }
}

testConnection();


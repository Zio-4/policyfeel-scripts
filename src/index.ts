import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Configure connection to Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // You might want to set this to true in production
  }
});

async function main() {
  try {
    // Simple connection test
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Connected to Neon database:', result.rows[0]);
    
    // Your operations here...
    
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    // Close pool when done with all operations
    await pool.end();
  }
}

main().catch(console.error);

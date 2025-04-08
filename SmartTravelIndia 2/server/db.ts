import pg from 'pg';
const { Pool } = pg;

// Create a new PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the database connection
pool.connect()
  .then(client => {
    console.log('Database connection successful');
    client.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
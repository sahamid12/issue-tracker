import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'agency_user',               // DB username
  host: 'localhost',                 // Host
  database: 'agency_db',            // Your database name
  password: 'CanadaAmerica12@#',       // Your password
  port: 5432,                        // Default PostgreSQL port
});

export default pool;

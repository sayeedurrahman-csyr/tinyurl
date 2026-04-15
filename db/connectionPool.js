const mysql = require('mysql2');

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.VPS_IP,
  user: process.env.VPS_DB_USER,
  password: process.env.VPS_DB_PASSWORD,
  database: 'tinyurl',
  waitForConnections: true,
  connectionLimit: 10, // Max number of concurrent connections
  queueLimit: 0
});
// const pool = mysql.createPool(process.env.TIDB_URI);

const promisePool = pool.promise();

module.exports = promisePool;
const mysql = require('mysql2');

// Create the connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'tinyurl',
  waitForConnections: true,
  connectionLimit: 10, // Max number of concurrent connections
  queueLimit: 0
});

const promisePool = pool.promise();

module.exports = promisePool;
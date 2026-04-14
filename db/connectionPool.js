const mysql = require('mysql2');

// Create the connection pool
const pool = mysql.createPool({
  host: '103.174.51.157',
  user: 'render',
  password: 'render',
  database: 'tinyurl',
  waitForConnections: true,
  connectionLimit: 10, // Max number of concurrent connections
  queueLimit: 0
});
// const pool = mysql.createPool('mysql://2yXMAp3zmNhv22q.root:zIq5i75qGy3GzRfn@gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com:4000/test?ssl={"rejectUnauthorized":true}');

const promisePool = pool.promise();

module.exports = promisePool;
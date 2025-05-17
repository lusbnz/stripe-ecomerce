import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '12345678',
  database: process.env.MYSQL_DATABASE || 'ecom',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

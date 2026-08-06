const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "electricpulse",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00"
});

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result;
};

const initSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(160) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL,
      role VARCHAR(60) DEFAULT 'admin',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      description TEXT,
      icon VARCHAR(60),
      color VARCHAR(30),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS artists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(140) NOT NULL,
      genre VARCHAR(60),
      instagram VARCHAR(100),
      activeEvents INT DEFAULT 0,
      avatarIndex TINYINT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      artist VARCHAR(140) NOT NULL,
      category VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(10),
      location VARCHAR(180) NOT NULL,
      ticketPrice DECIMAL(12,2) DEFAULT 0,
      quota INT DEFAULT 0,
      sold INT DEFAULT 0,
      status VARCHAR(30) DEFAULT 'ACTIVE',
      poster VARCHAR(255),
      banner VARCHAR(255),
      description TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      orderId VARCHAR(40) PRIMARY KEY,
      user VARCHAR(120) NOT NULL,
      avatar VARCHAR(20),
      event VARCHAR(180) NOT NULL,
      totalBayar DECIMAL(14,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'PENDING',
      transferSlip BOOLEAN DEFAULT FALSE,
      verifiedAt DATETIME NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@electricpulse.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const [rows] = await query("SELECT id FROM users WHERE email = ?", [adminEmail]);
  if (!rows.length) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await query("INSERT INTO users (email, passwordHash, role) VALUES (?, ?, 'Master Admin')", [adminEmail, passwordHash]);
    console.info(`Admin user created: ${adminEmail}`);
  }
};

module.exports = {
  pool,
  query,
  execute,
  initSchema
};

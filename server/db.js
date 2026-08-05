const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : undefined,
  database: process.env.DB_NAME || "ukkprojek",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00"
});

const paymentColumns = new Set();

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result;
};

const loadPaymentColumns = async () => {
  const [columns] = await pool.query("SHOW COLUMNS FROM payments");
  paymentColumns.clear();
  columns.forEach((column) => paymentColumns.add(column.Field));
};

const initSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) DEFAULT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL,
      role VARCHAR(60) DEFAULT 'user',
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

  await loadPaymentColumns();

  const addPaymentColumnIfMissing = async (name, definition) => {
    if (!paymentColumns.has(name)) {
      await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS ${definition}`);
      paymentColumns.add(name);
    }
  };

  const relaxOldPaymentColumn = async (column, definition) => {
    if (paymentColumns.has(column)) {
      try {
        await pool.query(`ALTER TABLE payments MODIFY COLUMN ${definition}`);
      } catch (err) {
        console.warn(`Could not relax payment column ${column}:`, err.message);
      }
    }
  };

  const dropPaymentsForeignKeyIfExists = async () => {
    try {
      const [rows] = await pool.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'event_id' AND REFERENCED_TABLE_NAME = 'events'`
      );
      if (rows.length) {
        const constraintName = rows[0].CONSTRAINT_NAME;
        await pool.query(`ALTER TABLE payments DROP FOREIGN KEY \`${constraintName}\``);
      }
    } catch (err) {
      console.warn('Could not drop payments foreign key:', err.message);
    }
  };

  await relaxOldPaymentColumn('order_id', '`order_id` VARCHAR(50) NULL');
  await relaxOldPaymentColumn('user_name', '`user_name` VARCHAR(120) NULL');
  await dropPaymentsForeignKeyIfExists();
  await relaxOldPaymentColumn('event_id', '`event_id` INT NULL');
  await relaxOldPaymentColumn('total_amount', '`total_amount` DECIMAL(12,2) NULL');

  await addPaymentColumnIfMissing("orderId", "`orderId` VARCHAR(40) NULL");
  await addPaymentColumnIfMissing("user", "`user` VARCHAR(120) NULL");
  await addPaymentColumnIfMissing("avatar", "`avatar` VARCHAR(20) NULL");
  await addPaymentColumnIfMissing("event", "`event` VARCHAR(180) NULL");
  await addPaymentColumnIfMissing("totalBayar", "`totalBayar` DECIMAL(14,2) NULL");
  await addPaymentColumnIfMissing("transferSlip", "`transferSlip` BOOLEAN NULL");
  await addPaymentColumnIfMissing("verifiedAt", "`verifiedAt` DATETIME NULL");
  await addPaymentColumnIfMissing("createdAt", "`createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP");

  const tryUpdate = async (sql) => {
    try {
      await pool.execute(sql);
    } catch (err) {
      console.warn("Payment schema upgrade warning:", err.message);
    }
  };

  if (paymentColumns.has('order_id')) {
    await tryUpdate("UPDATE payments SET `orderId` = `order_id` WHERE `orderId` IS NULL AND `order_id` IS NOT NULL");
  }
  if (paymentColumns.has('user_name')) {
    await tryUpdate("UPDATE payments SET `user` = `user_name` WHERE `user` IS NULL AND `user_name` IS NOT NULL");
  }
  if (paymentColumns.has('event_id')) {
    await tryUpdate("UPDATE payments SET `event` = (SELECT e.name FROM events e WHERE e.id = payments.event_id) WHERE `event` IS NULL AND `event_id` IS NOT NULL");
  }
  if (paymentColumns.has('total_amount')) {
    await tryUpdate("UPDATE payments SET `totalBayar` = `total_amount` WHERE `totalBayar` IS NULL AND `total_amount` IS NOT NULL");
  }
  if (paymentColumns.has('proof_of_transfer')) {
    await tryUpdate("UPDATE payments SET `transferSlip` = CASE WHEN `proof_of_transfer` IS NOT NULL THEN TRUE ELSE FALSE END WHERE `transferSlip` IS NULL");
  }
  if (paymentColumns.has('created_at')) {
    await tryUpdate("UPDATE payments SET `verifiedAt` = `created_at` WHERE `verifiedAt` IS NULL AND `created_at` IS NOT NULL");
  }

  await loadPaymentColumns();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@electricpulse.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const rows = await query("SELECT id FROM users WHERE email = ?", [adminEmail]);
  if (!rows.length) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await query("INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, 'Master Admin')", ['Admin', adminEmail, passwordHash]);
    console.info(`Admin user created: ${adminEmail}`);
  }
  // touch: log to surface env for debug when nodemon restarts
  console.info(`DB connected to ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
};

module.exports = {
  pool,
  query,
  execute,
  initSchema,
  paymentColumns
};

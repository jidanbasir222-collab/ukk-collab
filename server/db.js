const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const parseDbUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname) return null;
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 3306,
      user: decodeURIComponent(u.username || "root"),
      password: decodeURIComponent(u.password || ""),
      database: (u.pathname || "/").replace(/^\//, "")
    };
  } catch (error) {
    console.error("Gagal parse DATABASE_URL:", error.message);
    return null;
  }
};

const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
const parsed = parseDbUrl(dbUrl);

const dbConfig = {
  host: parsed?.host || process.env.DB_HOST || "127.0.0.1",
  user: parsed?.user || process.env.DB_USER || "root",
  password: parsed?.password || process.env.DB_PASSWORD || "",
  database: parsed?.database || process.env.DB_NAME || "ukkprojek",
  port: parsed?.port || Number(process.env.DB_PORT || 3306)
};

if (dbUrl) {
  console.info(`Menggunakan koneksi database dari URL (host: ${parsed?.host || "?"}).`);
} else {
  console.info("Menggunakan koneksi database dari variabel individu (DB_HOST, dst).");
}

const pool = mysql.createPool({
  ...dbConfig,
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
  const adminEmail = process.env.ADMIN_EMAIL || "admin@electricpulse.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  // 0. Pastikan database ada (dibuat otomatis bila belum ada)
  try {
    const conn = await mysql.createConnection(dbConfig);
    const dbName = dbConfig.database;
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    await conn.end();
    console.info(`Database "${dbName}" siap.`);
  } catch (error) {
    console.error("Gagal membuat database:", error.message);
  }

  // 1. Skema tabel (CREATE TABLE IF NOT EXISTS — aman dijalankan setiap server start)
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      passwordHash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      phone VARCHAR(30) NULL,
      avatar_url VARCHAR(255) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      description TEXT NULL,
      icon VARCHAR(50) DEFAULT 'music',
      color VARCHAR(20) DEFAULT 'pink',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS artists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      genre VARCHAR(50) DEFAULT 'SYNTHWAVE',
      instagram VARCHAR(100) NULL,
      activeEvents INT NOT NULL DEFAULT 0,
      avatarIndex INT NOT NULL DEFAULT 0,
      avatar_url VARCHAR(255) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      artist VARCHAR(100) NULL,
      category VARCHAR(50) NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      location VARCHAR(255) NOT NULL,
      ticketPrice DECIMAL(12, 2) NOT NULL DEFAULT 0,
      quota INT NOT NULL DEFAULT 5000,
      sold INT NOT NULL DEFAULT 0,
      status ENUM('ACTIVE', 'SOLD OUT', 'CLOSED', 'DRAFT') DEFAULT 'ACTIVE',
      poster VARCHAR(255) NULL,
      banner VARCHAR(255) NULL,
      description TEXT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId VARCHAR(50) UNIQUE NOT NULL,
      user_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NULL,
      event_id INT NULL,
      ticket_qty INT NOT NULL DEFAULT 1,
      totalBayar DECIMAL(12, 2) NOT NULL,
      proof_of_transfer VARCHAR(255) NULL,
      status ENUM('PENDING', 'PAID', 'REJECTED') DEFAULT 'PENDING',
      verifiedAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_name VARCHAR(100) NOT NULL,
      action_type ENUM('PURCHASE', 'ARTIST_REGISTER', 'EVENT_APPROVED', 'PAYMENT_VERIFIED') NOT NULL,
      description VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.info("Skema tabel siap (auto-create).");

  // Migrasi ringan: pastikan kolom phone ada di tabel users (DB lama pakai snake_case)
  try {
    const cols = await query("SHOW COLUMNS FROM users");
    if (!cols.some((c) => c.Field === "phone")) {
      await query("ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL AFTER role");
      console.info("Migrasi: kolom phone ditambahkan ke users.");
    }
  } catch (error) {
    console.error("Migrasi users.phone gagal:", error.message);
  }

  try {
    const [rows] = await query("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (!rows || rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await query(
        "INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, 'admin')",
        ["Master Admin", adminEmail, passwordHash]
      );
      console.info(`Admin user created: ${adminEmail}`);
    } else {
      console.info(`Admin user already exists: ${adminEmail}`);
    }
  } catch (error) {
    // Menangani jika ada error duplikat agar server tidak crash
    if (error.code === "ER_DUP_ENTRY") {
      console.info(`Admin user already exists: ${adminEmail}`);
    } else {
      throw error;
    }
  }

  // Seed demo user (role 'user') untuk keperluan testing
  const userEmail = "user@electricpulse.com";
  const userPassword = "user123";
  try {
    const [rows] = await query("SELECT id FROM users WHERE email = ?", [userEmail]);
    if (!rows || rows.length === 0) {
      const passwordHash = await bcrypt.hash(userPassword, 10);
      await query(
        "INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, 'user')",
        ["Demo User", userEmail, passwordHash]
      );
      console.info(`User created: ${userEmail}`);
    } else {
      console.info(`User already exists: ${userEmail}`);
    }
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.info(`User already exists: ${userEmail}`);
    } else {
      throw error;
    }
  }

  await seedCategories();
  await seedArtists();
  await seedEvents();
  await seedPayments();
  await seedActivityLogs();
};

const seedIfEmpty = async (table, rows, insertSql) => {
  try {
    const [existing] = await query(`SELECT COUNT(*) AS c FROM ${table}`);
    if (existing.c > 0) {
      console.info(`${table} already seeded (${existing.c} rows).`);
      return;
    }
    if (rows.length === 0) return;
    for (const row of rows) {
      await query(insertSql, row);
    }
    console.info(`Seeded ${rows.length} rows into ${table}.`);
  } catch (error) {
    console.error(`Failed to seed ${table}:`, error.message);
  }
};

const seedCategories = () =>
  seedIfEmpty(
    "categories",
    [
      ["Pop", "Mainstream melodies, catchy hooks, and clean production.", "music", "pink"],
      ["Rock", "Powerful guitars, driving drums, and energetic vocals.", "zap", "teal"],
      ["Jazz", "Improvisational rhythms, brass solos, and smooth club vibes.", "radio", "purple"],
      ["Indie", "Independent production, unique lyricism, and alternative tunes.", "headphones", "peach"],
      ["Festival", "Multi-artist outdoor concerts and massive experiences.", "music", "green"]
    ],
    "INSERT INTO categories (name, description, icon, color) VALUES (?, ?, ?, ?)"
  );

const seedArtists = () =>
  seedIfEmpty(
    "artists",
    [
      ["LUNA & The Stars", "POP", "@lunathestars", 6, 0],
      ["The Iron Strings", "ROCK", "@theironstrings", 4, 1],
      ["DJ Static", "ELECTRO", "@djstatic", 8, 2],
      ["Smooth Quartette", "JAZZ", "@smoothquartette", 3, 0],
      ["Nadia Wira", "INDIE", "@nadiawira", 2, 1]
    ],
    "INSERT INTO artists (name, genre, instagram, activeEvents, avatarIndex) VALUES (?, ?, ?, ?, ?)"
  );

const seedEvents = () =>
  seedIfEmpty(
    "events",
    [
      ["Neon Night Tour 2026", "LUNA & The Stars", "Pop", "2026-09-15", "19:00", "Stadion Utama GBK", 350000, 8000, 1250, "ACTIVE", "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80", null, "Konser pop malam dengan pencahayaan neon spektakuler."],
      ["Thunderous Echoes", "The Iron Strings", "Rock", "2026-10-22", "20:00", "The Warehouse Arena", 400000, 5000, 5000, "SOLD OUT", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80", null, "Malam rock penuh energi dari The Iron Strings."],
      ["Electric Pulse Fest", "DJ Static & Friends", "Festival", "2026-12-05", "18:00", "Beach Club Bali", 500000, 10000, 3200, "ACTIVE", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", null, "Festival musik elektronik terbesar di pantai."],
      ["Midnight Jazz", "Smooth Quartette", "Jazz", "2026-10-30", "21:00", "Sky Lounge Plaza", 275000, 1500, 480, "ACTIVE", "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80", null, "Sesi jazz intim di atas gedung tertinggi."],
      ["Synthwave Odyssey", "Nadia Wira", "Indie", "2026-11-08", "19:30", "Sector 7 Warehouse", 300000, 3000, 2150, "ACTIVE", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80", null, "Perjalanan musik synthwave bersama Nadia Wira."],
      ["Cyber Punk Live", "DJ Static", "Festival", "2026-11-28", "22:00", "Sector 7 Warehouse", 450000, 6000, 900, "CLOSED", "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80", null, "Malam futuristik dengan visual cyber punk."]
    ],
    "INSERT INTO events (name, artist, category, date, time, location, ticketPrice, quota, sold, status, poster, banner, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

const seedPayments = async () => {
  try {
    const [existing] = await query("SELECT COUNT(*) AS c FROM payments");
    if (existing.c > 0) {
      console.info(`payments already seeded (${existing.c} rows).`);
      return;
    }
    const events = await query("SELECT id, name FROM events LIMIT 3");
    if (!events || events.length === 0) {
      console.info("No events found, skipping payments seed.");
      return;
    }
    const rows = [
      ["EP-SEED-1001", "Budi Santoso", events[0].id, 2, 700000, "PAID", new Date()],
      ["EP-SEED-1002", "Sarah Wijaya", events[0].id, 1, 350000, "PENDING", null],
      ["EP-SEED-1003", "Michael Chen", events[2].id, 3, 1500000, "PAID", new Date()],
      ["EP-SEED-1004", "Anisa Rahma", events[1].id, 4, 1600000, "REJECTED", null]
    ];
    for (const row of rows) {
      await query(
        "INSERT INTO payments (orderId, user_name, event_id, ticket_qty, totalBayar, status, verifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        row
      );
    }
    console.info(`Seeded ${rows.length} rows into payments.`);
  } catch (error) {
    console.error("Failed to seed payments:", error.message);
  }
};

const seedActivityLogs = () =>
  seedIfEmpty(
    "activity_logs",
    [
      ["Budi Santoso", "PURCHASE", "membeli 2 tiket untuk Neon Night Tour 2026"],
      ["Pendaftaran artis baru", "ARTIST_REGISTER", "The Midnight Sun bergabung ke Electric Pulse"],
      ["Event Art Tech Expo", "EVENT_APPROVED", "Event disetujui oleh admin"],
      ["Sarah Wijaya", "PURCHASE", "membeli 1 tiket untuk Electric Pulse Fest"]
    ],
    "INSERT INTO activity_logs (user_name, action_type, description) VALUES (?, ?, ?)"
  );

module.exports = {
  pool,
  query,
  execute,
  initSchema
};
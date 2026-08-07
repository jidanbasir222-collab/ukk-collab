const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ukkprojek",
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
  const adminEmail = process.env.ADMIN_EMAIL || "admin@electricpulse.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

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

module.exports = {
  pool,
  query,
  execute,
  initSchema
};
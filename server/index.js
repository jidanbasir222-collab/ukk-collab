const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const db = require("./db");
const dataStore = require("./data");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "electricpulse-secret";
const TOKEN_EXPIRES_IN = "2h";

const generateToken = (user) => jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan. Silakan login kembali." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token tidak valid atau telah kedaluwarsa." });
    }
    req.user = user;
    next();
  });
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// 1. Authentication
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  try {
    const users = await db.query("SELECT id, email, passwordHash, role FROM users WHERE email = ?", [email]);
    if (!users.length) {
      return res.status(401).json({ error: "Email atau Password salah." });
    }

    const user = users[0];
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Email atau Password salah." });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return res.json({
      success: true,
      message: "Login successful.",
      user: { id: user.id, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memproses login." });
  }
});

// Protect all other API routes after login
app.use("/api", authenticateToken);

app.get("/api/profile", (req, res) => {
  res.json({ success: true, user: req.user });
});

// 2. Dashboard Statistics
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [eventsRow] = await db.query("SELECT COUNT(*) AS totalEvents, SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS activeEvents, SUM(sold) AS totalSoldTickets, SUM(sold * ticketPrice) AS totalRevenue FROM events");
    const [revenueRow] = await db.query("SELECT COALESCE(SUM(totalBayar), 0) AS verifiedRevenueToday FROM payments WHERE status = 'PAID' AND DATE(verifiedAt) = CURRENT_DATE()");

    res.json({
      totalEvents: Number(eventsRow.totalEvents || 0),
      activeEvents: Number(eventsRow.activeEvents || 0),
      totalSoldTickets: Number(eventsRow.totalSoldTickets || 0),
      totalRevenue: Number(eventsRow.totalRevenue || 0),
      verifiedRevenueToday: Number(revenueRow.verifiedRevenueToday || 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil statistik dashboard." });
  }
});

// 3. Events REST API
app.get("/api/events", async (req, res) => {
  try {
    const events = await db.query("SELECT * FROM events ORDER BY createdAt DESC");
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data event." });
  }
});

app.post("/api/events", async (req, res) => {
  const { name, artist, category, date, time, ticketPrice, quota, location, description } = req.body;
  if (!name || !artist || !category || !date || !location) {
    return res.status(400).json({ error: "Field utama event wajib diisi." });
  }

  try {
    const result = await db.execute(
      "INSERT INTO events (name, artist, category, date, time, location, ticketPrice, quota, sold, status, poster, banner, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'ACTIVE', NULL, NULL, ?)",
      [name, artist, category, date, time || "19:00", location, Number(ticketPrice) || 0, Number(quota) || 5000, description || null]
    );
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan event." });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    await db.execute("DELETE FROM events WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Event berhasil dihapus." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus event." });
  }
});

// 4. Artists REST API
app.get("/api/artists", async (req, res) => {
  try {
    const artists = await db.query("SELECT * FROM artists ORDER BY createdAt DESC");
    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data artis." });
  }
});

app.post("/api/artists", async (req, res) => {
  const { name, genre, instagram, activeEvents } = req.body;
  if (!name || !instagram) {
    return res.status(400).json({ error: "Nama dan Instagram artis wajib diisi." });
  }

  try {
    const result = await db.execute(
      "INSERT INTO artists (name, genre, instagram, activeEvents, avatarIndex) VALUES (?, ?, ?, ?, ?)",
      [name, (genre || "SYNTHWAVE").toUpperCase(), instagram.startsWith("@") ? instagram : `@${instagram}`, Number(activeEvents) || 0, Math.floor(Math.random() * 3)]
    );
    const [rows] = await db.query("SELECT * FROM artists WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan artis." });
  }
});

app.delete("/api/artists/:id", async (req, res) => {
  try {
    await db.execute("DELETE FROM artists WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Artis berhasil dihapus." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus artis." });
  }
});

// 5. Categories REST API
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories ORDER BY createdAt DESC");
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data kategori." });
  }
});

app.post("/api/categories", async (req, res) => {
  const { name, icon, color, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nama kategori wajib diisi." });
  }

  try {
    const result = await db.execute(
      "INSERT INTO categories (name, icon, color, description) VALUES (?, ?, ?, ?)",
      [name, icon || "music", color || "pink", description || "No description provided."]
    );
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan kategori." });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await db.execute("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Kategori berhasil dihapus." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus kategori." });
  }
});

// 6. Payments Verification REST API
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await db.query("SELECT * FROM payments ORDER BY createdAt DESC");
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data pembayaran." });
  }
});

app.post("/api/payments/:orderId/verify", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // PAID or REJECTED

  if (!["PAID", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Status pembayaran tidak valid." });
  }

  try {
    const updatedAt = status === "PAID" ? new Date() : null;
    const result = await db.execute(
      "UPDATE payments SET status = ?, verifiedAt = ? WHERE orderId = ?",
      [status, updatedAt, orderId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transaksi pembayaran tidak ditemukan." });
    }
    const [rows] = await db.query("SELECT * FROM payments WHERE orderId = ?", [orderId]);
    res.json({ success: true, payment: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memperbarui status pembayaran." });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Electric Pulse Console Backend API is running successfully!");
});

const startServer = async () => {
  try {
    await db.initSchema();
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
};

startServer();

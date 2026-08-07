const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const db = require("./db");
const dataStore = require("./data");
const { snap } = require("./midtrans");
const {
  generateToken,
  authenticateToken,
  requireRole,
  normalizeRole
} = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

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

    const role = normalizeRole(user.role);
    const token = generateToken({ id: user.id, email: user.email, role });
    return res.json({
      success: true,
      message: "Login successful.",
      user: { id: user.id, email: user.email, role },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memproses login." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nama, email, dan password wajib diisi." });
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Email sudah terdaftar." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.execute(
      "INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, 'user')",
      [name, email, passwordHash]
    );

    const token = generateToken({ id: result.insertId, email, role: "user" });
    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",
      user: { id: result.insertId, name, email, role: "user" },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memproses registrasi." });
  }
});

// Midtrans webhook notification handler (auto-updates payment status)
// NOTE: placed before authenticateToken middleware so Midtrans can reach it without a Bearer token
app.post("/api/payments/notification", async (req, res) => {
  const { order_id, transaction_status, fraud_status } = req.body;

  if (!order_id || !transaction_status) {
    return res.status(400).json({ error: "Payload notifikasi tidak valid." });
  }

  let status = "PENDING";
  if (transaction_status === "capture" || transaction_status === "settlement") {
    status = "PAID";
  } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
    status = "REJECTED";
  }

  try {
    await db.execute(
      "UPDATE payments SET status = ?, verifiedAt = ? WHERE orderId = ?",
      [status, status === "PAID" ? new Date() : null, order_id]
    );

    if (status === "PAID") {
      const [rows] = await db.query("SELECT event_id, ticket_qty FROM payments WHERE orderId = ?", [order_id]);
      if (rows && rows.event_id) {
        await db.execute(
          "UPDATE events SET sold = sold + ? WHERE id = ?",
          [rows.ticket_qty || 1, rows.event_id]
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memproses notifikasi pembayaran." });
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

app.post("/api/events", requireRole("admin"), async (req, res) => {
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

app.delete("/api/events/:id", requireRole("admin"), async (req, res) => {
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

app.post("/api/artists", requireRole("admin"), async (req, res) => {
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

app.delete("/api/artists/:id", requireRole("admin"), async (req, res) => {
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

app.post("/api/categories", requireRole("admin"), async (req, res) => {
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

app.delete("/api/categories/:id", requireRole("admin"), async (req, res) => {
  try {
    await db.execute("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Kategori berhasil dihapus." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus kategori." });
  }
});

// 6. Payments Gateway REST API (Midtrans Snap)
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await db.query(
      "SELECT p.*, e.name AS event_name FROM payments p LEFT JOIN events e ON p.event_id = e.id ORDER BY p.createdAt DESC"
    );
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data pembayaran." });
  }
});

// Create a Midtrans Snap transaction and store the order in DB
app.post("/api/payments/create", async (req, res) => {
  const { user, email, event, eventId, ticketQty, totalBayar } = req.body;
  if (!user || !email || !event || !ticketQty || !totalBayar) {
    return res.status(400).json({ error: "Data pembayaran tidak lengkap." });
  }

  const orderId = `EP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  try {
    const result = await db.execute(
      "INSERT INTO payments (orderId, user_name, event_id, ticket_qty, totalBayar, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
      [orderId, user, eventId || null, Number(ticketQty), Number(totalBayar)]
    );

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(totalBayar)
      },
      item_details: [
        {
          id: orderId,
          price: Number(totalBayar),
          quantity: 1,
          name: `Tiket ${event}`
        }
      ],
      customer_details: {
        first_name: user,
        email
      },
      credit_card: {
        secure: true
      }
    };

    const snapResponse = await snap.createTransaction(parameter);
    res.status(201).json({
      success: true,
      payment: { orderId, status: "PENDING" },
      token: snapResponse.token,
      redirectUrl: snapResponse.redirect_url
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal membuat transaksi pembayaran." });
  }
});

// Poll payment status from frontend after Snap popup
app.get("/api/payments/:orderId/status", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT orderId, status FROM payments WHERE orderId = ?", [req.params.orderId]);
    if (!rows) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan." });
    }
    res.json({ success: true, orderId: rows.orderId, status: rows.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil status pembayaran." });
  }
});

app.post("/api/payments/:orderId/verify", requireRole("admin"), async (req, res) => {
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

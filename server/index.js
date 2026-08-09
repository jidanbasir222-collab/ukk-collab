const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const db = require("./db");
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
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// Helper: tulis activity log ke tabel activity_logs
const logActivity = async (userName, actionType, description) => {
  try {
    const allowed = ["PURCHASE", "ARTIST_REGISTER", "EVENT_APPROVED", "PAYMENT_VERIFIED"];
    const type = allowed.includes(actionType) ? actionType : "PURCHASE";
    await db.execute(
      "INSERT INTO activity_logs (user_name, action_type, description) VALUES (?, ?, ?)",
      [userName, type, description]
    );
  } catch (error) {
    console.error("Gagal menulis activity log:", error.message);
  }
};

// ============ PUBLIC ROUTES (tanpa autentikasi) ============

// 1. Authentication
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  try {
    const users = await db.query("SELECT id, name, email, passwordHash, role FROM users WHERE email = ?", [email]);
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
      user: { id: user.id, name: user.name, email: user.email, role },
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
    const [existing] = await db.query("SELECT status, event_id, ticket_qty, user_name FROM payments WHERE orderId = ?", [order_id]);
    if (!existing) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan." });
    }

    await db.execute(
      "UPDATE payments SET status = ?, verifiedAt = ? WHERE orderId = ?",
      [status, status === "PAID" ? new Date() : null, order_id]
    );

    // Guard idempotensi: hanya tambah stok terjual sekali per transaksi (webhook Midtrans bisa retry berkali-kali)
    if (status === "PAID" && existing.status !== "PAID" && existing.event_id) {
      await db.execute(
        "UPDATE events SET sold = sold + ? WHERE id = ?",
        [existing.ticket_qty || 1, existing.event_id]
      );
      await logActivity(existing.user_name || "Sistem", "PURCHASE", `Pembayaran ${order_id} terverifikasi otomatis (Midtrans).`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memproses notifikasi pembayaran." });
  }
});

// 2. Public Events (untuk halaman publik: landing, daftar event, detail event)
app.get("/api/events", async (req, res) => {
  try {
    const events = await db.query("SELECT * FROM events ORDER BY date ASC");
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data event." });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
    if (!rows) {
      return res.status(404).json({ error: "Event tidak ditemukan." });
    }
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data event." });
  }
});

// Public read: artis & kategori (dibaca halaman publik/admin tanpa token, sama seperti events)
app.get("/api/artists", async (req, res) => {
  try {
    const artists = await db.query("SELECT * FROM artists ORDER BY createdAt DESC");
    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data artis." });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories ORDER BY createdAt DESC");
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data kategori." });
  }
});

// Protect all other API routes after login
app.use("/api", authenticateToken);

app.get("/api/profile", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, role, phone FROM users WHERE id = ?", [req.user.id]);
    if (!rows) return res.status(404).json({ error: "Akun tidak ditemukan." });
    return res.json({ success: true, user: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal mengambil profil." });
  }
});

// ============ PROFILE & KEAMANAN AKUN ============

// Update profil user yang sedang login
app.put("/api/profile", async (req, res) => {
  const { name, phone } = req.body;
  try {
    await db.execute("UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?", [
      name || null,
      phone || null,
      req.user.id
    ]);
    const [rows] = await db.query("SELECT id, name, email, role, phone FROM users WHERE id = ?", [req.user.id]);
    return res.json({ success: true, message: "Profil berhasil diperbarui.", user: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memperbarui profil." });
  }
});

// Ganti password user yang sedang login
app.put("/api/profile/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Password lama dan baru wajib diisi." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "Password baru minimal 6 karakter." });
  }

  try {
    const [users] = await db.query("SELECT id, passwordHash FROM users WHERE id = ?", [req.user.id]);
    if (!users) {
      return res.status(404).json({ error: "Akun tidak ditemukan." });
    }
    const matches = await bcrypt.compare(currentPassword, users.passwordHash);
    if (!matches) {
      return res.status(400).json({ error: "Password lama salah." });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET passwordHash = ? WHERE id = ?", [passwordHash, req.user.id]);
    return res.json({ success: true, message: "Password berhasil diperbarui." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memperbarui password." });
  }
});

// ============ DATA PRIBADI USER (TIKET & RIWAYAT PEMBAYARAN) ============

// Riwayat pembayaran milik user yang login
app.get("/api/me/payments", async (req, res) => {
  try {
    const payments = await db.query(
      `SELECT p.*, e.name AS event_name, e.date AS event_date, e.location AS event_location, e.poster AS event_poster
       FROM payments p
       LEFT JOIN events e ON p.event_id = e.id
       WHERE p.email = ?
       ORDER BY p.createdAt DESC`,
      [req.user.email]
    );
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil riwayat pembayaran." });
  }
});

// Tiket milik user yang login (hanya pembayaran PAID)
app.get("/api/me/tickets", async (req, res) => {
  try {
    const tickets = await db.query(
      `SELECT p.orderId AS code, p.ticket_qty, p.totalBayar, p.status, p.verifiedAt,
              e.name AS event_name, e.date AS event_date, e.time AS event_time,
              e.location, e.poster, e.category
       FROM payments p
       LEFT JOIN events e ON p.event_id = e.id
       WHERE p.email = ? AND p.status = 'PAID'
       ORDER BY p.verifiedAt DESC`,
      [req.user.email]
    );
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data tiket." });
  }
});

// ============ DASHBOARD (ADMIN) ============

app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [eventsRow] = await db.query("SELECT COUNT(*) AS totalEvents, SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS activeEvents, SUM(sold) AS totalSoldTickets, SUM(sold * ticketPrice) AS totalRevenue, SUM(quota) AS totalQuota FROM events");
    const [revenueRow] = await db.query("SELECT COALESCE(SUM(totalBayar), 0) AS verifiedRevenueToday FROM payments WHERE status = 'PAID' AND DATE(verifiedAt) = CURRENT_DATE()");
    const [pendingRow] = await db.query("SELECT COUNT(*) AS pendingCount FROM payments WHERE status = 'PENDING'");
    const [totalPaymentsRow] = await db.query("SELECT COUNT(*) AS totalPayments FROM payments");

    res.json({
      totalEvents: Number(eventsRow.totalEvents || 0),
      activeEvents: Number(eventsRow.activeEvents || 0),
      totalSoldTickets: Number(eventsRow.totalSoldTickets || 0),
      totalRevenue: Number(eventsRow.totalRevenue || 0),
      verifiedRevenueToday: Number(revenueRow.verifiedRevenueToday || 0),
      pendingPayments: Number(pendingRow.pendingCount || 0),
      totalPayments: Number(totalPaymentsRow.totalPayments || 0),
      totalQuota: Number(eventsRow.totalQuota || 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil statistik dashboard." });
  }
});

// Aktivitas terakhir (activity logs)
app.get("/api/dashboard/activity", async (req, res) => {
  try {
    const logs = await db.query("SELECT * FROM activity_logs ORDER BY createdAt DESC LIMIT 20");
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil aktivitas terakhir." });
  }
});

// ============ EVENTS REST API ============

app.post("/api/events", requireRole("admin"), async (req, res) => {
  const { name, artist, category, date, time, ticketPrice, quota, location, description, poster, banner, status } = req.body;
  if (!name || !artist || !category || !date || !location) {
    return res.status(400).json({ error: "Field utama event wajib diisi." });
  }

  try {
    const result = await db.execute(
      "INSERT INTO events (name, artist, category, date, time, location, ticketPrice, quota, sold, status, poster, banner, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)",
      [name, artist, category, date, time || "19:00", location, Number(ticketPrice) || 0, Number(quota) || 5000, status || "ACTIVE", poster || null, banner || null, description || null]
    );
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [result.insertId]);
    await logActivity(req.user.name || "Admin", "EVENT_APPROVED", `Event "${name}" ditambahkan.`);
    res.status(201).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan event." });
  }
});

app.put("/api/events/:id", requireRole("admin"), async (req, res) => {
  const { name, artist, category, date, time, ticketPrice, quota, location, description, poster, banner, status } = req.body;
  try {
    const result = await db.execute(
      `UPDATE events SET
        name = COALESCE(?, name),
        artist = COALESCE(?, artist),
        category = COALESCE(?, category),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        ticketPrice = COALESCE(?, ticketPrice),
        quota = COALESCE(?, quota),
        location = COALESCE(?, location),
        description = COALESCE(?, description),
        poster = COALESCE(?, poster),
        banner = COALESCE(?, banner),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name || null, artist || null, category || null, date || null, time || null, ticketPrice != null ? Number(ticketPrice) : null, quota != null ? Number(quota) : null, location || null, description || null, poster || null, banner || null, status || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event tidak ditemukan." });
    }
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
    await logActivity(req.user.name || "Admin", "EVENT_APPROVED", `Event "${rows.name}" diperbarui.`);
    res.json({ success: true, event: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memperbarui event." });
  }
});

app.delete("/api/events/:id", requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query("SELECT name FROM events WHERE id = ?", [req.params.id]);
    await db.execute("DELETE FROM events WHERE id = ?", [req.params.id]);
    await logActivity(req.user.name || "Admin", "EVENT_APPROVED", `Event "${rows ? rows.name : req.params.id}" dihapus.`);
    res.json({ success: true, message: "Event berhasil dihapus." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus event." });
  }
});

// ============ ARTISTS REST API ============

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
    await logActivity(name, "ARTIST_REGISTER", `Artis "${name}" didaftarkan.`);
    res.status(201).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan artis." });
  }
});

app.put("/api/artists/:id", requireRole("admin"), async (req, res) => {
  const { name, genre, instagram, activeEvents } = req.body;
  try {
    const result = await db.execute(
      `UPDATE artists SET
        name = COALESCE(?, name),
        genre = COALESCE(?, genre),
        instagram = COALESCE(?, instagram),
        activeEvents = COALESCE(?, activeEvents)
       WHERE id = ?`,
      [name || null, genre ? String(genre).toUpperCase() : null, instagram ? (instagram.startsWith("@") ? instagram : `@${instagram}`) : null, activeEvents != null ? Number(activeEvents) : null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Artis tidak ditemukan." });
    }
    const [rows] = await db.query("SELECT * FROM artists WHERE id = ?", [req.params.id]);
    res.json({ success: true, artist: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memperbarui artis." });
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

// ============ CATEGORIES REST API ============

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
    res.status(201).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan kategori." });
  }
});

app.put("/api/categories/:id", requireRole("admin"), async (req, res) => {
  const { name, icon, color, description } = req.body;
  try {
    const result = await db.execute(
      `UPDATE categories SET
        name = COALESCE(?, name),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        description = COALESCE(?, description)
       WHERE id = ?`,
      [name || null, icon || null, color || null, description || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Kategori tidak ditemukan." });
    }
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    res.json({ success: true, category: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memperbarui kategori." });
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

// ============ PAYMENTS GATEWAY REST API (Midtrans Snap) ============

app.get("/api/payments", requireRole("admin"), async (req, res) => {
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

  try {
    // Validasi kuota tiket (stok) sebelum membuat transaksi
    if (eventId) {
      const [ev] = await db.query("SELECT name, ticketPrice, quota, sold, status FROM events WHERE id = ?", [eventId]);
      if (!ev) {
        return res.status(404).json({ error: "Event tidak ditemukan." });
      }
      if (ev.status === "SOLD OUT" || ev.status === "CLOSED") {
        return res.status(400).json({ error: `Tiket untuk event "${ev.name}" sudah tidak tersedia.` });
      }
      const remaining = Number(ev.quota) - Number(ev.sold);
      if (Number(ticketQty) > remaining) {
        return res.status(400).json({ error: `Stok tiket tidak mencukupi. Sisa tiket: ${remaining}.` });
      }
      // Validasi nominal: hitung ulang dari harga di DB agar totalBayar tidak bisa dimanipulasi client
      const minimumTotal = Number(ev.ticketPrice) * Number(ticketQty);
      if (Number(totalBayar) < minimumTotal) {
        return res.status(400).json({ error: `Jumlah pembayaran tidak valid. Minimal Rp ${minimumTotal.toLocaleString("id-ID")}.` });
      }
    }

    const orderId = `EP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const result = await db.execute(
      "INSERT INTO payments (orderId, user_name, email, event_id, ticket_qty, totalBayar, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')",
      [orderId, user, email, eventId || null, Number(ticketQty), Number(totalBayar)]
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
    if (error.response && error.response.status) {
      return res.status(error.response.status).json({ error: error.message || "Gagal membuat transaksi pembayaran." });
    }
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
    const [existing] = await db.query("SELECT * FROM payments WHERE orderId = ?", [orderId]);
    if (!existing) {
      return res.status(404).json({ error: "Transaksi pembayaran tidak ditemukan." });
    }

    const updatedAt = status === "PAID" ? new Date() : null;
    const result = await db.execute(
      "UPDATE payments SET status = ?, verifiedAt = ? WHERE orderId = ?",
      [status, updatedAt, orderId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transaksi pembayaran tidak ditemukan." });
    }

    // Jika diverifikasi PAID manual (tanpa webhook), tambahkan stok terjual event
    if (status === "PAID" && existing.status !== "PAID" && existing.event_id) {
      await db.execute(
        "UPDATE events SET sold = sold + ? WHERE id = ?",
        [existing.ticket_qty || 1, existing.event_id]
      );
    }

    await logActivity(req.user.name || "Admin", "PAYMENT_VERIFIED", `Pembayaran ${orderId} diverifikasi (${status}).`);
    const [rows] = await db.query("SELECT * FROM payments WHERE orderId = ?", [orderId]);
    res.json({ success: true, payment: rows });
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

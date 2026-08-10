const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const db = require("./db");
const { snap, serverKey } = require("./midtrans");
const { sendOtpEmail, sendResetLinkEmail, isSmtpConfigured } = require("./mailer");
const {
  generateToken,
  authenticateToken,
  requireRole,
  normalizeRole
} = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS dipasang paling atas sebelum middleware lain & route, agar preflight selalu ter-handle
app.use(
  cors({
    origin: true, // mengizinkan origin mana pun yang melakukan request
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Preflight OPTIONS: balas 200 secara eksplisit tanpa lanjut ke middleware/route lain
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
});

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

// ---------- Helper OTP ----------
const OTP_TTL_MS = 5 * 60 * 1000; // 5 menit
const OTP_COOLDOWN_MS = 60 * 1000; // 1 menit antar kirim
const OTP_MAX_ATTEMPTS = 5;

const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const invalidateOtps = async (email, purpose) => {
  await db.execute("DELETE FROM otps WHERE email = ? AND purpose = ?", [email, purpose]);
};

// Ambil OTP terbaru yang masih berlaku untuk email + tujuan
const getLatestOtp = async (email, purpose) => {
  const rows = await db.query(
    "SELECT * FROM otps WHERE email = ? AND purpose = ? ORDER BY id DESC LIMIT 1",
    [email, purpose]
  );
  return rows[0] || null;
};

// Kirim OTP. Kembalikan { ok, code, devMode } — devMode true jika SMTP belum dikonfigurasi.
const issueOtp = async (email, purpose) => {
  const latest = await getLatestOtp(email, purpose);
  if (latest) {
    const created = new Date(latest.createdAt).getTime();
    if (Date.now() - created < OTP_COOLDOWN_MS) {
      const sisa = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - created)) / 1000);
      return { ok: false, cooldown: sisa };
    }
    await invalidateOtps(email, purpose);
  }

  const code = generateOtpCode();
  await db.execute(
    "INSERT INTO otps (email, code, purpose, expiresAt) VALUES (?, ?, ?, ?)",
    [email, code, purpose, new Date(Date.now() + OTP_TTL_MS)]
  );

  const sent = await sendOtpEmail(email, code, purpose);
  return { ok: true, code: sent ? null : code, devMode: !sent };
};

// 2. OTP
app.post("/api/auth/send-otp", async (req, res) => {
  const { email, purpose } = req.body;
  if (!email || !["register", "reset"].includes(purpose)) {
    return res.status(400).json({ error: "Email dan tujuan OTP (register/reset) wajib diisi." });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: "Format email tidak valid." });
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (purpose === "register" && existing.length > 0) {
      return res.status(400).json({ error: "Email sudah terdaftar." });
    }
    if (purpose === "reset" && existing.length === 0) {
      return res.status(400).json({ error: "Email tidak terdaftar di sistem." });
    }

    const result = await issueOtp(normalizedEmail, purpose);
    if (!result.ok) {
      return res.status(429).json({ error: `Tunggu ${result.cooldown} detik sebelum mengirim ulang OTP.` });
    }

    return res.json({
      success: true,
      message: result.devMode
        ? "Mode demo: SMTP belum dikonfigurasi, kode OTP ditampilkan di bawah."
        : "Kode OTP telah dikirim ke email Anda. Berlaku 5 menit.",
      devMode: result.devMode,
      devOtp: result.code
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal mengirim OTP." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, otp } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nama, email, dan password wajib diisi." });
  }
  if (!otp) {
    return res.status(400).json({ error: "Kode OTP wajib diisi." });
  }

  try {
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await db.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Email sudah terdaftar." });
    }

    // Verifikasi OTP
    const otpRow = await getLatestOtp(normalizedEmail, "register");
    if (!otpRow || new Date(otpRow.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP tidak valid atau sudah kedaluwarsa. Kirim ulang OTP." });
    }
    if (otpRow.attempts >= OTP_MAX_ATTEMPTS) {
      await invalidateOtps(normalizedEmail, "register");
      return res.status(400).json({ error: "Terlalu banyak percobaan OTP. Kirim ulang kode baru." });
    }
    if (String(otp).trim() !== otpRow.code) {
      await db.execute("UPDATE otps SET attempts = attempts + 1 WHERE id = ?", [otpRow.id]);
      const sisa = OTP_MAX_ATTEMPTS - otpRow.attempts - 1;
      return res.status(400).json({ error: `Kode OTP salah. Sisa ${Math.max(sisa, 0)} percobaan.` });
    }
    await invalidateOtps(normalizedEmail, "register");

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.execute(
      "INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, 'user')",
      [name, normalizedEmail, passwordHash]
    );

    const token = generateToken({ id: result.insertId, name, email, role: "user" });
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

// Reset password via tautan: kirim link ke email (bukan kode OTP)
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 menit

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email wajib diisi." });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: "Format email tidak valid." });
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existing.length === 0) {
      return res.status(400).json({ error: "Email tidak terdaftar di sistem." });
    }

    const token = require("crypto").randomBytes(32).toString("hex");
    await db.execute("DELETE FROM reset_tokens WHERE email = ?", [normalizedEmail]);
    await db.execute(
      "INSERT INTO reset_tokens (email, token, expiresAt) VALUES (?, ?, ?)",
      [normalizedEmail, token, new Date(Date.now() + RESET_TOKEN_TTL_MS)]
    );

    const appUrl = String(process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const sent = await sendResetLinkEmail(normalizedEmail, resetUrl);

    // Jangan ungkap ke client apakah email terdaftar/terkirim detail — cukup pesan netral
    return res.json({
      success: true,
      message: sent
        ? "Tautan reset password telah dikirim ke email Anda. Berlaku 15 menit."
        : "Mode demo: SMTP belum dikonfigurasi. (Tautan tidak terkirim)",
      devMode: !sent,
      devUrl: sent ? null : resetUrl
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memproses permintaan reset password." });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token dan password baru wajib diisi." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "Password baru minimal 6 karakter." });
  }

  try {
    const [row] = await db.query(
      "SELECT * FROM reset_tokens WHERE token = ? AND used = 0 ORDER BY id DESC LIMIT 1",
      [String(token).trim()]
    );
    if (!row || new Date(row.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: "Tautan reset tidak valid atau sudah kedaluwarsa. Kirim ulang permintaan reset." });
    }
    const [user] = await db.query("SELECT id FROM users WHERE email = ?", [row.email]);
    if (!user) {
      return res.status(400).json({ error: "Akun tidak ditemukan." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET passwordHash = ? WHERE id = ?", [passwordHash, user.id]);
    await db.execute("UPDATE reset_tokens SET used = 1 WHERE id = ?", [row.id]);

    return res.json({ success: true, message: "Password berhasil direset. Silakan login dengan password baru." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal mereset password." });
  }
});

// Midtrans webhook notification handler (auto-updates payment status)
// NOTE: placed before authenticateToken middleware so Midtrans can reach it without a Bearer token
app.post("/api/payments/notification", async (req, res) => {
  const { order_id, transaction_status, fraud_status, status_code, gross_amount, signature_key } = req.body;

  if (!order_id || !transaction_status) {
    return res.status(400).json({ error: "Payload notifikasi tidak valid." });
  }

  // Verifikasi signature agar tidak ada pihak lain yang bisa memalsukan notifikasi
  if (serverKey) {
    const crypto = require("crypto");
    const expected = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code || ""}${gross_amount || ""}${serverKey}`)
      .digest("hex");
    if (!signature_key || expected !== String(signature_key).toLowerCase()) {
      return res.status(403).json({ error: "Signature notifikasi tidak valid." });
    }
  }

  // Map status Midtrans -> status aplikasi
  // settlement/capture = lunas. challenge/fraud belum final -> jangan langsung PAID.
  let status = "PENDING";
  if (transaction_status === "capture" || transaction_status === "settlement") {
    if (fraud_status === "challenge" || fraud_status === "deny") {
      status = "PENDING"; // masih direview, jangan ubah ke PAID
    } else {
      status = "PAID";
    }
  } else if (["deny", "cancel", "expire", "refund", "chargeback", "partial_refund", "partial_chargeback"].includes(transaction_status)) {
    status = "REJECTED";
  } else if (transaction_status === "pending" || transaction_status === "authorize") {
    status = "PENDING";
  }

  try {
    const [existing] = await db.query("SELECT status, event_id, ticket_qty, user_name, totalBayar FROM payments WHERE orderId = ?", [order_id]);
    if (!existing) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan." });
    }

    // Cegah transisi mundur: pembayaran PAID tidak boleh ditimpa PENDING/REJECTED oleh webhook terlambat
    if (existing.status === "PAID" && status === "PENDING") {
      return res.json({ success: true, ignored: "already_paid" });
    }

    // Perbarui status secara atomik â€” hanya berhasil kalau status sebelumnya belum PAID
    const result = await db.execute(
      "UPDATE payments SET status = ?, verifiedAt = ? WHERE orderId = ? AND status <> 'PAID'",
      [status, status === "PAID" ? new Date() : null, order_id]
    );

    // Tambah stok terjual hanya jika transisi ini yang memicu PAID (hasil update > 0 baris)
    if (status === "PAID" && result.affectedRows > 0 && existing.event_id) {
      await db.execute(
        "UPDATE events SET sold = sold + ? WHERE id = ?",
        [existing.ticket_qty || 1, existing.event_id]
      );
      await logActivity(existing.user_name || "Sistem", "PURCHASE", `Pembayaran ${order_id} terverifikasi otomatis (Midtrans).`);
    } else if (status === "REJECTED" && result.affectedRows > 0 && existing.status === "PAID" && existing.event_id) {
      // Refund/chargeback setelah lunas: kembalikan stok yang terlanjur bertambah
      await db.execute(
        "UPDATE events SET sold = GREATEST(sold - ?, 0) WHERE id = ?",
        [existing.ticket_qty || 1, existing.event_id]
      );
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
    const events = await db.query("SELECT * FROM events WHERE status <> 'DRAFT' ORDER BY date ASC");
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data event." });
  }
});

app.get("/api/events/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID event tidak valid." });
  }
  try {
    const [rows] = await db.query("SELECT * FROM events WHERE id = ? AND status <> 'DRAFT'", [id]);
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

app.get("/api/dashboard/stats", requireRole("admin"), async (req, res) => {
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
app.get("/api/dashboard/activity", requireRole("admin"), async (req, res) => {
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
  const price = Number(ticketPrice);
  const qty = Number(quota);
  const allowedStatus = ["ACTIVE", "SOLD OUT", "CLOSED", "DRAFT"];
  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: "Harga tiket tidak valid." });
  }
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ error: "Kuota tiket harus bilangan bulat positif." });
  }
  if (isNaN(new Date(date).getTime())) {
    return res.status(400).json({ error: "Tanggal event tidak valid." });
  }
  const finalStatus = status && allowedStatus.includes(status) ? status : "ACTIVE";

  try {
    const result = await db.execute(
      "INSERT INTO events (name, artist, category, date, time, location, ticketPrice, quota, sold, status, poster, banner, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)",
      [name, artist, category, date, time || "19:00", location, price, qty, finalStatus, poster || null, banner || null, description || null]
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
  const { event, eventId, ticketQty, totalBayar } = req.body;
  const user = req.user.name || "Guest";
  const email = req.user.email;

  const qty = Number(ticketQty);
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ error: "Jumlah tiket tidak valid." });
  }
  if (!Number.isFinite(Number(totalBayar)) || Number(totalBayar) <= 0) {
    return res.status(400).json({ error: "Jumlah pembayaran tidak valid." });
  }
  if (!event || !eventId) {
    return res.status(400).json({ error: "Data pembayaran tidak lengkap." });
  }

  let orderId = null;
  try {
    // Validasi kuota tiket (stok) sebelum membuat transaksi
    const [ev] = await db.query("SELECT name, ticketPrice, quota, sold, status FROM events WHERE id = ?", [eventId]);
    if (!ev) {
      return res.status(404).json({ error: "Event tidak ditemukan." });
    }
    if (ev.status === "SOLD OUT" || ev.status === "CLOSED" || ev.status === "DRAFT") {
      return res.status(400).json({ error: `Tiket untuk event "${ev.name}" sudah tidak tersedia.` });
    }
    const remaining = Number(ev.quota) - Number(ev.sold);
    if (qty > remaining) {
      return res.status(400).json({ error: `Stok tiket tidak mencukupi. Sisa tiket: ${remaining}.` });
    }
    // Validasi nominal: hitung ulang dari harga di DB agar totalBayar tidak bisa dimanipulasi client
    const minimumTotal = Number(ev.ticketPrice) * qty;
    if (Number(totalBayar) < minimumTotal) {
      return res.status(400).json({ error: `Jumlah pembayaran tidak valid. Minimal Rp ${minimumTotal.toLocaleString("id-ID")}.` });
    }

    const orderIdValue = `EP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    orderId = orderIdValue;

    const result = await db.execute(
      "INSERT INTO payments (orderId, user_name, email, event_id, ticket_qty, totalBayar, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')",
      [orderId, user, email, eventId, qty, Number(totalBayar)]
    );

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(totalBayar)
      },
      item_details: [
        {
          id: eventId,
          price: Number(ev.ticketPrice),
          quantity: qty,
          name: `Tiket ${ev.name}`
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
    await db.execute("UPDATE payments SET snap_token = ?, redirect_url = ? WHERE orderId = ?", [
      snapResponse.token,
      snapResponse.redirect_url,
      orderId
    ]);
    res.status(201).json({
      success: true,
      payment: { orderId, status: "PENDING" },
      token: snapResponse.token,
      redirectUrl: snapResponse.redirect_url
    });
  } catch (error) {
    // Hapus baris PENDING yang gagal dibuat di Midtrans agar tidak jadi sampah
    try {
      await db.execute("DELETE FROM payments WHERE orderId = ? AND status = 'PENDING' AND snap_token IS NULL", [orderId]);
    } catch (_) { /* abaikan */ }
    if (error.httpStatusCode) {
      return res.status(Number(error.httpStatusCode) === 401 || Number(error.httpStatusCode) === 403 ? 502 : 400).json({
        error: error.message || "Gagal membuat transaksi pembayaran."
      });
    }
    console.error(error);
    res.status(500).json({ error: "Gagal membuat transaksi pembayaran." });
  }
});

// Poll payment status from frontend after Snap popup
app.get("/api/payments/:orderId/status", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM payments WHERE orderId = ?", [req.params.orderId]);
    if (!rows) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan." });
    }

    // IDOR guard: hanya pemilik transaksi (atau admin) yang boleh melihat status
    if (rows.email !== req.user.email && req.user.role !== "admin") {
      return res.status(403).json({ error: "Akses ditolak. Anda tidak memiliki izin untuk melihat transaksi ini." });
    }

    // Sinkronkan status langsung ke Midtrans bila pembayaran belum final.
    // Ini memastikan status PAID terdeteksi otomatis tanpa bergantung webhook dashboard.
    if (rows.status === "PENDING" || rows.status === "REJECTED") {
      try {
        const mt = await snap.transaction.status(req.params.orderId);
        let newStatus = rows.status;
        if (mt.transaction_status === "capture" || mt.transaction_status === "settlement") {
          if (mt.fraud_status !== "challenge" && mt.fraud_status !== "deny") {
            newStatus = "PAID";
          }
        } else if (["deny", "cancel", "expire", "refund", "chargeback"].includes(mt.transaction_status)) {
          newStatus = "REJECTED";
        }
        if (newStatus !== rows.status) {
          const update = await db.execute(
            "UPDATE payments SET status = ?, verifiedAt = ? WHERE orderId = ? AND status <> 'PAID'",
            [newStatus, newStatus === "PAID" ? new Date() : null, req.params.orderId]
          );
          if (newStatus === "PAID" && update.affectedRows > 0 && rows.event_id) {
            await db.execute(
              "UPDATE events SET sold = sold + ? WHERE id = ?",
              [rows.ticket_qty || 1, rows.event_id]
            );
          }
          rows.status = newStatus;
        }
      } catch (err) {
        console.warn(`Gagal sinkron status Midtrans untuk ${req.params.orderId}:`, err.message || err);
      }
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

    // Atomic: hanya transisi yang benar-benar mengubah status yang diterapkan
    const updatedAt = status === "PAID" ? new Date() : null;
    const result = await db.execute(
      "UPDATE payments SET status = ?, verifiedAt = ? WHERE orderId = ? AND status <> 'PAID'",
      [status, updatedAt, orderId]
    );
    if (result.affectedRows === 0) {
      // Tidak ada perubahan (sudah PAID, atau status sama)
      const [fresh] = await db.query("SELECT * FROM payments WHERE orderId = ?", [orderId]);
      return res.json({ success: true, unchanged: true, payment: fresh });
    }

    // Jika diverifikasi PAID manual (tanpa webhook), tambahkan stok terjual event
    if (status === "PAID" && existing.event_id) {
      await db.execute(
        "UPDATE events SET sold = sold + ? WHERE id = ?",
        [existing.ticket_qty || 1, existing.event_id]
      );
    } else if (status === "REJECTED" && existing.status === "PAID" && existing.event_id) {
      // PAID -> REJECTED: kembalikan stok yang terlanjur bertambah
      await db.execute(
        "UPDATE events SET sold = GREATEST(sold - ?, 0) WHERE id = ?",
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

// 404 untuk route API yang tidak dikenal (JSON, bukan HTML)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});

// Global error handler (harus sebelum app.listen)
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error("Unhandled error:", err);
  }
  res.status(status).json({ error: status >= 500 ? "Internal Server Error" : (err.message || "Bad Request") });
});

// Jangan biarkan uncaught exception/unhandled rejection menghentikan server
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const startServer = async () => {
  // Listen TERLEBIH DAHULU agar server tetap hidup & tidak 502 di Railway
  // meskipun database belum siap.
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Inisialisasi database setelah server menyala; gagal connect hanya di-log,
  // server Express tetap berjalan.
  try {
    await db.initSchema();
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

startServer();

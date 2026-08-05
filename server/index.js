const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const db = require("./db");
const dataStore = require("./data");

const app = express();
const PORT = process.env.PORT || 5001;
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

// New auth routes (namespace: /api/auth)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  try {
    const users = await db.query("SELECT id, name, email, passwordHash, role FROM users WHERE email = ?", [email]);
    if (!users.length) return res.status(401).json({ error: "Email atau Password salah." });

    const user = users[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Email atau Password salah." });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ success: true, message: "Login successful.", user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memproses login." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, dan password wajib diisi." });
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ error: "Email sudah terdaftar." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insert = await db.execute("INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)", [name, email, passwordHash, role || 'user']);
    const rows = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [insert.insertId]);
    console.log('DEBUG register insertId=', insert.insertId, 'rows=', rows);
    const user = rows[0];
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ success: true, message: "Registrasi berhasil.", user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memproses registrasi." });
  }
});

// Public registration endpoint
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ error: "Email sudah terdaftar." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.execute("INSERT INTO users (email, passwordHash, role) VALUES (?, ?, 'user')", [email, passwordHash]);
    const rows = await db.query("SELECT id, email, role FROM users WHERE id = ?", [result.insertId]);
    const user = rows[0];
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({ success: true, message: "Registrasi berhasil.", user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal memproses registrasi." });
  }
});

// Public payment gateway creation and checkout endpoints
app.post("/api/payments/create", async (req, res) => {
  const { user, email, event, totalBayar, gateway } = req.body;
  if (!user || !email || !event || !totalBayar) {
    return res.status(400).json({ error: "Informasi pembayaran tidak lengkap." });
  }

  try {
    const orderId = `PGW-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const avatar = user
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

    await db.execute(
      "INSERT INTO payments (orderId, user, avatar, event, totalBayar, status, transferSlip, verifiedAt) VALUES (?, ?, ?, ?, ?, 'PENDING', FALSE, NULL)",
      [orderId, user, avatar, event, Number(totalBayar)]
    );

    const [rows] = await db.query("SELECT * FROM payments WHERE orderId = ?", [orderId]);
    const payment = rows[0];
    const gatewayLink = `https://mockpay.electricpulse.com/checkout/${orderId}`;

    return res.status(201).json({
      success: true,
      message: "Link pembayaran gateway berhasil dibuat.",
      payment,
      gatewayLink,
      provider: gateway || "MockPay"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal membuat sesi pembayaran." });
  }
});

app.post("/api/payments/:orderId/checkout", async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await db.execute(
      "UPDATE payments SET status = 'PAID', verifiedAt = ? WHERE orderId = ?",
      [new Date(), orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transaksi pembayaran tidak ditemukan." });
    }

    const [rows] = await db.query("SELECT * FROM payments WHERE orderId = ?", [orderId]);
    return res.json({ success: true, message: "Pembayaran berhasil diproses melalui gateway.", payment: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menuntaskan pembayaran gateway." });
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
    console.warn("Falling back to mock JSON storage so the API remains available for testing.");

    // Simple file-backed mock implementation for query/execute
    const fs = require("fs");
    const path = require("path");
    const mockPath = path.join(__dirname, "mock_users.json");

    const readMock = () => {
      try {
        const txt = fs.readFileSync(mockPath, "utf8");
        return JSON.parse(txt || "[]");
      } catch (e) {
        return [];
      }
    };
    const writeMock = (arr) => fs.writeFileSync(mockPath, JSON.stringify(arr, null, 2));

    const paymentsMockPath = path.join(__dirname, "mock_payments.json");
    const readPaymentsMock = () => {
      try {
        const txt = fs.readFileSync(paymentsMockPath, "utf8");
        return JSON.parse(txt || "[]");
      } catch (e) {
        return [];
      }
    };
    const writePaymentsMock = (arr) => fs.writeFileSync(paymentsMockPath, JSON.stringify(arr, null, 2));

    // override db.query and db.execute for limited users + payments operations used by auth and admin endpoints
    db.query = async (sql, params = []) => {
      console.log('MOCK QUERY:', sql, params);
      const users = readMock();
      const payments = readPaymentsMock();

      if (/SELECT id FROM users WHERE email = \?/i.test(sql)) {
        const email = params[0];
        return users.filter(u => u.email === email).map(u => ({ id: u.id }));
      }
      if (/SELECT id, email, passwordHash, role FROM users WHERE email = \?/i.test(sql)) {
        const email = params[0];
        return users.filter(u => u.email === email).map(u => ({ id: u.id, email: u.email, passwordHash: u.passwordHash, role: u.role }));
      }
      if (/SELECT \* FROM users WHERE id = \?/i.test(sql) || /SELECT id, email, role FROM users WHERE id = \?/i.test(sql) || /SELECT id, name, email, role FROM users WHERE id = \?/i.test(sql)) {
        const id = params[0];
        return users.filter(u => u.id == id);
      }
      if (/SELECT \* FROM payments ORDER BY createdAt DESC/i.test(sql)) {
        return payments.slice().sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
      }
      if (/SELECT \* FROM payments WHERE orderId = \?/i.test(sql)) {
        const orderId = params[0];
        return payments.filter((p) => p.orderId === orderId);
      }
      return [];
    };

    db.execute = async (sql, params = []) => {
      const users = readMock();
      const payments = readPaymentsMock();
      if (/INSERT INTO users/i.test(sql)) {
        const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        let name = null;
        let email = null;
        let passwordHash = null;
        let role = 'user';
        if (params.length >= 4) {
          name = params[0];
          email = params[1];
          passwordHash = params[2];
          role = params[3] || 'user';
        } else {
          email = params[0];
          passwordHash = params[1];
          role = params[2] || 'user';
        }
        const newUser = { id, name, email, passwordHash, role };
        users.push(newUser);
        writeMock(users);
        return { insertId: id, affectedRows: 1 };
      }
      if (/INSERT INTO payments/i.test(sql)) {
        const id = payments.length ? Math.max(...payments.map((p) => Number(p.orderId.replace(/\D/g, '')) || 0)) + 1 : 1;
        const orderId = params[0];
        const user = params[1];
        const avatar = params[2];
        const event = params[3];
        const totalBayar = Number(params[4]);
        const status = params[5] || 'PENDING';
        const transferSlip = params[6] === true || params[6] === 1 || params[6] === 'true';
        const verifiedAt = params[7] || null;
        const newPayment = { orderId, user, avatar, event, totalBayar, status, transferSlip, verifiedAt, createdAt: new Date().toISOString() };
        payments.push(newPayment);
        writePaymentsMock(payments);
        return { insertId: orderId, affectedRows: 1 };
      }
      if (/UPDATE payments SET status = \?, verifiedAt = \? WHERE orderId = \?/i.test(sql) || /UPDATE payments SET status = 'PAID', verifiedAt = \? WHERE orderId = \?/i.test(sql)) {
        const status = sql.includes("status = 'PAID'") ? 'PAID' : params[0];
        const updatedAt = sql.includes("status = 'PAID'") ? params[0] : params[1];
        const orderId = sql.includes("status = 'PAID'") ? params[1] : params[2];
        const payment = payments.find((p) => p.orderId === orderId);
        if (!payment) {
          return { affectedRows: 0 };
        }
        payment.status = status;
        payment.verifiedAt = updatedAt;
        writePaymentsMock(payments);
        return { affectedRows: 1 };
      }
      return { affectedRows: 1 };
    };

    app.listen(PORT, () => {
      console.log(`Backend server (mock DB) is running on http://localhost:${PORT}`);
    });
  }
};

startServer();

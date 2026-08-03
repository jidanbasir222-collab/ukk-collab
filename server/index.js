const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dataStore = require("./data");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// 1. Authentication
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  if (email === "admin@electricpulse.com" && password === "admin123") {
    return res.json({
      success: true,
      message: "Login successful.",
      user: { email, role: "Master Admin" }
    });
  } else {
    return res.status(401).json({ error: "Email atau Password salah." });
  }
});

// 2. Dashboard Statistics
app.get("/api/dashboard/stats", (req, res) => {
  const events = dataStore.getEvents();
  
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === "ACTIVE").length;
  const totalSoldTickets = events.reduce((sum, e) => sum + e.sold, 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.sold * e.ticketPrice), 0);
  const verifiedRevenueToday = dataStore.getVerifiedRevenueToday();

  res.json({
    totalEvents,
    activeEvents,
    totalSoldTickets,
    totalRevenue,
    verifiedRevenueToday
  });
});

// 3. Events REST API
app.get("/api/events", (req, res) => {
  res.json(dataStore.getEvents());
});

app.post("/api/events", (req, res) => {
  const { name, artist, category, date, time, ticketPrice, quota, location, description } = req.body;
  if (!name || !artist || !category || !date || !location) {
    return res.status(400).json({ error: "Field utama event wajib diisi." });
  }

  const newEvent = {
    id: (dataStore.getEvents().length + 1).toString(),
    name,
    artist,
    category,
    date,
    time: time || "19:00",
    location,
    ticketPrice: Number(ticketPrice) || 0,
    quota: Number(quota) || 5000,
    sold: 0,
    status: "ACTIVE",
    poster: null,
    banner: null
  };

  const saved = dataStore.addEvent(newEvent);
  res.status(201).json(saved);
});

app.delete("/api/events/:id", (req, res) => {
  const { id } = req.params;
  dataStore.deleteEvent(id);
  res.json({ success: true, message: "Event berhasil dihapus." });
});

// 4. Artists REST API
app.get("/api/artists", (req, res) => {
  res.json(dataStore.getArtists());
});

app.post("/api/artists", (req, res) => {
  const { name, genre, instagram, activeEvents } = req.body;
  if (!name || !instagram) {
    return res.status(400).json({ error: "Nama dan Instagram artis wajib diisi." });
  }

  const newArtist = {
    id: (dataStore.getArtists().length + 1).toString(),
    name,
    genre: (genre || "SYNTHWAVE").toUpperCase(),
    instagram: instagram.startsWith("@") ? instagram : `@${instagram}`,
    activeEvents: Number(activeEvents) || 0,
    avatarIndex: Math.floor(Math.random() * 3)
  };

  const saved = dataStore.addArtist(newArtist);
  res.status(201).json(saved);
});

app.delete("/api/artists/:id", (req, res) => {
  const { id } = req.params;
  dataStore.deleteArtist(id);
  res.json({ success: true, message: "Artis berhasil dihapus." });
});

// 5. Categories REST API
app.get("/api/categories", (req, res) => {
  res.json(dataStore.getCategories());
});

app.post("/api/categories", (req, res) => {
  const { name, icon, color, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nama kategori wajib diisi." });
  }

  const newCategory = {
    id: (dataStore.getCategories().length + 1).toString(),
    name,
    icon: icon || "music",
    color: color || "pink",
    description: description || "No description provided."
  };

  const saved = dataStore.addCategory(newCategory);
  res.status(201).json(saved);
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  dataStore.deleteCategory(id);
  res.json({ success: true, message: "Kategori berhasil dihapus." });
});

// 6. Payments Verification REST API
app.get("/api/payments", (req, res) => {
  res.json(dataStore.getPayments());
});

app.post("/api/payments/:orderId/verify", (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // PAID or REJECTED

  if (!["PAID", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Status pembayaran tidak valid." });
  }

  const updated = dataStore.updatePaymentStatus(orderId, status);
  if (!updated) {
    return res.status(404).json({ error: "Transaksi pembayaran tidak ditemukan." });
  }

  res.json({ success: true, payment: updated });
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Electric Pulse Console Backend API is running successfully!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

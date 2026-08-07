const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "electricpulse-secret";
const TOKEN_EXPIRES_IN = "2h";

const normalizeRole = (role) => {
  if (!role) return "user";
  return String(role).toLowerCase().includes("admin") ? "admin" : "user";
};

const generateToken = (user) => jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token tidak ditemukan. Silakan login kembali." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token tidak valid. Silakan login kembali." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { ...payload, role: normalizeRole(payload.role) };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token telah kedaluwarsa. Silakan login kembali." });
    }
    return res.status(401).json({ error: "Token tidak valid atau telah dimanipulasi. Silakan login kembali." });
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Autentikasi diperlukan sebelum melanjutkan." });
  }

  const role = normalizeRole(req.user.role);
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ error: "Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini." });
  }

  next();
};

module.exports = {
  JWT_SECRET,
  TOKEN_EXPIRES_IN,
  normalizeRole,
  generateToken,
  authenticateToken,
  requireRole
};

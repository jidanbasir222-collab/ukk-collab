const jwt = require("jsonwebtoken");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const PLACEHOLDER_SECRETS = ["your_jwt_secret_here", "electricpulse-secret", "secret", "changeme"];
const isProduction = process.env.NODE_ENV === "production";

// Di production, JWT_SECRET sebaiknya diset di env (Railway). Jika tidak ada/placeholder,
// server TIDAK boleh mati total (DoS sendiri): generate secret acak kuat saat boot sebagai
// fallback sementara, dan log peringatan agar admin segera melengkapi env.
const missingOrPlaceholderSecret =
  !process.env.JWT_SECRET ||
  PLACEHOLDER_SECRETS.includes(String(process.env.JWT_SECRET).toLowerCase());

let JWT_SECRET = process.env.JWT_SECRET;
if (missingOrPlaceholderSecret) {
  if (isProduction) {
    const crypto = require("crypto");
    JWT_SECRET = crypto.randomBytes(48).toString("hex");
    console.error("PERINGATAN: JWT_SECRET tidak diset/placeholder di production. Memakai secret acak sementara — semua sesi akan reset saat server restart. Set JWT_SECRET di Railway Settings!")
  } else {
    console.warn("PERINGATAN KEAMANAN: JWT_SECRET masih placeholder. Ganti dengan string acak panjang di server/.env (dan di Railway)!");
  }
}
const TOKEN_EXPIRES_IN = "2h";
const TOKEN_EXPIRES_IN_REMEMBER = "30d";

const normalizeRole = (role) => {
  if (!role) return "user";
  return String(role).toLowerCase().includes("admin") ? "admin" : "user";
};

// rememberMe = true -> sesi panjang 30 hari, selain itu 2 jam
const generateToken = (user, rememberMe = false) =>
  jwt.sign(user, JWT_SECRET, { expiresIn: rememberMe ? TOKEN_EXPIRES_IN_REMEMBER : TOKEN_EXPIRES_IN });

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

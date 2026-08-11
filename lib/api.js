// Helper API terpusat: base URL, session (localStorage), dan penanganan 401.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ideal-wonder-production-445e.up.railway.app";

// Pajak 10% — nilai sama dengan perhitungan server (server/index.js) agar preview konsisten.
export const TAX_RATE = 0.1;

export const getToken = () => (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const setSession = (token, user) => {
  window.localStorage.setItem("token", token);
  window.localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
};

// Kembalikan header Authorization jika token tersedia
export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch wrapper: lempar Error berisi pesan dari server, dan otomatis
// logout + redirect ke /login saat token kedaluwarsa (401).
export const apiFetch = async (url, options = {}, redirectOn401 = true) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  if (res.status === 401 && redirectOn401) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sesi Anda telah kedaluwarsa. Silakan login kembali.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Permintaan gagal (${res.status}).`);
  }
  return data;
};

// Konversi nilai TIME MySQL ("19:00:00") menjadi "19:00"
export const formatTime = (t) => {
  if (!t) return "";
  const s = String(t);
  return s.includes(":") ? s.slice(0, 5) : s;
};

// Konversi tanggal MySQL ("2026-08-10") menjadi "10 Agustus 2026" (UTC-safe, tidak geser 1 hari)
export const formatDate = (d) => {
  if (!d) return "";
  const s = String(d);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, day] = s.slice(0, 10).split("-");
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(day)));
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

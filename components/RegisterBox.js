"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Info, Send } from "lucide-react";

export default function RegisterBox() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ideal-wonder-production-445e.up.railway.app";

  const sendOtp = async () => {
    if (!name || !email || !password) {
      setError("Lengkapi nama, email, dan password terlebih dahulu.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      setError("Format email tidak valid.");
      return;
    }
    if (String(password).length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setError("");
    setMessage("");
    setDevOtp("");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "register" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Gagal mengirim OTP");
        return;
      }
      setOtpSent(true);
      setMessage(data.message || "Kode OTP telah dikirim ke email Anda.");
      if (data.devMode && data.devOtp) setDevOtp(data.devOtp);
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otpSent) {
      await sendOtp();
      return;
    }
    if (!otp) {
      setError("Masukkan kode OTP yang Anda terima.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Registrasi gagal");
        setLoading(false);
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      router.push(data.user?.role === "admin" ? "/admin" : "/user");
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-[#141419] border border-[#26262f] rounded-2xl p-8 glow-card transition-all duration-300 hover:border-[#ff3b70]/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="bg-[#ff3b70]/10 border border-[#ff3b70]/30 text-[#ff3b70] text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {devOtp && (
          <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#c4b5fd] text-xs px-4 py-3 rounded-xl">
            <span className="font-bold">Mode demo (SMTP belum dikonfigurasi):</span> kode OTP Anda adalah{" "}
            <span className="font-mono font-bold text-lg tracking-widest">{devOtp}</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            disabled={otpSent}
            className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-4 pr-4 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={otpSent}
              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Secure Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={otpSent}
              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono disabled:opacity-50"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b8b9a] hover:text-white transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {otpSent && (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Kode OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6 digit kode"
              required
              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-4 pr-4 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono text-center tracking-[0.5em]"
            />
            <button
              type="button"
              onClick={sendOtp}
              disabled={sending}
              className="text-[11px] text-[#8b8b9a] hover:text-white underline transition-colors text-left disabled:opacity-50"
            >
              Kirim ulang kode OTP
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-[#8b8b9a]">Akun biasa hanya dapat mendaftar sebagai user.</span>
          <Link href="/login" className="text-xs text-[#8b8b9a] hover:text-white underline">Already have an account?</Link>
        </div>

        <button type="submit" disabled={loading || sending} className="w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {sending ? (
            "Mengirim OTP..."
          ) : loading ? (
            "Memproses..."
          ) : otpSent ? (
            <>
              <Send className="w-4 h-4" />
              Verifikasi & Daftar
            </>
          ) : (
            "Kirim Kode OTP"
          )}
        </button>

      </form>
    </div>
  );
}

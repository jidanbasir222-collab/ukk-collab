"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, Zap, Shield, Info, Lock, KeyRound, CheckCircle2 } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [devUrl, setDevUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ideal-wonder-production-445e.up.railway.app";

  // Mode 1: minta tautan reset
  const sendResetLink = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevUrl("");
    if (!email) {
      setError("Email wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Format email tidak valid. Contoh: nama@contoh.com");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Gagal mengirim tautan reset");
        return;
      }
      setMessage(data.message || "Tautan reset password telah dikirim ke email Anda.");
      if (data.devMode && data.devUrl) setDevUrl(data.devUrl);
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // Mode 2: set password baru dari tautan
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!newPassword) {
      setError("Isi password baru Anda.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Gagal mereset password");
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] px-4 py-16 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#ff3b70]/10 via-[#8b5cf6]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* Logo and Branding Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-4">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5 font-mono">
            Electric Pulse
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#8b8b9a] font-bold">Admin Portal</p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-[#141419]/90 border border-[#26262f] rounded-3xl p-8 glow-card backdrop-blur-md transition-all duration-300 hover:border-[#ff3b70]/20">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-wide">Password Berhasil Direset</h2>
              <p className="text-xs text-[#8b8b9a] leading-relaxed">
                Password akun Anda telah diperbarui. Silakan masuk dengan password baru.
              </p>
              <Link
                href="/login"
                className="mt-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Kembali ke Login</span>
              </Link>
            </div>
          ) : token ? (
            <form onSubmit={handleReset} className="flex flex-col gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Buat Password Baru</h2>
                <p className="text-xs text-[#8b8b9a] leading-relaxed">
                  Masukkan password baru untuk akun Anda.
                </p>
              </div>

              {error && (
                <div className="bg-[#ff3b70]/10 border border-[#ff3b70]/30 text-[#ff3b70] text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{loading ? "Memproses..." : "Reset Password"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex justify-center mt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#8b8b9a] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Login</span>
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={sendResetLink} className="flex flex-col gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Reset Password</h2>
                <p className="text-xs text-[#8b8b9a] leading-relaxed">
                  Masukkan email Anda. Kami akan mengirimkan tautan reset password ke email Anda.
                </p>
              </div>

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
              {devUrl && (
                <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#c4b5fd] text-xs px-4 py-3 rounded-xl">
                  <span className="font-bold">Mode demo (SMTP belum dikonfigurasi):</span>
                  <a href={devUrl} className="block font-mono text-[11px] underline break-all mt-1">{devUrl}</a>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{loading ? "Mengirim..." : "Kirim Tautan Reset"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-2.5 bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-[#ff3b70] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-[#8b8b9a]">
                  Tautan berlaku selama 15 menit dan hanya bisa digunakan sekali. Jika tidak menerima email,
                  periksa folder spam atau kirim ulang.
                </p>
              </div>

              <div className="flex justify-center mt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#8b8b9a] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Secure Environment Notice */}
        <div className="mt-8 flex items-center gap-1.5 text-[10px] text-[#50505f] font-semibold tracking-wide uppercase">
          <Shield className="w-3.5 h-3.5 text-[#ff3b70]" />
          <span>Secure 256-bit AES Admin Environment</span>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

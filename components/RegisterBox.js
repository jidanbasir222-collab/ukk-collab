"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const securityNotes = [
  "Akses akun user tersimpan aman di sisi platform.",
  "Gunakan email aktif untuk verifikasi dan riwayat tiket.",
];

export default function RegisterBox() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Registrasi gagal.");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      router.push("/login");
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi beberapa saat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,32,0.96),rgba(14,14,20,0.96))] p-6 shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1 text-[11px] font-medium text-[#d6c5ff]">
            <Sparkles className="h-3.5 w-3.5" />
            Member Access
          </div>
          <h2 className="text-2xl font-semibold text-white">Create Account</h2>
          <p className="mt-2 text-sm leading-6 text-[#9ca3af]">
            Daftar untuk mengakses event, tiket digital, dan histori transaksi.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#ff4fa0]">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#ff4fa0]/25 bg-[#ff4fa0]/10 px-4 py-3 text-sm text-[#ffc5de]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <Field
          label="FULL NAME"
          icon={UserRound}
          type="text"
          value={name}
          onChange={setName}
          placeholder="Nama lengkap kamu"
        />

        <Field
          label="WORK EMAIL"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="nama@company.com"
        />

        <div className="space-y-2">
          <label className="text-[10px] font-semibold tracking-[0.28em] text-[#7d7f92]">
            SECURE PASSWORD
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              required
              className="h-12 w-full rounded-2xl border border-white/8 bg-[#090a0f] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-[#565b66] focus:border-[#8b5cf6]/60 focus:bg-[#0f1017]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] transition hover:text-white"
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.24em] text-[#7d7f92]">
            SECURITY NOTES
          </p>
          <div className="space-y-2">
            {securityNotes.map((note) => (
              <div key={note} className="flex items-start gap-2 text-sm text-[#b9bfd0]">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#ff4fa0_0%,#7c3aed_100%)] text-sm font-semibold text-white shadow-[0_16px_40px_rgba(255,79,160,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>{loading ? "Memproses..." : "Buat Akun"}</span>
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#8b8fa3]">
        <span>Sudah punya akun?</span>
        <Link href="/login" className="font-medium text-[#f7a4cb] transition hover:text-white">
          Kembali ke login
        </Link>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-semibold tracking-[0.28em] text-[#7d7f92]">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          className="h-12 w-full rounded-2xl border border-white/8 bg-[#090a0f] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#565b66] focus:border-[#8b5cf6]/60 focus:bg-[#0f1017]"
        />
      </div>
    </div>
  );
}

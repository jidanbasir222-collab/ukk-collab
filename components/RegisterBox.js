"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Info } from "lucide-react";

export default function RegisterBox() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Registrasi gagal");
        setLoading(false);
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      router.push("/");
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

        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-4 pr-4 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono"
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
              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono"
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
              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b8b9a] hover:text-white transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-[#18181f] border border-[#26262f] rounded-xl px-3 py-2 text-sm text-white font-mono">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <Link href="/" className="text-xs text-[#8b8b9a] hover:text-white underline">Already have an account?</Link>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99]">
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>

      </form>
    </div>
  );
}

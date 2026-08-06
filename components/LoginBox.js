"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
  X,
  Sparkles
} from "lucide-react";

export default function LoginBox({ email, setEmail, password, setPassword, handleLogin, authError, showPassword, setShowPassword, loading }) {
  return (
    <div className="w-full max-w-[420px] bg-[#141419] border border-[#26262f] rounded-2xl p-8 glow-card transition-all duration-300 hover:border-[#ff3b70]/20">
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        {authError && (
          <div className="bg-[#ff3b70]/10 border border-[#ff3b70]/30 text-[#ff3b70] text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Email field */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
            <input
              type="email"
              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono"
              placeholder="admin@electricpulse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Secure Password</label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b8b9a] hover:text-white transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between text-xs mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              defaultChecked
              className="accent-[#ff3b70] rounded border-[#26262f] bg-[#18181f]"
            />
            <span className="text-[#8b8b9a] hover:text-white transition-colors">Keep me signed in</span>
          </label>
          <a href="#" className="text-[#ff3b70] hover:underline hover:text-[#ff5c8a] transition-all font-medium">
            Reset Access?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Login ke Pulse"}
        </button>

        {/* Register Link Button */}
        <div className="mt-3 text-center">
          <Link href="/register" className="inline-block py-2 px-4 rounded-lg border border-[#26262f] text-sm text-[#8b8b9a] hover:border-[#ff3b70]/40 hover:text-white transition-colors">
            Register
          </Link>
        </div>
      </form>

      {/* Secure Environment Notice */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#8b8b9a] font-medium border-t border-[#26262f]/40 pt-4">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Secure 256-bit AES Login Environment</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, Zap, Shield, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("admin@electricpulse.com");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
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
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Reset Password</h2>
                <p className="text-xs text-[#8b8b9a] leading-relaxed">
                  Masukkan email kerja Anda untuk menerima tautan pemulihan.
                </p>
              </div>

              {/* Email Input Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/50 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{loading ? "Mengirim..." : "Kirim Tautan Pemulihan"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Back to Login Link */}
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
            <div className="flex flex-col items-center text-center py-4 gap-5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-1 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Tautan Terkirim!</h2>
                <p className="text-xs text-[#8b8b9a] leading-relaxed">
                  Kami telah mengirimkan instruksi pemulihan kata sandi ke email kerja Anda:
                </p>
                <p className="text-xs font-mono text-white bg-[#18181f] border border-[#26262f] px-3 py-2 rounded-lg mt-2 inline-block">
                  {email}
                </p>
              </div>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-[#1f1f2a] border border-[#26262f] hover:border-[#ff3b70]/30 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Login</span>
              </Link>
            </div>
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

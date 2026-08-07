"use client";

import Link from "next/link";
import { Activity, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] px-6 text-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(6,182,212,0.08),_transparent_60%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-md flex flex-col items-center gap-6">
        {/* Pulsing Cyan Circle Icon */}
        <div className="w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.25)] animate-pulse-slow">
          <Activity className="w-8 h-8 text-cyan-400" />
        </div>

        {/* 404 Heading */}
        <div className="space-y-2">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
            404
          </h1>
          <h2 className="text-xl font-bold tracking-wider gradient-text font-mono">
            Pulse Lost
          </h2>
        </div>

        {/* Description Text */}
        <p className="text-sm text-[#8b8b9a] leading-relaxed max-w-sm">
          The signal you are looking for has been disconnected or moved. The node cannot be found in the current network matrix.
        </p>

        {/* Navigation Button */}
        <div className="mt-2">
          <Link
            href="/user"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-extrabold text-white gradient-btn shadow-lg shadow-[#ff3b70]/15 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-8 text-[10px] text-[#50505f] font-semibold tracking-wider">
        © 2026 Electric Pulse. All rights reserved.
      </div>
    </main>
  );
}

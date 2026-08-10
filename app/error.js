"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Terjadi error pada halaman:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] text-[#f4f4f5] font-sans px-6">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ff3b70]/10 border border-[#ff3b70]/30 flex items-center justify-center text-3xl font-extrabold text-[#ff3b70] font-mono">
          !
        </div>
        <h1 className="text-xl font-extrabold text-white font-mono">Terjadi Kesalahan</h1>
        <p className="text-xs text-[#8b8b9a] font-medium leading-relaxed">
          Maaf, halaman ini gagal dimuat. Kamu bisa coba muat ulang atau kembali ke beranda.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-[#26262f] text-[#8b8b9a] hover:text-white hover:border-[#ff3b70]/30 transition-all"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}

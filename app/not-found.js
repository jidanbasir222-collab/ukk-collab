import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060b] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),transparent_24%),radial-gradient(circle_at_bottom,rgba(255,79,160,0.18),transparent_24%),linear-gradient(180deg,rgba(5,6,11,0.96),rgba(5,6,11,1))]" />

      <section className="relative w-full max-w-xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,18,25,0.96),rgba(10,11,16,0.96))] p-8 text-center shadow-[0_32px_100px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.16)]">
          <Radio className="h-8 w-8" />
        </div>

        <p className="mt-8 text-5xl font-semibold text-white">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Pulse Lost</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#a4acbb]">
          Sinyal yang kamu cari tidak ditemukan atau sudah dipindahkan dari jaringan
          event Electric Pulse.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#ff4fa0_0%,#7c3aed_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(255,79,160,0.24)] transition hover:brightness-110"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </div>

        <p className="mt-8 text-xs text-[#6f7788]">
          © 2026 Electric Pulse. All rights reserved.
        </p>
      </section>
    </main>
  );
}

import Link from "next/link";
import { ArrowLeft, Shield, Ticket, Zap } from "lucide-react";
import RegisterBox from "../../components/RegisterBox";

const highlights = [
  {
    icon: Ticket,
    title: "Smart Ticketing",
    description: "Kelola pembelian tiket, akses QR, dan check-in dari satu akun.",
  },
  {
    icon: Zap,
    title: "Realtime Access",
    description: "Pantau update event, status transaksi, dan perubahan jadwal lebih cepat.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Autentikasi dan data akun dirancang tetap aman untuk setiap pengguna.",
  },
];

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,79,160,0.16),transparent_22%),linear-gradient(180deg,rgba(5,6,11,0.94),rgba(5,6,11,1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:74px_74px] opacity-30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#c6c9d3] transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke landing
          </Link>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.8fr]">
          <section className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1 text-xs font-medium text-[#d6c5ff]">
              <span className="h-2 w-2 rounded-full bg-[#22d3ee]" />
              Electric Pulse Access
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Masuk ke ekosistem event modern dengan akun yang siap dipakai.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#aeb4c3] sm:text-lg">
              Halaman register ini dibuat dengan nuansa neon dark seperti referensi:
              fokus ke branding, keamanan akun, dan CTA yang jelas untuk onboarding.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#11131a] text-[#ff4fa0]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#98a2b3]">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <RegisterBox />
          </section>
        </div>
      </div>
    </main>
  );
}

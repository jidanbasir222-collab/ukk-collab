"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  Shield,
  AlertTriangle,
  ArrowRight,
  Music
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";

const STATUS_STYLE = {
  ACTIVE: "bg-cyan-500/10 border-cyan-400/40 text-cyan-300",
  "SOLD OUT": "bg-[#26262f]/50 border-white/10 text-[#8b8b9a]",
  CLOSED: "bg-red-500/10 border-red-400/30 text-red-400"
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setTimeout(() => setIsLoggedIn(true), 0);

    fetch(`${API_BASE}/api/events/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event tidak ditemukan");
        return res.json();
      })
      .then(setEvent)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050d] text-white">
        <p className="text-sm font-semibold">Memuat detail event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#05050d] text-white">
        <AlertTriangle className="w-10 h-10 text-[#ff3b70]" />
        <p className="text-sm font-bold">Event tidak ditemukan.</p>
        <Link href="/events" className="text-xs font-bold text-[#ff3b70] hover:underline flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke daftar event
        </Link>
      </div>
    );
  }

  const sold = Number(event.sold) || 0;
  const quota = Number(event.quota) || 1;
  const remaining = Math.max(quota - sold, 0);
  const occupancy = Math.min(Math.round((sold / quota) * 100), 100);
  const soldOut = event.status === "SOLD OUT" || event.status === "CLOSED" || remaining <= 0;

  const handleOrder = () => {
    if (!isLoggedIn) {
      router.push(`/login?next=/events/${event.id}`);
      return;
    }
    router.push(`/user?checkout=${event.id}&qty=${qty}`);
  };

  return (
    <main className="min-h-screen bg-[#05050d] text-[#f4f4f5] overflow-x-hidden font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#26262f]/45 bg-[#05050d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ff3b70] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#ff3b70]/10">
              <span className="text-white text-xs font-extrabold font-mono">EP</span>
            </div>
            <span className="text-sm font-extrabold text-white tracking-wider font-mono">Electric Pulse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider text-[#8b8b9a] uppercase">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <span className="text-white border-b-2 border-[#ff3b70] pb-1">Detail Event</span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b8b9a] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke semua event
        </Link>

        {/* Hero Banner */}
        <div
          className="relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl h-80 md:h-[420px] flex flex-col justify-end p-6 md:p-10"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(5,5,13,0.97) 10%, rgba(5,5,13,0.55) 55%, rgba(5,5,13,0.25) 100%), url('${event.banner || event.poster || DEFAULT_IMAGE}')`
          }}
        >
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider border bg-white/5 border-white/10 text-[#c7c7d4] font-mono">
                {event.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider border font-mono ${STATUS_STYLE[event.status] || STATUS_STYLE.CLOSED}`}>
                {event.status}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold font-mono leading-tight text-white">{event.name}</h1>
            <p className="text-xs md:text-sm text-[#c7c7d4] font-medium leading-relaxed max-w-xl">
              {event.artist ? `Bersama ${event.artist} ` : ""}
              {event.description || "Pengalaman konser yang tak terlupakan."}
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-white/10">
              <span className="flex items-center gap-2 text-xs font-semibold text-[#8b8b9a] font-mono">
                <Clock className="w-4 h-4 text-[#ff3b70]" />
                {event.time || "19:00"} WIB
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold text-[#8b8b9a] font-mono">
                <Calendar className="w-4 h-4 text-[#ff3b70]" />
                {new Date(event.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold text-[#8b8b9a] font-mono">
                <MapPin className="w-4 h-4 text-[#ff3b70]" />
                {event.location}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left: Deskripsi */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-[#0d0d14]/90 p-7 space-y-4">
              <h2 className="text-base font-extrabold text-white font-mono">Tentang Event</h2>
              <p className="text-xs leading-relaxed text-[#8b8b9a] font-medium">
                {event.description || "Detail lengkap event akan segera diumumkan. Pantau terus halaman ini untuk informasi terbaru."}
              </p>
            </div>

            {/* Ketersediaan Tiket */}
            <div className="rounded-3xl border border-white/5 bg-[#0d0d14]/90 p-7 space-y-4">
              <h2 className="text-base font-extrabold text-white font-mono">Ketersediaan Tiket</h2>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8b8b9a] font-semibold">
                  <Users className="w-3.5 h-3.5 inline text-[#ff3b70] mr-1" />
                  {sold.toLocaleString("id-ID")} terjual dari {quota.toLocaleString("id-ID")} tiket
                </span>
                <span className={`font-extrabold ${soldOut ? "text-red-400" : "text-cyan-400"}`}>{occupancy}%</span>
              </div>

              <div className="w-full h-2.5 bg-[#09090b] rounded-full overflow-hidden border border-[#26262f]/40">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    soldOut ? "bg-red-500" : "bg-gradient-to-r from-[#ff3b70] to-[#8b5cf6]"
                  }`}
                  style={{ width: `${occupancy}%` }}
                />
              </div>

              {soldOut ? (
                <p className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Tiket sudah habis atau event ditutup.
                </p>
              ) : remaining <= quota * 0.2 ? (
                <p className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Sisa {remaining} tiket! Segera pesan sebelum kehabisan.
                </p>
              ) : (
                <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5" /> Masih tersedia {remaining} tiket.
                </p>
              )}
            </div>
          </div>

          {/* Right: Order Box */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-white/5 bg-[#0d0d14]/90 p-7 space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-white font-mono">Pesan Tiket</h3>
                <p className="text-[10px] text-[#8b8b9a] font-semibold mt-1">Harga per tiket sudah termasuk pajak.</p>
              </div>

              <div className="rounded-2xl border border-[#ff3b70]/20 bg-[#ff3b70]/5 p-5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#8b8b9a] font-bold">Harga Tiket</span>
                  <p className="text-xl font-mono font-extrabold text-[#ff3b70] mt-1">
                    Rp {Number(event.ticketPrice).toLocaleString("id-ID")}
                  </p>
                </div>
                <Music className="w-8 h-8 text-[#ff3b70]/40" />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Jumlah Tiket</span>
                <div className="flex items-center gap-4 border border-[#26262f] bg-[#141419] rounded-xl px-3 py-1.5">
                  <button
                    disabled={qty <= 1 || soldOut}
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    className="text-[#8b8b9a] hover:text-white cursor-pointer disabled:opacity-30 text-base font-bold"
                  >
                    −
                  </button>
                  <span className="text-xs font-mono font-extrabold w-6 text-center text-white">{qty}</span>
                  <button
                    disabled={soldOut || qty >= remaining}
                    onClick={() => setQty((v) => Math.min(remaining, v + 1))}
                    className="text-[#8b8b9a] hover:text-white cursor-pointer disabled:opacity-30 text-base font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border-t border-[#26262f]/45 pt-4 flex items-end justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#8b8b9a] font-bold">Total Bayar</span>
                  <p className="text-xl font-mono font-extrabold text-white mt-1">
                    Rp {(Number(event.ticketPrice) * qty).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={soldOut}
                className="w-full py-4 rounded-xl text-white font-extrabold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {soldOut ? (
                  <span>Habis / Ditutup</span>
                ) : (
                  <>
                    <span>{isLoggedIn ? "Lanjut ke Pembayaran" : "Masuk untuk Memesan"}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#8b8b9a] font-semibold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pembayaran aman via Midtrans</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

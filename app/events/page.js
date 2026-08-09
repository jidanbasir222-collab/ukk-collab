"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Calendar, MapPin, ArrowRight, Ticket, ChevronDown } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";

const STATUS_STYLE = {
  ACTIVE: "bg-cyan-500/10 border-cyan-400/30 text-cyan-400",
  "SOLD OUT": "bg-[#26262f]/50 border-white/10 text-[#8b8b9a]",
  CLOSED: "bg-red-500/10 border-red-400/30 text-red-400"
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [priceRange, setPriceRange] = useState(2000000);
  const [sortBy, setSortBy] = useState("Terdekat");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setTimeout(() => setIsLoggedIn(true), 0);
    fetch(`${API_BASE}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch((err) => console.error("Gagal memuat event:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((ev) => ev.category && set.add(ev.category));
    return ["Semua Kategori", ...Array.from(set)];
  }, [events]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = events.filter((ev) => {
      if (ev.status === "DRAFT") return false;
      if (category !== "Semua Kategori" && ev.category !== category) return false;
      if (Number(ev.ticketPrice) > priceRange) return false;
      if (q && !(`${ev.name} ${ev.artist} ${ev.location} ${ev.category}`.toLowerCase().includes(q))) return false;
      return true;
    });

    switch (sortBy) {
      case "Harga Terendah":
        list = [...list].sort((a, b) => Number(a.ticketPrice) - Number(b.ticketPrice));
        break;
      case "Harga Tertinggi":
        list = [...list].sort((a, b) => Number(b.ticketPrice) - Number(a.ticketPrice));
        break;
      case "Paling Laris":
        list = [...list].sort((a, b) => Number(b.sold) - Number(a.sold));
        break;
      default:
        list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return list;
  }, [events, searchQuery, category, priceRange, sortBy]);

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
            <Link href="/events" className="text-white border-b-2 border-[#ff3b70] pb-1">Events</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/user"
                className="rounded-xl bg-[#ff3b70] px-4.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#ff3b70]/15 hover:bg-[#ff5c8a] transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-[#26262f] bg-[#141419] px-4.5 py-2.5 text-xs font-bold text-white hover:border-[#ff3b70]/30 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-[#ff3b70] px-4.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#ff3b70]/15 hover:bg-[#ff5c8a] transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-4 sm:px-10">
        <h1 className="text-3xl font-extrabold text-white font-mono">
          Jelajahi <span className="gradient-text">Semua Event</span>
        </h1>
        <p className="text-xs text-[#8b8b9a] font-semibold mt-2">
          Temukan konser dan festival musik favoritmu, lalu pesan tiketnya secara online.
        </p>
      </section>

      {/* Search + Filters */}
      <section className="mx-auto max-w-6xl px-6 py-6 sm:px-10">
        <div className="rounded-3xl border border-white/5 bg-[#0d0d14]/90 p-6 space-y-5">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
            <input
              type="text"
              placeholder="Cari event, artis, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141419] border border-[#26262f] rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wider">Kategori</span>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#141419] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer font-semibold pr-10"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b8b9a]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wider">Urutkan</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#141419] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer font-semibold pr-10"
                >
                  <option>Terdekat</option>
                  <option>Harga Terendah</option>
                  <option>Harga Tertinggi</option>
                  <option>Paling Laris</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b8b9a]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
              <span className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wider">
                Harga Maksimal: <span className="text-[#ff3b70]">Rp {priceRange.toLocaleString("id-ID")}</span>
              </span>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#ff3b70] h-1.5 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-extrabold text-white">
            {filtered.length} Event ditemukan
          </h2>
        </div>

        {loading ? (
          <p className="text-xs text-[#8b8b9a] font-semibold text-center py-16">Memuat event...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Ticket className="w-10 h-10 text-[#26262f] mx-auto" />
            <p className="text-sm font-bold text-white">Tidak ada event yang cocok</p>
            <p className="text-xs text-[#8b8b9a]">Coba ubah kata kunci atau filter pencarianmu.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-[#0d0d14]/90 border border-white/5 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#ff3b70]/25 flex flex-col"
              >
                <div
                  className="h-44 bg-cover bg-center shrink-0 relative"
                  style={{ backgroundImage: `url('${item.poster || item.banner || DEFAULT_IMAGE}')` }}
                >
                  <div className="absolute top-4 right-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold border tracking-wider ${STATUS_STYLE[item.status] || STATUS_STYLE.CLOSED}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3.5 flex flex-col flex-1">
                  <div className="flex-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#8b8b9a] font-bold font-mono">{item.category}</span>
                    <h3 className="text-sm font-extrabold text-white mt-0.5 group-hover:text-[#ff3b70] transition-colors leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-[#50505f] font-bold mt-0.5 font-mono">{item.artist}</p>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-[#26262f]/45 pt-3 text-[11px] font-medium text-[#8b8b9a] font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#ff3b70]/70" />
                      {formatDate(item.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#ff3b70]/70" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#ff3b70] font-bold pt-0.5">
                      Rp {Number(item.ticketPrice).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/events/${item.id}`)}
                    className="w-full py-3 rounded-xl bg-[#ff3b70] hover:bg-[#ff5c8a] text-white text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Lihat Detail & Pesan Tiket</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#26262f]/45 bg-[#05050d] py-8 text-[11px] text-[#8b8b9a] font-semibold">
        <div className="mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-6xl px-6 sm:px-10">
          <p>© 2026 Electric Pulse. All rights reserved.</p>
          <div className="flex items-center flex-wrap gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

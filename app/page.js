"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ticket, Users, TrendingUp, Bell, Calendar, MapPin, ArrowRight, Share2 } from "lucide-react";

const features = [
  {
    title: "Smart Ticketing",
    description: "Secure, blockchain-verified tickets with dynamic pricing and instant digital delivery.",
    icon: Ticket,
    color: "text-[#ff3b70] bg-[#ff3b70]/10 border-[#ff3b70]/25"
  },
  {
    title: "Artist Management",
    description: "Comprehensive tools for routing, technical riders, and seamless communication.",
    icon: Users,
    color: "text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/25"
  },
  {
    title: "Real-time Analytics",
    description: "Deep dive into sales data, audience demographics, and venue occupancy instantly.",
    icon: TrendingUp,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"
  }
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://railway.app";

const STATUS_STYLE = {
  ACTIVE: "bg-cyan-500/10 border-cyan-400/30 text-cyan-400",
  "SOLD OUT": "bg-[#26262f]/50 border-white/10 text-[#8b8b9a]",
  CLOSED: "bg-red-500/10 border-red-400/30 text-red-400",
  DRAFT: "bg-[#26262f]/50 border-white/10 text-[#8b8b9a]"
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";

const formatEventDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const token = localStorage.getItem("token");
      if (token) setIsLoggedIn(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  // Ambil event publik dari API agar data selalu terbaru
  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data.filter((ev) => ev.status !== "DRAFT").slice(0, 8));
        }
      })
      .catch((err) => console.error("Gagal memuat event:", err));
  }, []);

  return (
    <main className="min-h-screen bg-[#05050d] text-[#f4f4f5] overflow-x-hidden font-sans relative">
      {/* Hero Concert Background with neon laser overlay */}
      <div className="absolute top-0 left-0 w-full h-[640px] md:h-[720px] pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.22]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80')`
          }}
        />
        {/* Pink and purple laser beam overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,59,112,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.14),_transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(5,5,13,0)_60%,_#05050d_100%)]" />
        {/* Abstract grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Header (Screenshot Navbar) */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ff3b70] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#ff3b70]/10">
            <span className="text-white text-xs font-extrabold font-mono">EP</span>
          </div>
          <span className="text-sm font-extrabold text-white tracking-wider font-mono">Electric Pulse</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider text-[#8b8b9a] uppercase">
          <a href="#" className="text-white border-b-2 border-[#ff3b70] pb-1">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#events" className="hover:text-white transition-colors">Events</a>
          <a href="#support" className="hover:text-white transition-colors">Support</a>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/user"
                className="w-8.5 h-8.5 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#8b8b9a] hover:text-white transition-all"
              >
                <Bell className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  setIsLoggedIn(false);
                }}
                className="rounded-xl border border-[#26262f] bg-[#ff3b70]/10 text-xs font-bold px-4 py-2 text-[#ff3b70] hover:bg-[#ff3b70]/20 transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
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
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:px-10 text-center flex flex-col items-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Experience the <span className="gradient-text font-mono">Pulse of Future</span> Events
          </h1>
          
          <p className="text-xs sm:text-sm text-[#8b8b9a] leading-relaxed max-w-lg mx-auto font-medium">
            The ultimate platform for ticketing, artist management, and real-time analytics. Step into the future of live entertainment.
          </p>

          <div className="pt-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 py-4 px-8 rounded-full text-xs font-extrabold text-white gradient-btn shadow-lg shadow-[#ff3b70]/25 hover:scale-[1.02] transition-all"
            >
              <span>Jelajahi Event</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-extrabold text-white font-mono">
            Platform <span className="text-[#06b6d4]">Features</span>
          </h2>
          <p className="text-xs text-[#8b8b9a] max-w-md mx-auto font-semibold">
            Everything you need to manage and experience world-class events.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-white/5 bg-[#0d0d14]/90 p-8 shadow-xl transition-all duration-300 hover:border-[#ff3b70]/20 hover:-translate-y-0.5"
              >
                <div className={`mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${feature.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-white mb-2 tracking-wide">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-[#8b8b9a] font-medium">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Events Section */}
      <section id="events" className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="flex items-end justify-between mb-8 border-b border-[#26262f]/45 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white font-mono">
              Popular <span className="text-[#ff3b70]">Events</span>
            </h2>
            <p className="text-xs text-[#8b8b9a] font-semibold mt-1">Trending shows you don&apos;t want to miss.</p>
          </div>
          <Link
            href="/events"
            className="text-xs font-bold text-[#ff3b70] hover:text-[#ff5c8a] hover:underline transition-all flex items-center gap-1.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-xs text-[#8b8b9a] font-semibold text-center py-10">
            Belum ada event yang dipublikasikan. Silakan kembali lagi nanti.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((item) => (
              <Link
                key={item.id}
                href={`/events/${item.id}`}
                className="group bg-[#0d0d14]/90 border border-white/5 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#ff3b70]/25 block"
              >
                {/* Event Image */}
                <div
                  className="h-44 bg-cover bg-center shrink-0 relative"
                  style={{ backgroundImage: `url('${item.poster || item.banner || DEFAULT_IMAGE}')` }}
                >
                  {/* Badge Overlay */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold border tracking-wider ${STATUS_STYLE[item.status] || STATUS_STYLE.CLOSED}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3.5">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#8b8b9a] font-bold font-mono">{item.category}</span>
                    <h3 className="text-sm font-extrabold text-white mt-0.5 group-hover:text-[#ff3b70] transition-colors leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-[#50505f] font-bold mt-0.5 font-mono">{item.artist}</p>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-[#26262f]/45 pt-3 text-[11px] font-medium text-[#8b8b9a] font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#ff3b70]/70" />
                      {formatEventDate(item.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#ff3b70]/70" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#ff3b70] font-bold pt-0.5">
                      Rp {Number(item.ticketPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#26262f]/45 bg-[#05050d] py-8 text-[11px] text-[#8b8b9a] font-semibold">
        <div className="mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-6xl px-6 sm:px-10">
          <p>© 2026 Electric Pulse. All rights reserved.</p>
          <div className="flex items-center flex-wrap gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            <button
              onClick={() => triggerNotification("Share link copied to clipboard.")}
              className="text-[#8b8b9a] hover:text-white transition-colors p-1"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

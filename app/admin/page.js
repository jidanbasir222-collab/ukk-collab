"use client";

import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CreditCard,
  Disc3,
  LayoutDashboard,
  LogOut,
  MapPin,
  MonitorPlay,
  Search,
  Settings,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "event", label: "Event", icon: Ticket },
  { id: "artis", label: "Artis", icon: Disc3 },
  { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
  { id: "laporan", label: "Laporan", icon: Activity },
  { id: "pengaturan", label: "Settings", icon: Settings },
];

const overviewStats = [
  {
    label: "Total Penjualan",
    value: "Rp 248,6 Jt",
    delta: "+18.4%",
    tone: "pink",
  },
  {
    label: "Tiket Terjual",
    value: "8.420",
    delta: "+12.1%",
    tone: "purple",
  },
  {
    label: "Active Events",
    value: "12",
    delta: "+3 event",
    tone: "cyan",
  },
];

const eventCards = [
  {
    title: "light Tour 2024",
    subtitle: "Immersive synthwave showcase with futuristic stage production.",
    status: "Featured",
    date: "15 Nov 2024",
    location: "The Warehouse, Jakarta",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cinematic%20neon%20music%20festival%20stage%20with%20purple%20and%20pink%20lights%2C%20crowd%20silhouettes%2C%20futuristic%20concert%20poster%20style%2C%20realistic%20website%20hero%20image&image_size=landscape_16_9",
  },
  {
    title: "Synthwave Odyssey",
    subtitle: "Premium member launch with backstage analytics and VIP access.",
    status: "Special",
    date: "22 Nov 2024",
    location: "Beach Club, Bali",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20electronic%20concert%20poster%20with%20magenta%20laser%20visuals%2C%20futuristic%20music%20festival%20scene%2C%20realistic%20promotional%20art%20for%20admin%20dashboard&image_size=landscape_16_9",
  },
];

const recommendedEvents = [
  {
    title: "Neon Skyline",
    genre: "Live Session",
    price: "Rp 325K",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=night%20concert%20venue%20with%20neon%20city%20skyline%2C%20purple%20lighting%2C%20electronic%20music%20crowd%2C%20realistic%20event%20card%20image&image_size=landscape_4_3",
  },
  {
    title: "Electric Resonance",
    genre: "Festival",
    price: "Rp 490K",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=large%20outdoor%20electronic%20festival%20with%20pink%20and%20blue%20lights%2C%20energetic%20crowd%2C%20realistic%20promotional%20photography&image_size=landscape_4_3",
  },
  {
    title: "Analog Dreams",
    genre: "Indie Showcase",
    price: "Rp 210K",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20indoor%20music%20showcase%20with%20retro%20waveform%20visuals%2C%20magenta%20screen%20lighting%2C%20realistic%20event%20poster%20photo&image_size=landscape_4_3",
  },
];

const recentTransactions = [
  {
    event: "Neon Night Festival",
    purchased: "3 Aug 2026",
    amount: "Rp 875.000",
    status: "Success",
  },
  {
    event: "Synthwave Odyssey",
    purchased: "2 Aug 2026",
    amount: "Rp 1.250.000",
    status: "Success",
  },
  {
    event: "Cyber Pulse Live",
    purchased: "1 Aug 2026",
    amount: "Rp 410.000",
    status: "Review",
  },
];

function subscribeToStorage() {
  return () => {};
}

function readAdminSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem("token");
  const savedUser = window.localStorage.getItem("user");

  if (!token || !savedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    if (String(parsedUser.role).toLowerCase() !== "admin") {
      return null;
    }

    return parsedUser;
  } catch {
    return null;
  }
}

function statusClass(status) {
  if (status === "Success") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  return "border-amber-400/20 bg-amber-400/10 text-amber-200";
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const adminUser = useSyncExternalStore(
    subscribeToStorage,
    readAdminSession,
    () => null
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!adminUser) {
      router.replace("/login");
    }
  }, [adminUser, router]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const adminName = useMemo(() => {
    if (!adminUser) {
      return "Admin";
    }

    return adminUser.name || adminUser.email || "Admin";
  }, [adminUser]);

  if (!hydrated || !adminUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06070c] text-sm text-[#98a2b3]">
        Menyiapkan admin workspace...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06070c] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[260px] flex-col border-r border-white/8 bg-[#0a0b10] px-5 py-6 lg:flex">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff4fa0_0%,#7c3aed_100%)] font-semibold shadow-[0_12px_30px_rgba(255,79,160,0.3)]">
              EP
            </div>
            <div>
              <p className="font-semibold text-white">Electric Pulse</p>
              <p className="text-xs text-[#8b8fa3]">Admin Portal</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-[linear-gradient(90deg,rgba(255,79,160,0.22),rgba(124,58,237,0.22))] text-white shadow-[0_14px_40px_rgba(124,58,237,0.18)]"
                      : "text-[#9da3b4] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#7d7f92]">
              Admin Session
            </p>
            <p className="mt-3 text-sm font-medium text-white">{adminName}</p>
            <p className="mt-1 text-sm text-[#8b8fa3]">
              Akses penuh untuk event, pembayaran, dan laporan.
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.replace("/");
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#f6a8ca] transition hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <section className="flex-1 px-5 py-5 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#0d0f15]/80 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#697084]" />
                <input
                  type="text"
                  placeholder="Search events, artist, transactions..."
                  className="h-11 w-[320px] rounded-2xl border border-white/8 bg-[#08090e] pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#697084] focus:border-[#8b5cf6]/50"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#7d7f92]">
                  Admin Console
                </p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  Hello, {adminName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#c7cada] transition hover:bg-white/[0.06]"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#c7cada] transition hover:bg-white/[0.06]"
              >
                <Settings className="h-4 w-4" />
              </button>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#ff4fa0]/20 bg-[#ff4fa0]/10 px-4 text-sm font-medium text-[#ffc4df] transition hover:bg-[#ff4fa0]/15 hover:text-white"
              >
                Back to site
              </Link>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <section className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                {eventCards.map((event) => (
                  <article
                    key={event.title}
                    className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0e1016]"
                  >
                    <div
                      className="relative h-[260px] bg-cover bg-center"
                      style={{ backgroundImage: `linear-gradient(180deg, rgba(7,8,14,0.15), rgba(7,8,14,0.9)), url(${event.image})` }}
                    >
                      <div className="flex h-full flex-col justify-end p-6">
                        <span className="mb-3 inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                          {event.status}
                        </span>
                        <h2 className="max-w-sm text-3xl font-semibold leading-tight text-white">
                          {event.title}
                        </h2>
                        <p className="mt-3 max-w-md text-sm leading-6 text-[#c6cad6]">
                          {event.subtitle}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#c8cfdd]">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {event.date}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <section className="rounded-[28px] border border-white/8 bg-[#0d0f15] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#7d7f92]">
                      Recommended For You
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Event Picks
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-[#f6a8ca] transition hover:text-white"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {recommendedEvents.map((event) => (
                    <article
                      key={event.title}
                      className="overflow-hidden rounded-[24px] border border-white/8 bg-[#11131a]"
                    >
                      <div
                        className="h-36 bg-cover bg-center"
                        style={{ backgroundImage: `linear-gradient(180deg, rgba(8,9,14,0.12), rgba(8,9,14,0.84)), url(${event.image})` }}
                      />
                      <div className="p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-[#7d7f92]">
                          {event.genre}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-white">
                          {event.title}
                        </h3>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-[#9aa3b2]">{event.price}</span>
                          <button
                            type="button"
                            className="text-[#f6a8ca] transition hover:text-white"
                          >
                            See detail
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/8 bg-[#0d0f15] p-5 sm:p-6">
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#7d7f92]">
                    History
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Recent Transactions
                  </h2>
                </div>

                <div className="overflow-hidden rounded-[22px] border border-white/8">
                  <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                    <thead className="bg-white/[0.03] text-[#8f97aa]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Event Name</th>
                        <th className="px-4 py-3 font-medium">Date Purchased</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8 bg-[#0a0c11]">
                      {recentTransactions.map((transaction) => (
                        <tr key={`${transaction.event}-${transaction.purchased}`}>
                          <td className="px-4 py-4 text-white">{transaction.event}</td>
                          <td className="px-4 py-4 text-[#a7afbf]">
                            {transaction.purchased}
                          </td>
                          <td className="px-4 py-4 text-[#a7afbf]">
                            {transaction.amount}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs ${statusClass(transaction.status)}`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>

            <aside className="space-y-6">
              <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,79,160,0.14),rgba(124,58,237,0.1))] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#ffd1e6]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#ffcae1]">
                      Insight
                    </p>
                    <h2 className="text-lg font-semibold text-white">
                      Performance Snapshot
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {overviewStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-[#d8dbe6]">{item.label}</p>
                          <p className="mt-1 text-2xl font-semibold text-white">
                            {item.value}
                          </p>
                        </div>
                        <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-[#ffe1ee]">
                          {item.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/8 bg-[#0d0f15] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#7d7f92]">
                      Ticket Sales
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Today Overview
                    </h2>
                  </div>
                  <MonitorPlay className="h-5 w-5 text-[#7d7f92]" />
                </div>

                <div className="space-y-4">
                  <MetricRow label="VIP Access" value="350 tiket" progress="78%" />
                  <MetricRow label="Festival Ground" value="865 tiket" progress="92%" />
                  <MetricRow label="Wave Seating" value="170 tiket" progress="46%" />
                </div>
              </section>

              <section className="rounded-[28px] border border-white/8 bg-[#0d0f15] p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#7d7f92]">
                      Team Activity
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Latest Notes
                    </h2>
                  </div>
                  <Users className="h-5 w-5 text-[#7d7f92]" />
                </div>

                <div className="space-y-4">
                  <ActivityItem
                    title="Poster event diperbarui"
                    meta="Design Team · 18 menit lalu"
                  />
                  <ActivityItem
                    title="Pembayaran pending masuk review"
                    meta="Finance Team · 37 menit lalu"
                  />
                  <ActivityItem
                    title="Jadwal artis utama dikunci"
                    meta="Program Team · 1 jam lalu"
                  />
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricRow({ label, value, progress }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white">{label}</p>
          <p className="text-xs text-[#8b8fa3]">{value}</p>
        </div>
        <span className="text-sm font-medium text-[#f6a8ca]">{progress}</span>
      </div>
      <div className="h-2 rounded-full bg-white/8">
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#ff4fa0_0%,#7c3aed_100%)]"
          style={{ width: progress }}
        />
      </div>
    </div>
  );
}

function ActivityItem({ title, meta }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-[#8b8fa3]">{meta}</p>
    </article>
  );
}

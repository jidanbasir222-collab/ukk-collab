"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  CalendarDays,
  Ticket,
  Radio,
  Settings,
  HelpCircle,
  LifeBuoy,
  Search,
  Bell,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  Building,
  Wallet,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
  LogOut,
  QrCode,
  X,
  Activity,
  Heart,
  ChevronDown,
  Sun,
  Moon,
  Info,
  User,
  UserCircle,
  Users
} from "lucide-react";

export default function UserConsole() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  // Navigation & Theme States
  const [activeTab, setActiveTab] = useState("discover"); // default to discover to match screen
  const [theme, setTheme] = useState("light"); // default to light to match new screenshots
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("Synthwave");
  const [isPaying, setIsPaying] = useState(false);

  // Discover Filters
  const [filterConcert, setFilterConcert] = useState(true);
  const [filterFestival, setFilterConcertFestival] = useState(true);
  const [filterClubNight, setFilterClubNight] = useState(false);
  const [priceRange, setPriceRange] = useState(1500000);

  // Tickets Toggles
  const [ticketFilter, setTicketFilter] = useState("upcoming"); // upcoming, past

  // Settings State
  const [fullName, setFullName] = useState("Alex Vance");
  const [username, setUsername] = useState("alex_v");
  const [emailAddress, setEmailAddress] = useState("alex.vance@example.com");
  const [phoneNumber, setPhoneNumber] = useState("+1 (555) 019-2831");
  const [selectedGenres, setSelectedGenres] = useState(["Techno", "Synthwave", "Rock"]);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Checkout states
  const [selectedTicketTier, setSelectedTicketTier] = useState("VIP Access");
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const [meetGreetAddon, setMeetGreetAddon] = useState(true);
  const [timeLeft, setTimeLeft] = useState(284);

  // Custom DB states for live additions
  const [userTickets, setUserTickets] = useState([
    {
      id: "T1",
      event: "Cybernetic Symphony 2024",
      tier: "VIP Access",
      date: "OCT 24",
      venue: "The Neon Dome, Neo-Tokyo",
      code: "EP-89041",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
      status: "Active"
    },
    {
      id: "T2",
      event: "Underground Frequency",
      tier: "General Admission",
      date: "NOV 12",
      venue: "Sector 7 Warehouse",
      code: "EP-99382",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
      status: "Active"
    }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { id: "P1", eventName: "Neon Nights Festival", date: "Sep 15, 2024", amount: "Rp 1.490.000", status: "Success" },
    { id: "P2", eventName: "Synthwave Odyssey", date: "Aug 22, 2024", amount: "Rp 850.000", status: "Success" },
    { id: "P3", eventName: "Cyber Punk Live", date: "Jul 01, 2024", amount: "Rp 1.200.000", status: "Void" }
  ]);

  // Modals
  const [activeAccessTicket, setActiveAccessTicket] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [latestOrderInfo, setLatestOrderInfo] = useState(null);

  // Initialize
  useEffect(() => {
    const timeout = setTimeout(() => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        router.replace("/");
        return;
      }

      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setFullName(parsed.name || "Alex Vance");
        setEmailAddress(parsed.email || "alex.vance@example.com");
      } catch (err) {
        console.error(err);
        router.replace("/");
      } finally {
        setIsAuthChecked(true);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [router]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (activeTab === "checkout" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTab, timeLeft]);

  // Pricing calculations (IDR)
  const getTicketPrice = () => {
    switch (selectedTicketTier) {
      case "VIP Access": return 1500000;
      case "Festival Ground": return 850000;
      case "Tribune Seating": return 650000;
      default: return 850000;
    }
  };

  const formatIDR = (num) => "Rp " + Number(num).toLocaleString("id-ID");

  const ticketPrice = getTicketPrice();
  const addonPrice = meetGreetAddon ? 500000 : 0;
  const subtotal = (ticketPrice * ticketQuantity) + addonPrice;
  const taxes = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + taxes;

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Load Midtrans Snap.js script dynamically
  const loadSnapScript = () => {
    return new Promise((resolve) => {
      if (window.snap) {
        return resolve();
      }
      const script = document.createElement("script");
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-n8qxK7pwzW4Y6eEm");
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.body.appendChild(script);
    });
  };

  // Real purchase via Midtrans Snap payment gateway
  const handlePayment = async (e) => {
    e.preventDefault();
    if (isPaying) return;
    setIsPaying(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user: fullName || "Guest",
          email: emailAddress || "guest@example.com",
          event: "Neon Night Tour 2024",
          ticketQty: ticketQuantity,
          totalBayar: Math.round(total)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat transaksi pembayaran.");
      }

      await loadSnapScript();

      const onSnapSuccess = async (result) => {
        // Midtrans webhook will update the DB; poll status until PAID
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`${API_BASE}/api/payments/${data.payment.orderId}/status`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const statusData = await statusRes.json();
            if (statusData.status === "PAID") {
              clearInterval(pollInterval);
              const newTicket = {
                id: `T${userTickets.length + 1}`,
                event: "Neon Night Tour 2024",
                tier: selectedTicketTier,
                date: "DEC 15",
                venue: "The Zenith Arena, London",
                code: data.payment.orderId,
                image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80",
                status: "Active"
              };
              setUserTickets([newTicket, ...userTickets]);
              setLatestOrderInfo({
                orderId: data.payment.orderId,
                items: `${ticketQuantity}x ${selectedTicketTier === "VIP Access" ? "VIP Standing" : "General Standing"}`,
                total: formatIDR(total)
              });
              setShowSuccessModal(true);
              setTimeLeft(284);
            }
          } catch (err) {
            clearInterval(pollInterval);
            console.error(err);
          }
        }, 3000);

        // Stop polling after 2 minutes as a safety timeout
        setTimeout(() => clearInterval(pollInterval), 120000);
      };

      const onSnapPending = (result) => {
        triggerNotification("Pembayaran belum diselesaikan. Selesaikan di popup Midtrans.");
      };

      const onSnapError = (result) => {
        triggerNotification("Pembayaran dibatalkan atau gagal.");
      };

      window.snap.pay(data.token, {
        onSuccess: onSnapSuccess,
        onPending: onSnapPending,
        onError: onSnapError,
        onClose: () => {
          setIsPaying(false);
          setTimeLeft(284);
        }
      });
    } catch (error) {
      console.error(error);
      triggerNotification(error.message || "Gagal memproses pembayaran.");
      setIsPaying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/");
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Memeriksa sesi login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${
      theme === "dark" ? "bg-[#09090b] text-[#f4f4f5]" : "bg-[#f4f4f5] text-[#18181f]"
    }`}>
      
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d0d10] border-r border-[#26262f]/45 shrink-0 z-20">
        {/* Brand Header */}
        <div className="flex flex-col items-center py-6 border-b border-[#26262f]/45">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff3b70] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#ff3b70]/10 mb-3 animate-pulse-slow">
            <span className="text-white text-xs font-bold font-mono">EP</span>
          </div>
          <h2 className="text-sm font-extrabold text-white tracking-wider font-mono">Pulse Console</h2>
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#8b8b9a] font-bold mt-1">v1.0.42</span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "discover", label: "Discover", icon: Compass },
            { id: "tickets", label: "Tickets", icon: Ticket },
            { id: "live", label: "Live", icon: Radio },
            { id: "profile", label: "Profil", icon: User },
            { id: "settings", label: "Pengaturan", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#ff3b70]/15 to-[#8b5cf6]/5 text-white border-l-2 border-[#ff3b70]"
                    : "text-[#8b8b9a] hover:text-white hover:bg-[#141419]"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#ff3b70]" : "text-[#8b8b9a]"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-8">
            <button
              onClick={() => setActiveTab("discover")}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#ff3b70] to-[#8b5cf6]/90 hover:opacity-90 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff3b70]/10 hover:scale-[1.01]"
            >
              <Compass className="w-4 h-4 stroke-[3]" />
              <span>Jelajahi Events</span>
            </button>
          </div>

          <div className="h-px bg-[#26262f] my-6" />

          {/* Lower nav links */}
          <button
            onClick={() => triggerNotification("Documentation is offline.")}
            className="w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-bold tracking-wide text-[#8b8b9a] hover:text-white hover:bg-[#141419] cursor-pointer"
          >
            <HelpCircle className="w-4.5 h-4.5 text-[#8b8b9a]" />
            <span>Help</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-bold tracking-wide text-[#8b8b9a] hover:text-[#ff3b70] hover:bg-[#141419] cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-[#8b8b9a]" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* ==================== MAIN PANEL ==================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-[#0d0d10] border-b border-[#26262f]/45 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141419] border border-[#26262f] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title="Toggle Light/Dark Theme"
              className="w-8.5 h-8.5 rounded-xl border border-[#26262f] bg-[#141419] flex items-center justify-center text-[#8b8b9a] hover:text-white transition-all cursor-pointer"
            >
              {theme === "light" ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => triggerNotification("System is fully sync'd.")}
              className="w-8.5 h-8.5 rounded-xl border border-[#26262f] bg-[#141419] flex items-center justify-center text-[#8b8b9a] hover:text-white transition-all relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#ff3b70] shadow-sm shadow-[#ff3b70]" />
            </button>

            <div className="h-5 w-px bg-[#26262f]" />

            {/* Profile circular avatar */}
            <div
              className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-[#ff3b70]/20 to-[#8b5cf6]/20 border border-[#ff3b70]/30 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-[#ff3b70]/5 cursor-pointer hover:scale-105 transition-all overflow-hidden"
              onClick={() => setActiveTab("profile")}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span className="font-mono">AV</span>
            </div>
          </div>
        </header>

        {/* Notification panel */}
        {notification && (
          <div className="absolute top-20 right-6 bg-[#141419] border border-[#ff3b70]/40 text-white text-xs px-5 py-3.5 rounded-2xl flex items-center gap-3 z-50 shadow-2xl animate-fade-in max-w-sm backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b70] animate-ping" />
            <span className="font-medium">{notification}</span>
          </div>
        )}

        {/* Viewport content */}
        <main className={`flex-1 overflow-y-auto ${
          theme === "dark" ? "bg-[#09090b]" : "bg-[#f4f4f5]"
        }`}>

          {/* ==================== A. DASHBOARD VIEW (DARK STYLE) ==================== */}
          {activeTab === "dashboard" && (
            <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8 animate-fade-in text-[#f4f4f5]">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Welcome to the Grid, <span className="text-[#8b5cf6] font-mono">{fullName}</span>
                </h1>
                <p className="text-xs text-[#8b8b9a] mt-2 font-medium leading-relaxed max-w-2xl">
                  Experience high-voltage entertainment. Access your tickets, discover new events, and manage your pulse.
                </p>
              </div>

              {/* Tickets section */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold tracking-wider text-[#8b8b9a] uppercase">Active Tickets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {userTickets.slice(0, 2).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-[#141419] border border-[#26262f] rounded-2xl p-5 glow-card flex flex-col justify-between hover:border-[#ff3b70]/20 transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-white leading-snug">{ticket.event}</h4>
                          <p className="text-[11px] text-[#8b8b9a] font-mono leading-none">{ticket.date}</p>
                          <p className="text-[11px] text-[#50505f] font-semibold leading-relaxed flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#ff3b70]" />
                            {ticket.venue}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold border bg-[#ff3b70]/10 border-[#ff3b70]/30 text-[#ff3b70]">
                          {ticket.tier}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#26262f]/45 pt-4 mt-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-[#50505f] uppercase tracking-wider font-bold">Access Code</span>
                          <span className="text-xs font-mono text-[#8b8b9a] font-semibold">{ticket.code}</span>
                        </div>
                        <button
                          onClick={() => setActiveAccessTicket(ticket)}
                          className="py-2.5 px-4 rounded-xl text-[10px] font-bold tracking-wide text-white transition-all bg-[#1c1c24] hover:bg-[#ff3b70]/15 border border-[#26262f] hover:border-[#ff3b70]/40 flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#ff3b70]" />
                          <span>View Access Code</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Grid block */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* For You events */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold tracking-wider text-[#8b8b9a] uppercase">Events For You</h3>
                    <button
                      onClick={() => setActiveTab("discover")}
                      className="text-xs font-bold text-[#ff3b70] hover:text-[#ff5c8a] hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {[
                      { title: "Neon Nights", info: "Dec 15 · Subterranean Complex", price: "Dari Rp 450.000", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80" },
                      { title: "Headline Blueprint", info: "Dec 18 · Subterranean Complex", price: "Dari Rp 450.000", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80" }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#141419] border border-[#26262f] rounded-2xl overflow-hidden flex gap-4 p-4 hover:border-[#ff3b70]/20 transition-all duration-300 group"
                      >
                        <div
                          className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0 border border-[#26262f]/60"
                          style={{ backgroundImage: `url('${item.image}')` }}
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-[#ff3b70] font-bold">Pop Live</span>
                            <h4 className="text-sm font-bold text-white mt-0.5 truncate leading-tight group-hover:text-[#ff3b70] transition-colors">{item.title}</h4>
                            <p className="text-[11px] text-[#8b8b9a] font-mono mt-1 flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5 text-[#ff3b70]/60" />
                              {item.info}
                            </p>
                          </div>
                          <div className="flex items-center justify-between border-t border-[#26262f]/30 pt-2 mt-2">
                            <span className="text-xs font-mono font-bold text-white">{item.price}</span>
                            <button
                              onClick={() => {
                                setSelectedTicketTier("VIP Access");
                                setActiveTab("discover");
                              }}
                              className="text-xs font-bold text-[#ff3b70] hover:text-[#ff5c8a] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <span>Get Tickets</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* History list */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs font-bold tracking-wider text-[#8b8b9a] uppercase">Payment History</h3>
                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl glow-card overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#26262f] bg-[#0d0d10]/40 text-[#8b8b9a] font-bold uppercase tracking-wider">
                          <th className="py-3 px-4 text-[9px]">Event Name</th>
                          <th className="py-3 px-4 text-[9px] text-right">Amount</th>
                          <th className="py-3 px-4 text-[9px] text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#26262f]/45 font-mono text-[#8b8b9a]">
                        {paymentHistory.map((row) => (
                          <tr key={row.id} className="hover:bg-[#1c1c24]/30 transition-colors">
                            <td className="py-3.5 px-4 font-sans font-bold text-white truncate max-w-[120px]">{row.eventName}</td>
                            <td className="py-3.5 px-4 text-right text-[#f4f4f5] font-bold whitespace-nowrap">{row.amount}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                row.status === "Success"
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                  : "bg-red-500/10 border-red-500/30 text-red-400"
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${row.status === "Success" ? "bg-emerald-400" : "bg-red-400"}`} />
                                <span>{row.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== B. DISCOVER / SEARCH VIEW (SCREENSHOT 2 LIGHT/DARK COMPATIBLE) ==================== */}
          {activeTab === "discover" && (
            <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-8">
                
                {/* 1. Filter Panel (Left) */}
                <div className={`p-6 rounded-2xl border h-fit space-y-6 ${
                  theme === "dark" ? "bg-[#141419] border-[#26262f]" : "bg-white border-[#e5e7eb] shadow-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Filters</span>
                    <button
                      onClick={() => {
                        setFilterConcert(true);
                        setFilterConcertFestival(true);
                        setFilterClubNight(false);
                        setPriceRange(150);
                        setSearchQuery("Synthwave");
                      }}
                      className="text-xs font-bold text-[#ff3b70] hover:text-[#ff5c8a] hover:underline"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#8b8b9a] uppercase tracking-wide">Category</span>
                    <div className="flex flex-col gap-2.5 text-xs font-medium">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterConcert}
                          onChange={(e) => setFilterConcert(e.target.checked)}
                          className="accent-[#ff3b70] rounded border-gray-300 w-4 h-4 cursor-pointer"
                        />
                        <span>Concert</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterFestival}
                          onChange={(e) => setFilterConcertFestival(e.target.checked)}
                          className="accent-[#ff3b70] rounded border-gray-300 w-4 h-4 cursor-pointer"
                        />
                        <span>Festival</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterClubNight}
                          onChange={(e) => setFilterClubNight(e.target.checked)}
                          className="accent-[#ff3b70] rounded border-gray-300 w-4 h-4 cursor-pointer"
                        />
                        <span>Club Night</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-bold text-[#8b8b9a] uppercase tracking-wide">Price Range</span>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="100000"
                        max="1500000"
                        step="50000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full accent-[#ff3b70] bg-[#e5e7eb] rounded-lg appearance-none h-1 cursor-pointer"
                      />
                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <span>Rp 100rb</span>
                        <span className="text-[#ff3b70]">{formatIDR(priceRange)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#8b8b9a] uppercase tracking-wide">Date</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="py-2 rounded-xl text-[10px] font-bold bg-[#ff3b70]/10 border border-[#ff3b70]/25 text-[#ff3b70]">Today</button>
                      <button className={`py-2 rounded-xl text-[10px] font-bold border ${
                        theme === "dark" ? "border-[#26262f] text-white" : "border-[#e5e7eb] text-[#8b8b9a] hover:text-[#18181f]"
                      }`}>This Week</button>
                    </div>
                    <input
                      type="date"
                      className={`w-full text-xs p-3 rounded-xl border outline-none font-mono ${
                        theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb] text-[#50505f]"
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Results list (Right) */}
                <div className="space-y-6 flex-1 min-w-0">
                  <div className="flex items-center justify-between border-b border-[#26262f]/10 pb-3 flex-wrap gap-3">
                    <div>
                      <h2 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Search Results</h2>
                      <span className="text-[10px] text-[#8b8b9a] font-mono">Found 24 events matching &quot;{searchQuery}&quot;</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#8b8b9a] font-bold uppercase tracking-wider">Sort by</span>
                      <div className="relative">
                        <select className={`text-xs py-2 px-4 rounded-xl border outline-none font-semibold cursor-pointer appearance-none pr-8 ${
                          theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                        }`}>
                          <option>Relevance</option>
                          <option>Price: Low to High</option>
                          <option>Price: High to Low</option>
                          <option>Date: Soonest</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Grid of 3 Event Cards (Screenshot 2) */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        title: "Neon Nights 2024",
                        tag: "Festival",
                        tagColor: "bg-[#ff3b70]/10 border-[#ff3b70]/20 text-[#ff3b70]",
                        date: "Oct 12 - 14, 2024",
                        venue: "Cyber Dome, New...",
                        price: "Mulai dari Rp 850.000",
                        img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80"
                      },
                      {
                        title: "Midnight Cruiser",
                        tag: "Club Night",
                        tagColor: "bg-cyan-500/10 border-cyan-400/20 text-cyan-400",
                        date: "Nov 03, 2024",
                        venue: "The Void, Los Angeles",
                        price: "Mulai dari Rp 350.000",
                        img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80"
                      },
                      {
                        title: "Synth & Soul",
                        tag: "Concert",
                        tagColor: "bg-[#8b5cf6]/10 border-[#8b5cf6]/20 text-[#8b5cf6]",
                        date: "Dec 01, 2024",
                        venue: "Starlight Arena, Berlin",
                        price: "Mulai dari Rp 600.000",
                        img: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80"
                      }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#ff3b70]/40 transition-all duration-300 group shadow-sm ${
                          theme === "dark" ? "bg-[#141419] border-[#26262f]" : "bg-white border-[#e5e7eb]"
                        }`}
                      >
                        {/* Image banner */}
                        <div
                          className="h-36 bg-cover bg-center shrink-0 relative"
                          style={{ backgroundImage: `url('${item.img}')` }}
                        >
                          <span className={`absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold border tracking-wider font-mono ${item.tagColor}`}>
                            {item.tag}
                          </span>
                        </div>

                        {/* Card Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className={`text-sm font-extrabold leading-snug group-hover:text-[#ff3b70] transition-colors truncate ${
                              theme === "dark" ? "text-white" : "text-[#18181f]"
                            }`}>{item.title}</h3>
                            
                            <div className="space-y-0.5 text-[10px] text-[#8b8b9a] font-semibold font-mono">
                              <p className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-[#ff3b70]/70" />
                                {item.date}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#ff3b70]/70" />
                                {item.venue}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#26262f]/10 pt-3">
                            <div className="flex flex-col">
                              <span className="text-[8px] uppercase text-[#8b8b9a] font-extrabold tracking-wider leading-none">Starting from</span>
                              <span className={`text-xs font-mono font-extrabold leading-none mt-1 ${theme === "dark" ? "text-white" : "text-[#ff3b70]"}`}>
                                {item.price.replace("Starting from ", "")}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedTicketTier(item.title.includes("Nights") ? "VIP Access" : "Festival Ground");
                                // Open detailed view / select tickets state
                                setActiveTab("checkout_details_view");
                              }}
                              className="py-2 px-3 rounded-lg bg-[#ff3b70] hover:bg-[#ff5c8a] text-white text-[10px] font-extrabold transition-all cursor-pointer shadow-md"
                            >
                              Get Tickets
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== EVENT DETAILED VIEW (FROM TAB SWITCH) ==================== */}
          {activeTab === "checkout_details_view" && (
            <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8 animate-fade-in">
              <div className="relative overflow-hidden rounded-3xl border border-[#26262f] bg-[#0c0c12]/90 shadow-2xl h-80 flex flex-col justify-end p-6 md:p-8">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(9,9,11,0.95) 15%, rgba(9,9,11,0.6) 50%, rgba(9,9,11,0.3) 100%), url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80')`
                  }}
                />
                <div className="relative z-10 space-y-3.5 max-w-2xl text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider border bg-white/5 border-cyan-400/40 text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>SOLD OUT SOON</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold font-mono leading-none">light Tour 2024</h1>
                  <p className="text-xs md:text-sm text-[#c7c7d4] font-medium leading-relaxed">
                    Ultimate sensory overload with synthwave and electro-house gig for one unforgettable night.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 border-t border-[#26262f]/40">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8b8b9a] font-mono">
                      <Clock className="w-4 h-4 text-[#ff3b70]" />
                      <span>20:00 - 04:00 GMT</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8b8b9a] font-mono">
                      <MapPin className="w-4 h-4 text-[#ff3b70]" />
                      <span>The Zenith Arena, London</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className={`lg:col-span-7 border rounded-2xl p-6 space-y-4 ${
                  theme === "dark" ? "bg-[#141419] border-[#26262f] text-[#8b8b9a]" : "bg-white border-[#e5e7eb] text-[#50505f]"
                }`}>
                  <h3 className={`text-base font-bold tracking-wide ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Event Detail</h3>
                  <p className="text-xs leading-relaxed">
                    Get ready to be transported into a sonic dimension where light and sound collide. The Neon Night Tour is not just a concert; it&apos;s an immersive audio-visual ecosystem designed to push the boundaries of live entertainment.
                  </p>
                  <p className="text-xs leading-relaxed">
                    Featuring state-of-the-art holographic projections, a massive 360-degree LED canvas, and a custom spatial sound system, the Zenith Arena will be transformed into a pulsating cyber-punk environment.
                  </p>
                </div>

                <div className={`lg:col-span-5 border rounded-2xl p-6 space-y-6 ${
                  theme === "dark" ? "bg-[#141419] border-[#26262f]" : "bg-white border-[#e5e7eb]"
                }`}>
                  <div>
                    <h3 className={`text-base font-bold tracking-wide ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Select Tickets</h3>
                    <p className="text-[11px] text-[#8b8b9a] mt-1 font-semibold leading-none">Choose your tier and experience level.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { name: "VIP Access", price: 1500000, info: "Fast track access, exclusive lounge, free merch." },
                      { name: "Festival Ground", price: 850000, info: "General admission standing area." },
                      { name: "Tribune Seating", price: 650000, info: "Reserved seat in the grandstand." }
                    ].map((tier) => (
                      <button
                        key={tier.name}
                        onClick={() => setSelectedTicketTier(tier.name)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedTicketTier === tier.name
                            ? "bg-[#ff3b70]/5 border-[#ff3b70] shadow-sm"
                            : "bg-[#18181f]/5 border-[#26262f]/15 hover:border-[#ff3b70]/40"
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{tier.name}</span>
                          <span className="text-xs font-mono font-extrabold text-[#ff3b70]">{formatIDR(tier.price)}</span>
                        </div>
                        <p className="text-[10px] text-[#8b8b9a] font-medium leading-tight mt-0.5">{tier.info}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-b border-[#26262f]/10 py-4">
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Quantity</span>
                    <div className={`flex items-center gap-4 border rounded-xl px-3 py-1.5 ${
                      theme === "dark" ? "bg-[#18181f] border-[#26262f]" : "bg-[#f9fafb] border-[#e5e7eb]"
                    }`}>
                      <button disabled={ticketQuantity <= 1} onClick={() => setTicketQuantity(ticketQuantity - 1)} className="text-[#8b8b9a] hover:text-white cursor-pointer disabled:opacity-30">
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <span className={`text-xs font-mono font-extrabold w-6 text-center ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{ticketQuantity}</span>
                      <button onClick={() => setTicketQuantity(ticketQuantity + 1)} className="text-[#8b8b9a] hover:text-white cursor-pointer">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-[#8b8b9a] font-bold">Total price</span>
                      <span className={`text-lg font-mono font-extrabold leading-none ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{formatIDR(subtotal)}</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setTimeLeft(284);
                        setActiveTab("checkout");
                      }}
                      className="py-3 px-6 text-xs font-extrabold text-white gradient-btn rounded-xl shadow-md cursor-pointer"
                    >
                      Proceed to Pay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== C. CHECKOUT VIEW ==================== */}
          {activeTab === "checkout" && (
            <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-7 animate-fade-in text-[#18181f]">
              <div className="flex items-center justify-between border-b border-[#26262f]/10 pb-4.5">
                <div>
                  <h1 className={`text-xl font-extrabold font-mono tracking-tight ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Electric Pulse</h1>
                  <p className="text-[10px] uppercase tracking-widest text-[#8b8b9a] font-bold mt-0.5">Payment Gateway</p>
                </div>
                
                <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-[#ff3b70]/10 border border-[#ff3b70]/20 text-[#ff3b70] text-xs font-mono font-bold shadow-sm">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Complete payment within {formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Billing details & payment selection */}
                <div className="lg:col-span-7 space-y-6">
                  <div className={`border rounded-2xl p-6 space-y-5 ${
                    theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                  }`}>
                    <div className="flex items-center gap-2.5 border-b border-[#26262f]/10 pb-3">
                      <Shield className="w-4.5 h-4.5 text-[#ff3b70]" />
                      <h3 className="text-sm font-bold tracking-wide">Billing Information</h3>
                    </div>

                    <form className="grid gap-4.5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#8b8b9a] uppercase tracking-wide">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className={`w-full border rounded-xl px-4 py-3 text-xs placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                            theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#8b8b9a] uppercase tracking-wide">Email Address</label>
                          <input
                            type="email"
                            required
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            placeholder="Enter your email"
                            className={`w-full border rounded-xl px-4 py-3 text-xs placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                              theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-[#8b8b9a] uppercase tracking-wide">Phone Number</label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter phone number"
                            className={`w-full border rounded-xl px-4 py-3 text-xs placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                              theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                            }`}
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Payment Method */}
                  <div className={`border rounded-2xl p-6 space-y-5 ${
                    theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                  }`}>
                    <div className="flex items-center gap-2.5 border-b border-[#26262f]/10 pb-3">
                      <CreditCard className="w-4.5 h-4.5 text-[#ff3b70]" />
                      <h3 className="text-sm font-bold tracking-wide">Payment Method</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                      {[
                        { id: "ewallet", name: "E-Wallet", info: "Gopay, OVO, Dana", icon: Wallet },
                        { id: "va", name: "Virtual Account", info: "BCA, Mandiri, BNI", icon: Building },
                        { id: "card", name: "Credit Card", info: "Visa, Mastercard", icon: CreditCard }
                      ].map((item) => {
                        const PaymentIcon = item.icon;
                        const isSelected = paymentMethod === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPaymentMethod(item.id)}
                            className={`w-full flex items-center justify-between p-4.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#ff3b70]/5 border-[#ff3b70]"
                                : theme === "dark" ? "bg-[#18181f] border-[#26262f] hover:border-[#ff3b70]/30" : "bg-[#f9fafb] border-[#e5e7eb] hover:border-[#ff3b70]/30"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                                isSelected ? "bg-[#ff3b70]/10 border-[#ff3b70]/25 text-[#ff3b70]" : "bg-[#141419]/5 border-[#26262f]/15 text-[#8b8b9a]"
                              }`}>
                                <PaymentIcon className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <span className={`text-xs font-bold leading-none ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{item.name}</span>
                                <p className="text-[10px] text-[#8b8b9a] font-semibold mt-0.5 leading-none">{item.info}</p>
                              </div>
                            </div>
                            
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-[#ff3b70] bg-[#ff3b70]" : "border-[#3e3e4f]"
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Summary Panel */}
                <div className={`border rounded-2xl p-6 h-fit space-y-6 ${
                  theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                }`}>
                  <h3 className="text-sm font-bold tracking-wide border-b border-[#26262f]/10 pb-3">Order Summary</h3>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`font-sans font-bold block ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{selectedTicketTier} - Day 1</span>
                        <span className="text-[10px] text-[#8b8b9a] font-semibold">{ticketQuantity}x {formatIDR(ticketPrice)}</span>
                      </div>
                      <span className={`font-bold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{formatIDR(ticketPrice * ticketQuantity)}</span>
                    </div>

                    {meetGreetAddon && (
                      <div className="flex justify-between items-start gap-4 border-t border-[#26262f]/10 pt-4">
                        <div>
                          <span className={`font-sans font-bold block ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Meet & Greet Add-on</span>
                          <span className="text-[10px] text-[#8b8b9a] font-semibold">1x {formatIDR(500000)}</span>
                        </div>
                        <span className={`font-bold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{formatIDR(500000)}</span>
                      </div>
                    )}

                    <div className="h-px bg-[#26262f]/10 my-4" />

                    <div className="space-y-2 text-[#8b8b9a] text-[11px] font-semibold">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatIDR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes & Fees (10%)</span>
                        <span>{formatIDR(taxes)}</span>
                      </div>
                    </div>

                    <div className="h-px bg-[#26262f]/10 my-4" />

                    <div className="flex justify-between items-end">
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#8b8b9a]">Total</span>
                      <span className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{formatIDR(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handlePayment}
                      disabled={isPaying}
                      className="w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-btn shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{isPaying ? "Memproses..." : `Pay Now - ${formatIDR(total)}`}</span>
                    </button>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#8b8b9a] font-semibold uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Secure encrypted payment</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== D. TICKETS VIEW (SCREENSHOT 4 LIGHT/DARK COMPATIBLE) ==================== */}
          {activeTab === "tickets" && (
            <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#26262f]/10 pb-3">
                <div>
                  <h1 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>My Tickets</h1>
                  <p className="text-[10px] text-[#8b8b9a] font-semibold mt-0.5">Manage your upcoming events and view past experiences.</p>
                </div>

                <div className="flex items-center bg-[#e5e7eb]/60 rounded-xl p-1 border border-[#26262f]/5">
                  <button
                    onClick={() => setTicketFilter("upcoming")}
                    className={`px-4 py-2 rounded-lg text-[10px] font-extrabold tracking-wide transition-all ${
                      ticketFilter === "upcoming"
                        ? "bg-[#18181f] text-white shadow-sm"
                        : "text-[#8b8b9a] hover:text-[#18181f]"
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setTicketFilter("past")}
                    className={`px-4 py-2 rounded-lg text-[10px] font-extrabold tracking-wide transition-all ${
                      ticketFilter === "past"
                        ? "bg-[#18181f] text-white shadow-sm"
                        : "text-[#8b8b9a] hover:text-[#18181f]"
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>

              {/* Grid of Tickets cards (Screenshot 4) */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userTickets
                  .filter((t) => (ticketFilter === "upcoming" ? t.status === "Active" : t.status !== "Active"))
                  .map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`border rounded-3xl overflow-hidden flex flex-col justify-between hover:border-[#ff3b70]/40 transition-all duration-300 group shadow-sm ${
                        theme === "dark" ? "bg-[#141419] border-[#26262f]" : "bg-white border-[#e5e7eb]"
                      }`}
                    >
                      {/* Image background block */}
                      <div
                        className="h-36 bg-cover bg-center shrink-0 relative"
                        style={{ backgroundImage: `url('${ticket.image}')` }}
                      >
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                          <span>Active</span>
                        </span>
                        
                        <div className="absolute bottom-3 left-3 bg-[#18181f]/85 border border-white/10 rounded-xl p-2 text-center text-white min-w-[50px] font-mono leading-none">
                          <span className="text-[9px] uppercase tracking-wider block text-[#8b8b9a] font-bold">Month</span>
                          <span className="text-sm font-extrabold mt-1 block">{ticket.date.split(" ")[0]}</span>
                          <span className="text-xl font-extrabold mt-0.5 block">{ticket.date.split(" ")[1] || "24"}</span>
                        </div>
                      </div>

                      {/* Details block */}
                      <div className="p-5 space-y-4">
                        <div className="space-y-1">
                          <h3 className={`text-sm font-extrabold leading-snug group-hover:text-[#ff3b70] transition-colors truncate ${
                            theme === "dark" ? "text-white" : "text-[#18181f]"
                          }`}>{ticket.event}</h3>
                          
                          <p className="text-[10px] text-[#8b8b9a] font-semibold leading-relaxed flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#ff3b70]/70" />
                            <span>{ticket.venue}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#26262f]/10 pt-3 text-[11px] font-mono text-[#8b8b9a]">
                          <div>
                            <span className="text-[8px] uppercase text-[#50505f] font-extrabold tracking-wider leading-none">Ticket Type</span>
                            <span className={`block font-bold mt-1 text-xs ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>{ticket.tier}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] uppercase text-[#50505f] font-extrabold tracking-wider leading-none">Order ID</span>
                            <span className="block font-bold mt-1 text-xs text-[#ff3b70]">{ticket.code}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveAccessTicket(ticket)}
                          className="w-full py-2.5 rounded-xl bg-[#1c1c24] text-white hover:bg-[#ff3b70]/10 border border-[#26262f]/20 hover:border-[#ff3b70]/30 text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4 text-[#ff3b70]" />
                          <span>View QR Code</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ==================== E. PROFILE VIEW (PROFIL PENGGUNA) ==================== */}
          {activeTab === "profile" && (
            <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-[#26262f]/10 pb-3">
                <h1 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Profil Saya</h1>
                <p className="text-[10px] text-[#8b8b9a] font-semibold mt-0.5">Kelola identitas akun dan keamanan akun Anda.</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Forms column */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Account Info card */}
                  <div className={`border rounded-2xl p-6 space-y-5 ${
                    theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                  }`}>
                    <div className="flex items-center gap-2 text-[#ff3b70] border-b border-[#26262f]/10 pb-3">
                      <Users className="w-4.5 h-4.5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Informasi Akun</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      {/* Avatar Edit */}
                      <div className="relative group shrink-0">
                        <div className="w-20 h-20 rounded-full border-2 border-[#ff3b70]/30 overflow-hidden shadow-lg bg-gray-900 flex items-center justify-center text-white">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => triggerNotification("Profile picture upload coming soon.")}
                          className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#18181f] border border-[#26262f] text-[#8b8b9a] hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>

                      {/* Inputs Grid */}
                      <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Data profil berhasil diperbarui!"); }} className="flex-1 w-full grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wide">Full Name</label>
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                                theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                              }`}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wide">Username</label>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                                theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wide">Email Address</label>
                          <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                              theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                            }`}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wide">Phone Number</label>
                          <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                              theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                            }`}
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="py-2.5 px-6 rounded-xl bg-[#1c1c24] text-white border border-[#26262f] hover:border-[#ff3b70]/30 hover:text-[#ff3b70] text-xs font-bold cursor-pointer"
                          >
                            Simpan Perubahan
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Security Card */}
                  <div className={`border rounded-2xl p-6 space-y-5 ${
                    theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                  }`}>
                    <div className="flex items-center gap-2 text-[#ff3b70] border-b border-[#26262f]/10 pb-3">
                      <Shield className="w-4.5 h-4.5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Keamanan</h3>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Password berhasil diperbarui!"); }} className="grid gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wide">Current Password</label>
                        <input
                          type="password"
                          defaultValue="********"
                          className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                            theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wide">New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                              theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-[#8b8b9a] uppercase tracking-wide">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff3b70]/40 transition-all font-mono ${
                              theme === "dark" ? "bg-[#18181f] border-[#26262f] text-white" : "bg-[#f9fafb] border-[#e5e7eb]"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="py-2.5 px-6 rounded-xl bg-[#1c1c24] text-white border border-[#26262f] hover:border-[#ff3b70]/30 hover:text-[#ff3b70] text-xs font-bold cursor-pointer"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right widgets column */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Account summary */}
                  <div className={`border rounded-2xl p-6 space-y-4 ${
                    theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                  }`}>
                    <div className="flex items-center gap-2 text-[#ff3b70] border-b border-[#26262f]/10 pb-3">
                      <UserCircle className="w-4.5 h-4.5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Ringkasan Akun</h3>
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-1">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff3b70]/20 to-[#8b5cf6]/20 border border-[#ff3b70]/30 flex items-center justify-center text-lg font-bold text-white">
                        {(fullName || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-extrabold">{fullName}</p>
                        <p className="text-[10px] text-[#8b8b9a] font-mono mt-0.5">{emailAddress}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border border-[#ff3b70]/30 bg-[#ff3b70]/10 text-[#ff3b70]">
                        Pengguna
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== F. SETTINGS VIEW (PENGATURAN) ==================== */}
          {activeTab === "settings" && (
            <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-[#26262f]/10 pb-3">
                <h1 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Pengaturan</h1>
                <p className="text-[10px] text-[#8b8b9a] font-semibold mt-0.5">Kelola preferensi aplikasi dan notifikasi Anda.</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left column - Genres */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Genres selection */}
                  <div className={`border rounded-2xl p-6 space-y-4 ${
                    theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                  }`}>
                    <div className="flex items-center gap-2 text-[#ff3b70] border-b border-[#26262f]/10 pb-3">
                      <Heart className="w-4.5 h-4.5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Genre Musik Favorit</h3>
                    </div>

                    <p className="text-[11px] text-[#8b8b9a] font-semibold leading-relaxed">
                      Pilih genre favorit Anda untuk personalisasi rekomendasi event.
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {["Techno", "Synthwave", "House", "Rock", "Trance", "Ambient"].map((genre) => {
                        const isSelected = selectedGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => toggleGenre(genre)}
                            className={`px-4.5 py-2 rounded-full text-[10px] font-extrabold tracking-wide border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#ff3b70]/10 border-[#ff3b70] text-[#ff3b70] shadow-sm"
                                : theme === "dark" ? "bg-[#18181f] border-[#26262f] text-[#8b8b9a] hover:text-white" : "bg-[#f9fafb] border-[#e5e7eb] text-[#8b8b9a] hover:text-[#18181f]"
                            }`}
                          >
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notifications settings */}
                  <div className={`border rounded-2xl p-6 space-y-4 ${
                    theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                  }`}>
                    <div className="flex items-center gap-2 text-[#ff3b70] border-b border-[#26262f]/10 pb-3">
                      <Bell className="w-4.5 h-4.5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Notifikasi</h3>
                    </div>

                    <p className="text-[11px] text-[#8b8b9a] font-semibold leading-relaxed">
                      Atur cara Anda menerima pemberitahuan.
                    </p>

                    <div className="space-y-4.5 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold block">Email Alerts</span>
                          <span className="text-[9px] text-[#8b8b9a] leading-none">Dapatkan info event yang akan datang.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEmailAlerts(!emailAlerts)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                            emailAlerts ? "bg-[#ff3b70]" : "bg-[#e5e7eb]"
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            emailAlerts ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold block">Push Notifications</span>
                          <span className="text-[9px] text-[#8b8b9a] leading-none">Update langsung di perangkat Anda.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPushNotifications(!pushNotifications)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                            pushNotifications ? "bg-[#ff3b70]" : "bg-[#e5e7eb]"
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            pushNotifications ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Appearance */}
                <div className="lg:col-span-5 space-y-6">
                  <div className={`border rounded-2xl p-6 space-y-4 ${
                    theme === "dark" ? "bg-[#141419] border-[#26262f] text-white" : "bg-white border-[#e5e7eb] text-[#18181f]"
                  }`}>
                    <div className="flex items-center gap-2 text-[#ff3b70] border-b border-[#26262f]/10 pb-3">
                      <Sun className="w-4.5 h-4.5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Tampilan</h3>
                    </div>

                    <p className="text-[11px] text-[#8b8b9a] font-semibold leading-relaxed">
                      Pilih tema untuk antarmuka aplikasi.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`py-3 rounded-xl text-[10px] font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          theme === "light"
                            ? "border-[#ff3b70] bg-[#ff3b70]/10 text-[#ff3b70]"
                            : theme === "dark" ? "bg-[#18181f] border-[#26262f] text-[#8b8b9a] hover:text-white" : "bg-[#f9fafb] border-[#e5e7eb] text-[#8b8b9a] hover:text-[#18181f]"
                        }`}
                      >
                        <Sun className="w-4 h-4 text-amber-400" />
                        Terang
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`py-3 rounded-xl text-[10px] font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          theme === "dark"
                            ? "border-[#ff3b70] bg-[#ff3b70]/10 text-[#ff3b70]"
                            : theme === "dark" ? "bg-[#18181f] border-[#26262f] text-[#8b8b9a] hover:text-white" : "bg-[#f9fafb] border-[#e5e7eb] text-[#8b8b9a] hover:text-[#18181f]"
                        }`}
                      >
                        <Moon className="w-4 h-4 text-cyan-400" />
                        Gelap
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== G. LIVE TAB ==================== */}
          {activeTab === "live" && (
            <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 items-center justify-center py-20 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#ff3b70]/10 border border-[#ff3b70]/30 flex items-center justify-center shadow-lg shadow-[#ff3b70]/10 mb-4 animate-ping">
                <Radio className="w-7 h-7 text-[#ff3b70]" />
              </div>
              <h2 className={`text-2xl font-extrabold tracking-wide ${theme === "dark" ? "text-white" : "text-[#18181f]"}`}>Live Stream Broadcast</h2>
              <p className="text-xs text-[#8b8b9a] max-w-md leading-relaxed">
                The high-fidelity stream for Neon Nights will start broadcasting live when the gates open on December 15 at 20:00 GMT. Set your reminders now.
              </p>
              <button
                onClick={() => triggerNotification("Reminders set! We will notify you when we go live.")}
                className="mt-4 px-5 py-2.5 bg-[#141419] border border-[#26262f] rounded-xl text-xs font-bold hover:border-[#ff3b70]/40 transition-colors text-white"
              >
                Set Live Reminder
              </button>
            </div>
          )}

        </main>

        {/* Footer info (Screenshot 2 and 3) */}
        <footer className="h-10 bg-[#0d0d10] border-t border-[#26262f]/45 flex items-center justify-between px-6 text-[9px] text-[#8b8b9a] shrink-0 font-semibold uppercase tracking-wider">
          <span>Electric Pulse · © 2026 Future Sound Systems.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </div>
        </footer>
      </div>

      {/* ==================== ACCESS CODE MODAL ==================== */}
      {activeAccessTicket && (
        <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141419] border border-[#26262f] rounded-3xl p-6 max-w-sm w-full glow-card text-center space-y-6 relative overflow-hidden animate-fade-in text-white">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ff3b70] to-[#8b5cf6]" />
            
            <button
              onClick={() => setActiveAccessTicket(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-[#26262f] bg-[#141419] flex items-center justify-center text-[#8b8b9a] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pt-2">
              <span className="text-[9px] uppercase tracking-wider text-[#ff3b70] font-bold">Access Token</span>
              <h3 className="text-base font-extrabold text-white mt-1 leading-snug">{activeAccessTicket.event}</h3>
              <p className="text-[10px] text-[#8b8b9a] font-semibold mt-0.5">{activeAccessTicket.tier}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl flex flex-col items-center gap-4 shadow-xl">
              <div className="flex gap-0.5 h-24 w-full items-stretch justify-center bg-white px-2">
                {[
                  3,1,2,4,1,3,2,1,4,2,1,3,1,2,1,4,1,2,3,1,2,1,4,2,1,3,2,1,4,1,2,3,1,1,3,2
                ].map((width, idx) => (
                  <div key={idx} className="bg-[#09090b] rounded-full" style={{ width: `${width * 2}px` }} />
                ))}
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#09090b]">
                {activeAccessTicket.code}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-white font-bold leading-relaxed">{activeAccessTicket.venue}</p>
              <p className="text-[10px] text-[#8b8b9a] leading-none">{activeAccessTicket.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAYMENT SUCCESSFUL MODAL (SCREENSHOT 1) ==================== */}
      {showSuccessModal && latestOrderInfo && (
        <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141419]/90 border border-[#26262f] rounded-3xl p-8 max-w-[400px] w-full glow-card text-center space-y-6 relative overflow-hidden animate-fade-in text-white backdrop-blur-md">
            
            {/* Checked pink circle */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff3b70] to-[#8b5cf6]/80 flex items-center justify-center mx-auto shadow-lg shadow-[#ff3b70]/20 text-white">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white tracking-wide font-mono">Payment Successful!</h2>
              <p className="text-[10px] text-[#8b8b9a] font-semibold leading-relaxed">
                Your transaction has been securely processed.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#18181f] border border-[#26262f] p-5 rounded-2xl text-left space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#50505f] uppercase tracking-wider font-bold">Order ID</span>
                <span className="text-[#ff3b70] font-bold">{latestOrderInfo.orderId}-TX</span>
              </div>
              
              <div className="flex justify-between items-start gap-4 border-t border-[#26262f]/45 pt-3">
                <div>
                  <span className="font-sans font-bold text-white block">Neon Night Tour 2024</span>
                  <span className="text-[10px] text-[#8b8b9a] font-semibold">{latestOrderInfo.items}</span>
                </div>
                <span className="text-white font-bold">{latestOrderInfo.total}</span>
              </div>
              
              <div className="flex justify-between items-end border-t border-[#26262f]/45 pt-3 font-semibold">
                <span className="text-[10px] text-[#50505f] uppercase tracking-wider font-bold">Total Paid</span>
                <span className="text-sm font-bold text-cyan-400">{latestOrderInfo.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3.5 pt-2">
              <button
                type="button"
                onClick={() => triggerNotification("Downloading ticket PDF...")}
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs gradient-btn shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Download Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setLatestOrderInfo(null);
                  setActiveTab("tickets");
                }}
                className="w-full py-3.5 rounded-xl bg-[#1c1c24] border border-[#26262f] hover:border-[#ff3b70]/40 text-[#8b8b9a] hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

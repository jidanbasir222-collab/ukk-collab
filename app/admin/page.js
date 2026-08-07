"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderKanban,
  CreditCard,
  BarChart3,
  Search,
  Bell,
  Settings,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  MapPin,
  Check,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Wallet,
  CalendarDays,
  Music,
  Radio,
  Headphones,
  Zap,
  Ticket,
  Clock,
  UserCheck,
  Download,
  Sparkles,
  Info,
  User,
  UserCircle,
  Shield
} from "lucide-react";
import Chart from "../../components/Chart";
import Instagram from "../../components/Instagram";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_PAYMENTS = [
  {
    orderId: "#VB-882810",
    user: "Budi Santoso",
    avatar: "BS",
    event: "Born Pink World Tour",
    totalBayar: 1560000,
    status: "PENDING",
    transferSlip: true
  },
  {
    orderId: "#VB-882895",
    user: "Sarah Wijaya",
    avatar: "SW",
    event: "Dua Lipa: Radical Optimism",
    totalBayar: 2100000,
    status: "PAID",
    transferSlip: true
  },
  {
    orderId: "#VB-882852",
    user: "Michael Chen",
    avatar: "MC",
    event: "Java Jazz Festival 2024",
    totalBayar: 850000,
    status: "REJECTED",
    transferSlip: true
  },
  {
    orderId: "#VB-882744",
    user: "Anisa Rahma",
    avatar: "AR",
    event: "LANY Jakarta Tour",
    totalBayar: 1250000,
    status: "PAID",
    transferSlip: false
  }
];

export default function Home() {
  const router = useRouter();

  // Authentication State
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [payments, setPayments] = useState(DEFAULT_PAYMENTS);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const token = localStorage.getItem("token");
      const currentUser = localStorage.getItem("user");

      if (!token || !currentUser) {
        router.replace("/");
        return;
      }

      try {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser.role && String(parsedUser.role).toLowerCase().includes("admin")) {
          setAdminUser(parsedUser);
          setIsLoggedIn(true);
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error(err);
        router.replace("/");
      } finally {
        setIsAuthChecked(true);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [router]);

  // Fetch real payment history from API when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p, idx) => ({
            orderId: p.orderId || `#VB-${100000 + idx}`,
            user: p.user_name || "Unknown",
            avatar: (p.user_name || "U").substring(0, 2).toUpperCase(),
            event: p.event_name || `Event #${p.event_id || "?"}`,
            totalBayar: Number(p.totalBayar) || 0,
            status: p.status || "PENDING"
          }));
          setPayments(mapped);
        }
      })
      .catch((err) => console.error("Gagal mengambil riwayat pembayaran:", err));
  }, [isLoggedIn]);

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, event, artis, kategori, pembayaran, laporan  const [eventSubView, setEventSubView] = useState("list"); // list, add
  const [artistSubView, setArtistSubView] = useState("grid"); // grid, add

  // Notification State
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Mock Categories State
  const [categories, setCategories] = useState([
    { id: "1", name: "Pop", description: "Mainstream melodies, catchy hooks, and clean production.", count: 24, icon: "music", color: "pink" },
    { id: "2", name: "Rock", description: "Powerful guitars, driving drums, and energetic vocals.", count: 15, icon: "zap", color: "teal" },
    { id: "3", name: "Jazz", description: "Improvisational rhythms, brass solos, and smooth club vibes.", count: 8, icon: "radio", color: "purple" },
    { id: "4", name: "Indie", description: "Independent production, unique lyricism, and alternative tunes.", count: 12, icon: "headphones", color: "peach" },
    { id: "5", name: "Festival", description: "Multi-artist outdoor concerts and massive experiences.", count: 5, icon: "music", color: "green" }
  ]);

  // Mock Events State
  const [events, setEvents] = useState([
    {
      id: "1",
      name: "Neon Night Tour 2024",
      artist: "LUNA & The Stars",
      category: "Pop",
      date: "2024-11-15",
      time: "19:00",
      location: "Stadion Utama GBK, Jakarta",
      ticketPrice: 250000,
      quota: 1000,
      sold: 850,
      status: "ACTIVE",
      poster: null,
      banner: null
    },
    {
      id: "2",
      name: "Thunderous Echoes",
      artist: "The Iron Strings",
      category: "Rock",
      date: "2024-11-22",
      time: "20:00",
      location: "The Warehouse Arena, Tangerang",
      ticketPrice: 150000,
      quota: 500,
      sold: 500,
      status: "SOLD OUT",
      poster: null,
      banner: null
    },
    {
      id: "3",
      name: "Midnight Jazz Collective",
      artist: "Smooth Quartette",
      category: "Jazz",
      date: "2024-10-30",
      time: "21:30",
      location: "Sky Lounge Plaza, Jakarta",
      ticketPrice: 350000,
      quota: 300,
      sold: 120,
      status: "CLOSED",
      dateObject: new Date("2024-10-30"),
      poster: null,
      banner: null
    },
    {
      id: "4",
      name: "Electric Pulse Fest",
      artist: "DJ Static & Friends",
      category: "Festival",
      date: "2024-12-05",
      time: "16:00",
      location: "Beach Club Bali, Seminyak",
      ticketPrice: 500000,
      quota: 3000,
      sold: 2500,
      status: "ACTIVE",
      poster: null,
      banner: null
    }
  ]);

  // Mock Artists State (Kelola Artis view)
  const [artists, setArtists] = useState([
    {
      id: "1",
      name: "The Midnight Sun",
      genre: "SYNTHWAVE",
      instagram: "@themidnightsun_live",
      activeEvents: 3,
      avatarIndex: 0
    },
    {
      id: "2",
      name: "Neon Nights",
      genre: "INDIE ROCK",
      instagram: "@neonnights_official",
      activeEvents: 1,
      avatarIndex: 1
    },
    {
      id: "3",
      name: "Velvet Echo",
      genre: "JAZZ FUSION",
      instagram: "@velvet.echo",
      activeEvents: 2,
      avatarIndex: 2
    }
  ]);

  // Selected Artist for Detail Modal
  const [selectedArtist, setSelectedArtist] = useState(null);

  // New Artist Form State
  const [artistForm, setArtistForm] = useState({
    name: "",
    genre: "SYNTHWAVE",
    instagram: "",
    activeEvents: 1
  });

  // Payments history metrics
  const verifiedRevenueToday = 45200000; // Rp 45.2M starting value

  // SVG Donut Chart Hover segment state (Reports view)
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);

  // Add Event Form State
  const [eventForm, setEventForm] = useState({
    name: "",
    artist: "",
    category: "",
    date: "",
    time: "",
    ticketPrice: 0,
    quota: 5000,
    location: "",
    description: "",
    poster: null,
    banner: null
  });

  // Add Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "music",
    color: "pink",
    description: ""
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  // Artist Filter state
  const [artistGenreFilter, setArtistGenreFilter] = useState("Semua Genre");

  // Helper trigger notification
  const triggerNotification = (msg) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  // Logout handler (clears session and redirects to login)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    triggerNotification("Log out berhasil.");
    setTimeout(() => router.replace("/"), 400);
  };

  // Save Event Handler
  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.artist || !eventForm.category || !eventForm.date || !eventForm.location) {
      triggerNotification("Lengkapi semua field utama event!");
      return;
    }

    const newEvent = {
      id: (events.length + 1).toString(),
      name: eventForm.name,
      artist: eventForm.artist,
      category: eventForm.category,
      date: eventForm.date,
      time: eventForm.time || "19:00",
      location: eventForm.location,
      ticketPrice: Number(eventForm.ticketPrice) || 0,
      quota: Number(eventForm.quota) || 5000,
      sold: 0,
      status: "ACTIVE",
      poster: eventForm.poster,
      banner: eventForm.banner
    };

    setEvents([newEvent, ...events]);
    setEventForm({
      name: "",
      artist: "",
      category: "",
      date: "",
      time: "",
      ticketPrice: 0,
      quota: 5000,
      location: "",
      description: "",
      poster: null,
      banner: null
    });
    setEventSubView("list");
    triggerNotification("Event baru berhasil ditambahkan!");
  };

  // Delete Event Handler
  const handleDeleteEvent = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      setEvents(events.filter(ev => ev.id !== id));
      triggerNotification("Event berhasil dihapus.");
    }
  };

  // Save Category Handler
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      triggerNotification("Nama kategori tidak boleh kosong!");
      return;
    }

    const newCategory = {
      id: (categories.length + 1).toString(),
      name: categoryForm.name,
      description: categoryForm.description || "No description provided.",
      count: 0,
      icon: categoryForm.icon,
      color: categoryForm.color
    };

    setCategories([...categories, newCategory]);
    setCategoryForm({
      name: "",
      icon: "music",
      color: "pink",
      description: ""
    });
    triggerNotification("Kategori baru berhasil ditambahkan!");
  };

  // Delete Category Handler
  const handleDeleteCategory = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      setCategories(categories.filter(cat => cat.id !== id));
      triggerNotification("Kategori berhasil dihapus.");
    }
  };

  // Save Artist Handler
  const handleSaveArtist = (e) => {
    e.preventDefault();
    if (!artistForm.name || !artistForm.instagram) {
      triggerNotification("Lengkapi nama artis dan instagram handle!");
      return;
    }

    const newArtist = {
      id: (artists.length + 1).toString(),
      name: artistForm.name,
      genre: artistForm.genre.toUpperCase(),
      instagram: artistForm.instagram.startsWith("@") ? artistForm.instagram : `@${artistForm.instagram}`,
      activeEvents: Number(artistForm.activeEvents) || 0,
      avatarIndex: Math.floor(Math.random() * 3) // random default avatar design
    };

    setArtists([...artists, newArtist]);
    setArtistForm({
      name: "",
      genre: "SYNTHWAVE",
      instagram: "",
      activeEvents: 1
    });
    setArtistSubView("grid");
    triggerNotification(`Artis "${newArtist.name}" berhasil didaftarkan!`);
  };

  // Delete Artist Handler
  const handleDeleteArtist = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus artis ini dari management?")) {
      setArtists(artists.filter(art => art.id !== id));
      triggerNotification("Artis berhasil dihapus.");
    }
  };

  // Dynamic Potential Revenue for Add Form
  const potentialRevenue = eventForm.ticketPrice * eventForm.quota;

  // Dynamic Dashboard Stats
  const totalEventsCount = events.length;
  const activeEventsCount = events.filter(e => e.status === "ACTIVE").length;
  const totalSoldTickets = events.reduce((sum, e) => sum + e.sold, 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.sold * e.ticketPrice), 0);

  // Helper to format currency
  const formatIDR = (num) => {
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)}M`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  // Get color styles based on category config
  const getCategoryColorClass = (color) => {
    switch (color) {
      case "pink": return "bg-[#ff3b70]/10 text-[#ff3b70] border-[#ff3b70]/20";
      case "teal": return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "purple": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "peach": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "green": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  // Render Icon dynamically based on string
  const renderCategoryIcon = (iconStr, className = "w-4 h-4") => {
    switch (iconStr) {
      case "music": return <Music className={className} />;
      case "zap": return <Zap className={className} />;
      case "radio": return <Radio className={className} />;
      case "headphones": return <Headphones className={className} />;
      default: return <Music className={className} />;
    }
  };

  // Filtered Events by Search Query
  const filteredEvents = events.filter(ev => {
    const query = searchQuery.toLowerCase();
    return (
      ev.name.toLowerCase().includes(query) ||
      ev.artist.toLowerCase().includes(query) ||
      ev.location.toLowerCase().includes(query) ||
      ev.category.toLowerCase().includes(query)
    );
  });

  // Filtered Artists by search and genre dropdown
  const filteredArtists = artists.filter(art => {
    const sQuery = searchQuery.toLowerCase();
    const matchesSearch = art.name.toLowerCase().includes(sQuery) || art.genre.toLowerCase().includes(sQuery);
    const matchesGenre = artistGenreFilter === "Semua Genre" || art.genre.toUpperCase() === artistGenreFilter.toUpperCase();
    return matchesSearch && matchesGenre;
  });

  // Filtered Payments by Search Query
  const filteredPayments = payments.filter(pay => {
    const pQuery = searchQuery.toLowerCase();
    return (
      pay.user.toLowerCase().includes(pQuery) ||
      pay.orderId.toLowerCase().includes(pQuery) ||
      pay.event.toLowerCase().includes(pQuery)
    );
  });

  // Dynamic values based on payments history states
  const pendingPaymentsCount = payments.filter(p => p.status === "PENDING").length;

  // Custom Artist Avatar Renderers matching the screenshots
  const renderArtistAvatar = (avatarIndex, nameStr) => {
    const initials = nameStr.substring(0, 2).toUpperCase();
    
    // Design variant matching mockup images (neon gradient backgrounds + patterns)
    if (avatarIndex === 0) {
      return (
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ff3b70] to-[#8b5cf6] flex items-center justify-center border-2 border-[#ff3b70]/40 shadow-[0_0_15px_rgba(255,59,112,0.3)] relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
          {/* Neon grid pattern visual */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
          <Zap className="w-10 h-10 text-white fill-white relative z-10" />
          <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-teal-400 border-2 border-[#141419] flex items-center justify-center" title="Verified Artist">
            <Check className="w-3 h-3 text-black stroke-[3]" />
          </div>
        </div>
      );
    }
    if (avatarIndex === 1) {
      return (
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#f43f5e] flex items-center justify-center border-2 border-teal-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,_var(--tw-gradient-stops)) from-[#155e75] via-[#141419] to-[#141419]" />
          <Music className="w-10 h-10 text-white relative z-10" />
        </div>
      );
    }
    return (
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center border-2 border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)] relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
        <Radio className="w-10 h-10 text-white relative z-10" />
      </div>
    );
  };

  // RENDER LOGIN PORTAL
  if (!isAuthChecked || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  // RENDER LOGGED IN ADMIN PANEL
  return (
    <div className="min-h-screen flex bg-[#09090b] text-[#f4f4f5] font-sans">
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141419] border border-[#ff3b70]/50 text-white rounded-2xl px-5 py-4 shadow-2xl shadow-[#ff3b70]/10 flex items-center gap-3.5 animate-slide-up max-w-sm">
          <div className="w-8 h-8 rounded-full bg-[#ff3b70]/10 flex items-center justify-center text-[#ff3b70] shrink-0 border border-[#ff3b70]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs text-white">System Alert</span>
            <span className="text-xs text-[#8b8b9a]">{notificationMsg}</span>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="text-[#8b8b9a] hover:text-white ml-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Artist Profile Details Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#141419] border border-[#26262f] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <button 
              onClick={() => setSelectedArtist(null)}
              className="absolute right-4 top-4 text-[#8b8b9a] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-3 mt-4">
              {renderArtistAvatar(selectedArtist.avatarIndex, selectedArtist.name)}
              <h3 className="text-xl font-bold text-white mt-2">{selectedArtist.name}</h3>
              <span className="text-[10px] font-bold tracking-wider text-[#ff3b70] border border-[#ff3b70]/20 bg-[#ff3b70]/5 px-3 py-1 rounded-full uppercase leading-none">
                {selectedArtist.genre}
              </span>
              <a href="#" className="text-xs text-[#8b8b9a] hover:text-white flex items-center gap-1 mt-1 font-mono transition-colors">
                <Instagram className="w-3.5 h-3.5 text-[#ff3b70]" />
                {selectedArtist.instagram}
              </a>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#26262f] border-t border-b border-[#26262f]/45 py-4 mt-6 mb-6">
              <div className="flex flex-col gap-1 pr-2">
                <span className="text-[10px] text-[#8b8b9a] font-bold tracking-wider uppercase">Active Events</span>
                <span className="text-2xl font-extrabold text-white font-mono">{selectedArtist.activeEvents}</span>
              </div>
              <div className="flex flex-col gap-1 pl-2">
                <span className="text-[10px] text-[#8b8b9a] font-bold tracking-wider uppercase">Status</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Book
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                handleDeleteArtist(selectedArtist.id);
                setSelectedArtist(null);
              }}
              className="w-full py-3 bg-[#ff3b70]/10 hover:bg-[#ff3b70]/20 text-[#ff3b70] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Dari Management</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. SIDEBAR CONTAINER */}
      <aside className="w-[260px] bg-[#0d0d10] border-r border-[#26262f] flex flex-col justify-between shrink-0">
        
        {/* Upper portion */}
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#26262f]/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff3b70] to-[#8b5cf6] flex items-center justify-center shadow-md shadow-[#ff3b70]/25">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-wide">Electric Pulse</h2>
              <p className="text-[9px] text-[#ff3b70] tracking-widest uppercase font-bold">Admin Console</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 flex flex-col gap-1.5 mt-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "event", label: "Event", icon: Calendar },
              { id: "artis", label: "Artis", icon: Users },
              { id: "kategori", label: "Kategori", icon: FolderKanban },
              { id: "pembayaran", label: "Riwayat Pembayaran Tiket", icon: CreditCard },
              { id: "laporan", label: "Laporan", icon: BarChart3 },
              { id: "profil", label: "Profil", icon: User },
              { id: "pengaturan", label: "Pengaturan", icon: Settings }
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // Reset subviews on tab switch
                    if (item.id === "event") setEventSubView("list");
                    if (item.id === "artis") setArtistSubView("grid");
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                    isActive
                      ? "text-white font-semibold bg-gradient-to-r from-[#ff3b70] to-[#ff3b70]/80 shadow-[0_4px_15px_rgba(255,59,112,0.25)] border border-[#ff3b70]/30"
                      : "text-[#8b8b9a] hover:text-white hover:bg-[#181822] border border-transparent"
                  }`}
                >
                  <IconComp className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-[#8b8b9a] group-hover:text-white"
                  }`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-[#26262f]/40">
          {activeTab === "laporan" && (
            <button
              onClick={() => triggerNotification("Ekspor laporan audit bulanan dikirim ke antrian email...")}
              className="w-full py-3 mb-4 rounded-xl text-white font-bold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.01]"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          )}

          <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-4 flex items-center justify-between">
            <button 
              onClick={() => setActiveTab("profil")}
              className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer group"
              title="Buka Profil"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {(adminUser?.name || "AU").substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-bold text-white leading-none truncate">{adminUser?.name || "Admin User"}</span>
                <span className="text-[9px] text-[#ff3b70] font-semibold uppercase leading-none mt-0.5">Admin</span>
              </div>
            </button>
            
            <button 
              onClick={handleLogout}
              className="text-[#8b8b9a] hover:text-white transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] relative">
        
        {/* Glowing Decorative Element */}
        <div className="absolute top-0 right-[15%] w-[400px] h-[400px] bg-[#ff3b70]/[0.02] rounded-full blur-[100px] pointer-events-none" />

        {/* TOP HEADER */}
        <header className="h-[75px] border-b border-[#26262f]/45 px-8 flex items-center justify-between shrink-0 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
          
          {/* Search bar */}
          <div className="relative w-full max-w-[400px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
            <input
              type="text"
              placeholder={
                activeTab === "pembayaran" 
                  ? "Cari ID Pesanan atau Nama User..." 
                  : activeTab === "artis" 
                    ? "Cari nama artis atau genre..."
                    : "Search data, events, or artists..."
              }
              className="w-full bg-[#141419]/90 border border-[#26262f] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4.5">
            {/* Notification button */}
            <button 
              onClick={() => triggerNotification("Tidak ada notifikasi baru.")}
              className="w-9 h-9 rounded-xl border border-[#26262f] bg-[#141419]/90 flex items-center justify-center text-[#8b8b9a] hover:text-white hover:border-[#ff3b70]/30 transition-all relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff3b70] shadow-sm shadow-[#ff3b70]" />
            </button>

            {/* Settings button */}
            <button 
              onClick={() => setActiveTab("pengaturan")}
              className="w-9 h-9 rounded-xl border border-[#26262f] bg-[#141419]/90 flex items-center justify-center text-[#8b8b9a] hover:text-white hover:border-[#ff3b70]/30 transition-all cursor-pointer"
              title="Pengaturan"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-[#26262f]" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#26262f] hover:border-[#ff3b70]/30 hover:bg-[#ff3b70]/5 text-[#f4f4f5] transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-8">

          {/* ==================== A. DASHBOARD VIEW ==================== */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Ringkasan Dashboard</h1>
                <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                  Selamat datang kembali, <span className="text-[#ff3b70] font-bold">{adminUser?.name || "Alex"}</span>. Inilah performa Electric Pulse hari ini.
                </p>
              </div>

              {/* Grid 4 Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Total Event", value: totalEventsCount, note: "+4 Bulan ini", icon: CalendarDays, color: "text-[#ff3b70] bg-[#ff3b70]/10" },
                  { label: "Tiket Terjual", value: totalSoldTickets.toLocaleString("id-ID"), note: "+12%", icon: Ticket, color: "text-purple-400 bg-purple-500/10" },
                  { label: "Pendapatan", value: formatIDR(totalRevenue), note: "Gross Volume (YTD)", icon: Wallet, color: "text-teal-400 bg-teal-500/10" },
                  { label: "Pending Approval", value: "12", note: "Butuh Review", icon: Info, color: "text-amber-400 bg-amber-500/10" }
                ].map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card transition-all duration-300 hover:border-[#26262f]/80 relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-[#8b8b9a] font-semibold tracking-wider uppercase">{stat.label}</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color} border border-current/10 transition-transform duration-300 group-hover:scale-110`}>
                          <StatIcon className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-extrabold text-white leading-tight font-mono">{stat.value}</span>
                        <span className="text-[10px] text-[#8b8b9a] mt-1.5 font-semibold flex items-center gap-1 font-mono">
                          {stat.note.startsWith("+") ? <span className="text-emerald-400 font-bold">{stat.note}</span> : stat.note}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Monthly Sales Line Chart */}
              <div>
                <Chart />
              </div>

              {/* Bottom Row - Popular Events & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Popular Events */}
                <div className="lg:col-span-7 bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-white tracking-wide">Event Terpopuler</h3>
                      <button onClick={() => setActiveTab("event")} className="text-xs text-[#ff3b70] hover:text-[#ff5c8a] hover:underline font-bold transition-all">
                        Lihat Semua
                      </button>
                    </div>

                    <div className="flex flex-col gap-5">
                      {events.slice(0, 2).map((ev) => {
                        const occupancyPercent = Math.round((ev.sold / ev.quota) * 100);
                        return (
                          <div key={ev.id} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#0d0d10] border border-[#26262f] flex items-center justify-center text-xs font-bold text-[#ff3b70] shrink-0">
                                  {ev.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-white leading-snug">{ev.name}</span>
                                  <span className="text-[11px] text-[#8b8b9a] mt-0.5 leading-none flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#ff3b70]" />
                                    {ev.location.split(",")[0]}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-white font-mono shrink-0">
                                {ev.sold.toLocaleString("id-ID")} / {ev.quota.toLocaleString("id-ID")}
                              </span>
                            </div>
                            
                            <div className="w-full h-1.5 bg-[#09090b] rounded-full overflow-hidden border border-[#26262f]/30">
                              <div
                                className="h-full bg-gradient-to-r from-[#ff3b70] to-[#8b5cf6] rounded-full transition-all duration-500"
                                style={{ width: `${occupancyPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="lg:col-span-5 bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                  <h3 className="text-base font-semibold text-white tracking-wide mb-6">Aktivitas Terakhir</h3>
                  
                  <div className="flex flex-col gap-5">
                    {[
                      { user: "Budi Santoso", action: "membeli 2 tiket", item: "Rock Anthem", time: "2 menit lalu", color: "bg-[#ff3b70]/15 text-[#ff3b70]" },
                      { user: "Pendaftaran artis baru", action: ":", item: "The Midnight Sun", time: "15 menit lalu", color: "bg-purple-500/15 text-purple-400" },
                      { user: "Event Art Tech Expo", action: "telah disetujui", item: "", time: "1 jam lalu", color: "bg-teal-500/15 text-teal-400" }
                    ].map((act, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${act.color}`}>
                          {act.user.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-0.5 leading-snug">
                          <p className="text-xs text-[#8b8b9a]">
                            <span className="text-white font-bold">{act.user}</span> {act.action}{" "}
                            {act.item && <span className="text-[#ff3b70] font-semibold">{act.item}</span>}
                          </p>
                          <span className="text-[10px] text-[#50505f] font-mono mt-0.5">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== B. EVENT VIEW ==================== */}
          {activeTab === "event" && (
            <div className="animate-fade-in">
              {eventSubView === "list" && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-white">Daftar Event</h1>
                      <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                        Kelola semua jadwal konser dan pertunjukan musik yang akan datang.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative">
                        <select className="bg-[#141419] border border-[#26262f] text-xs text-white py-3 px-4.5 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer pr-10 font-semibold tracking-wide">
                          <option>Semua Kategori</option>
                          {categories.map(cat => (
                            <option key={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                      </div>

                      <button
                        onClick={() => setEventSubView("add")}
                        className="py-3 px-4.5 bg-[#fecdd3] hover:bg-[#fda4af] text-[#4c0519] rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#ff3b70]/10 hover:scale-[1.01]"
                      >
                        <Plus className="w-4.5 h-4.5 stroke-[3]" />
                        <span>Tambah Event Baru</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl glow-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#26262f] text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase bg-[#0d0d10]/40">
                            <th className="py-4 px-6">Event & Artis</th>
                            <th className="py-4 px-6">Jadwal</th>
                            <th className="py-4 px-6">Okupansi Tiket</th>
                            <th className="py-4 px-6 text-center">Status</th>
                            <th className="py-4 px-6 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#26262f]/50">
                          {filteredEvents.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-12 text-center text-xs text-[#8b8b9a] font-semibold">
                                Tidak ada event yang cocok dengan pencarian Anda.
                              </td>
                            </tr>
                          ) : (
                            filteredEvents.map((ev) => {
                              const occupancyPercent = Math.round((ev.sold / ev.quota) * 100);
                              
                              let statusBadgeClass = "";
                              switch (ev.status) {
                                case "ACTIVE":
                                  statusBadgeClass = "border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981]";
                                  break;
                                case "SOLD OUT":
                                  statusBadgeClass = "border-purple-500/30 bg-purple-500/5 text-purple-400";
                                  break;
                                case "CLOSED":
                                  statusBadgeClass = "border-zinc-500/30 bg-zinc-500/5 text-zinc-500";
                                  break;
                                default:
                                  statusBadgeClass = "border-zinc-500/30 bg-zinc-500/5 text-zinc-400";
                              }

                              return (
                                <tr key={ev.id} className="hover:bg-[#181822]/40 transition-colors">
                                  <td className="py-5 px-6">
                                    <div className="flex items-center gap-3.5">
                                      <div className="w-10 h-10 rounded-lg bg-[#0d0d10] border border-[#26262f] flex items-center justify-center text-xs font-bold text-[#ff3b70] shrink-0">
                                        {ev.name.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-xs font-bold text-white truncate max-w-[200px]">{ev.name}</span>
                                        <span className="text-[11px] text-[#8b8b9a] truncate font-medium max-w-[150px]">{ev.artist}</span>
                                      </div>
                                    </div>
                                  </td>
                                  
                                  <td className="py-5 px-6">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-xs font-semibold text-white font-mono">
                                        {new Date(ev.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                      </span>
                                      <span className="text-[10px] text-[#ff3b70] truncate max-w-[150px] font-medium">
                                        {ev.location.split(",")[0]}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-5 px-6 min-w-[160px]">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                                        <span className="text-white font-bold">{ev.sold} / {ev.quota}</span>
                                        <span className="text-[#8b8b9a] font-semibold">{occupancyPercent}%</span>
                                      </div>
                                      <div className="w-full h-1 bg-[#09090b] rounded-full overflow-hidden border border-[#26262f]/30">
                                        <div
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            occupancyPercent >= 100 
                                              ? "bg-purple-500" 
                                              : occupancyPercent >= 80 
                                                ? "bg-gradient-to-r from-[#ff3b70] to-[#8b5cf6]" 
                                                : "bg-[#ff3b70]"
                                          }`}
                                          style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-5 px-6 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold tracking-wider uppercase leading-none ${statusBadgeClass}`}>
                                      {ev.status === "ACTIVE" && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                                      {ev.status === "SOLD OUT" && <span className="w-1 h-1 rounded-full bg-purple-400" />}
                                      {ev.status === "CLOSED" && <span className="w-1 h-1 rounded-full bg-zinc-500" />}
                                      {ev.status}
                                    </span>
                                  </td>

                                  <td className="py-5 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2.5">
                                      <button 
                                        onClick={() => triggerNotification(`Edit event "${ev.name}" is under development.`)}
                                        className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 text-[#8b8b9a] hover:text-white hover:border-[#ff3b70]/20 transition-all cursor-pointer"
                                        title="Edit Event"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEvent(ev.id)}
                                        className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 text-[#ff3b70]/70 hover:text-white hover:bg-[#ff3b70]/10 hover:border-[#ff3b70]/40 transition-all cursor-pointer"
                                        title="Hapus Event"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-5 border-t border-[#26262f]/60 flex items-center justify-between text-xs font-semibold text-[#8b8b9a]">
                      <span>Menampilkan 1-{filteredEvents.length} dari {filteredEvents.length} event</span>
                      <div className="flex items-center gap-1.5">
                        <button className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer">
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#ff3b70]/30 bg-[#ff3b70]/10 text-white font-bold">
                          1
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all">
                          2
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all">
                          3
                        </button>
                        <button className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
                      <div>
                        <span className="text-[10px] text-[#8b8b9a] font-bold tracking-wider uppercase block">Total Tiket Terjual</span>
                        <span className="text-2xl font-extrabold text-white mt-1.5 block font-mono">{totalSoldTickets.toLocaleString("id-ID")}</span>
                        <span className="text-[10px] text-emerald-400 font-bold mt-1 block font-mono">+12% dari bulan lalu</span>
                      </div>
                      <Ticket className="w-12 h-12 text-[#26262f] absolute right-4 top-1/2 -translate-y-1/2 opacity-20 shrink-0" />
                    </div>

                    <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
                      <div>
                        <span className="text-[10px] text-[#8b8b9a] font-bold tracking-wider uppercase block">Estimasi Pendapatan</span>
                        <span className="text-2xl font-extrabold text-white mt-1.5 block font-mono">{formatIDR(totalRevenue)}</span>
                        <span className="text-[10px] text-[#8b8b9a] font-semibold mt-1 block">Pembayaran Terverifikasi</span>
                      </div>
                      <Wallet className="w-12 h-12 text-[#26262f] absolute right-4 top-1/2 -translate-y-1/2 opacity-20 shrink-0" />
                    </div>

                    <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
                      <div>
                        <span className="text-[10px] text-[#8b8b9a] font-bold tracking-wider uppercase block">Event Mendatang</span>
                        <span className="text-2xl font-extrabold text-white mt-1.5 block font-mono">
                          {activeEventsCount < 10 ? `0${activeEventsCount}` : activeEventsCount}
                        </span>
                        <span className="text-[10px] text-[#8b8b9a] font-semibold mt-1 block">Hingga Desember 2024</span>
                      </div>
                      <CalendarDays className="w-12 h-12 text-[#26262f] absolute right-4 top-1/2 -translate-y-1/2 opacity-20 shrink-0" />
                    </div>
                  </div>
                </div>
              )}

              {eventSubView === "add" && (
                <div className="flex flex-col gap-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-white">Add New Event</h1>
                      <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                        Launch your next massive music experience.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEventSubView("list")}
                        className="py-3 px-6 bg-transparent border border-[#26262f] hover:border-white/20 text-[#f4f4f5] rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveEvent}
                        className="py-3 px-6 rounded-xl text-white font-bold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        Simpan Event
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                      <div className="flex items-center gap-2 mb-6 border-b border-[#26262f]/40 pb-4">
                        <Info className="w-4 h-4 text-[#ff3b70]" />
                        <h3 className="text-sm font-bold tracking-wider text-white uppercase">Detail Utama</h3>
                      </div>

                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Event Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Neon Nights Symphony"
                            className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                            value={eventForm.name}
                            onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Artist</label>
                            <div className="relative">
                              <select
                                className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold appearance-none cursor-pointer"
                                value={eventForm.artist}
                                onChange={(e) => setEventForm({ ...eventForm, artist: e.target.value })}
                              >
                                <option value="">Pilih Artis</option>
                                {artists.map(art => (
                                  <option key={art.id} value={art.name}>{art.name}</option>
                                ))}
                              </select>
                              <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Kategori</label>
                            <div className="relative">
                              <select
                                className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold appearance-none cursor-pointer"
                                value={eventForm.category}
                                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                              >
                                <option value="">Pilih Kategori</option>
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                              </select>
                              <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Date</label>
                            <input
                              type="date"
                              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold font-mono"
                              value={eventForm.date}
                              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Time</label>
                            <input
                              type="time"
                              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold font-mono"
                              value={eventForm.time}
                              onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Ticket Price (IDR)</label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8b8b9a]">Rp</div>
                              <input
                                type="number"
                                className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold font-mono"
                                value={eventForm.ticketPrice}
                                onChange={(e) => setEventForm({ ...eventForm, ticketPrice: Math.max(0, Number(e.target.value)) })}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Quota / Capacity</label>
                            <input
                              type="number"
                              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold font-mono"
                              value={eventForm.quota}
                              onChange={(e) => setEventForm({ ...eventForm, quota: Math.max(1, Number(e.target.value)) })}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Location</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff3b70]" />
                              <input
                                type="text"
                                placeholder="Venue name and city"
                                className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                                value={eventForm.location}
                                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => triggerNotification("Lokasi map picker diaktifkan.")}
                              className="w-11 h-11 bg-[#18181f] border border-[#26262f] hover:border-[#ff3b70]/40 hover:text-white rounded-xl flex items-center justify-center text-[#8b8b9a] transition-all cursor-pointer shrink-0"
                            >
                              <FolderKanban className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Description</label>
                          <textarea
                            rows="4"
                            placeholder="Detail deskripsi event, line-up, dan peraturan..."
                            className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-medium leading-relaxed"
                            value={eventForm.description}
                            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                      <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                        <div className="flex justify-between items-center mb-5">
                          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                            <Upload className="w-4.5 h-4.5 text-[#ff3b70]" /> Poster Utama
                          </span>
                          <span className="text-[9px] font-bold tracking-wider font-mono text-[#8b8b9a] border border-[#26262f] bg-[#0d0d10] px-2 py-0.5 rounded">3:4 Ratio</span>
                        </div>

                        <div 
                          onClick={() => triggerNotification("Mockupload Poster berhasil.")}
                          className="border border-dashed border-[#ff3b70]/20 hover:border-[#ff3b70]/50 bg-[#0d0d10] rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all duration-300 min-h-[220px]"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#ff3b70]/10 flex items-center justify-center text-[#ff3b70] border border-[#ff3b70]/20">
                            <Upload className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="text-xs text-white font-bold leading-normal">Click to upload or drag & drop</p>
                            <p className="text-[10px] text-[#8b8b9a] mt-1 leading-normal">High resolution PNG, JPG, or WebP (Max 5MB)</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                        <div className="flex justify-between items-center mb-5">
                          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                            <Upload className="w-4.5 h-4.5 text-[#ff3b70]" /> Banner Header
                          </span>
                          <span className="text-[9px] font-bold tracking-wider font-mono text-[#8b8b9a] border border-[#26262f] bg-[#0d0d10] px-2 py-0.5 rounded">21:9 Ratio</span>
                        </div>

                        <div 
                          onClick={() => triggerNotification("Mockupload Banner berhasil.")}
                          className="border border-dashed border-[#ff3b70]/20 hover:border-[#ff3b70]/50 bg-[#0d0d10] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer transition-all duration-300 min-h-[140px]"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#ff3b70]/10 flex items-center justify-center text-[#ff3b70] border border-[#ff3b70]/20">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-white font-bold leading-normal">Upload Banner</p>
                            <p className="text-[10px] text-[#8b8b9a] mt-1 leading-none">Recommended 1920x820px</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-5 glow-card grid grid-cols-2 divide-x divide-[#26262f]">
                        <div className="pr-4 flex flex-col justify-center">
                          <span className="text-[9px] font-bold tracking-wider uppercase text-[#8b8b9a]">Potential Revenue</span>
                          <span className="text-lg font-extrabold text-[#10b981] mt-1 font-mono tracking-wide">{formatIDR(potentialRevenue)}</span>
                        </div>
                        <div className="pl-5 flex flex-col justify-center">
                          <span className="text-[9px] font-bold tracking-wider uppercase text-[#8b8b9a]">Visibility Score</span>
                          <span className="text-lg font-extrabold text-[#ff3b70] mt-1 tracking-wide flex items-center gap-1.5 glow-pink">
                            {eventForm.name && eventForm.location ? "High" : "Low"}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== C. CATEGORIES VIEW ==================== */}
          {activeTab === "kategori" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Kelola Kategori</h1>
                <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                  Manage musical genres and event classifications for the Electric Pulse ecosystem.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                    <div className="flex items-center gap-2 mb-6 border-b border-[#26262f]/40 pb-4">
                      <Plus className="w-4.5 h-4.5 text-[#ff3b70]" />
                      <h3 className="text-sm font-bold tracking-wider text-white uppercase">Tambah Kategori Baru</h3>
                    </div>

                    <form onSubmit={handleSaveCategory} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Category Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Synthwave"
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        />
                      </div>

                      <div className="flex flex-col gap-3.5">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Icon & Color Tag</label>
                        
                        <div className="flex gap-2">
                          {["music", "zap", "radio", "headphones"].map((ic) => (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => setCategoryForm({ ...categoryForm, icon: ic })}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                categoryForm.icon === ic
                                  ? "border-[#ff3b70] bg-[#ff3b70]/10 text-white shadow-md shadow-[#ff3b70]/10"
                                  : "border-[#26262f] bg-[#0d0d10] text-[#8b8b9a] hover:text-white"
                              }`}
                            >
                              {renderCategoryIcon(ic, "w-4.5 h-4.5")}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2.5 mt-1">
                          {["pink", "teal", "purple", "peach", "green"].map((col) => {
                            let colorBg = "";
                            switch (col) {
                              case "pink": colorBg = "bg-[#ff3b70]"; break;
                              case "teal": colorBg = "bg-teal-400"; break;
                              case "purple": colorBg = "bg-purple-500"; break;
                              case "peach": colorBg = "bg-amber-400"; break;
                              case "green": colorBg = "bg-emerald-500"; break;
                            }
                            return (
                              <button
                                key={col}
                                type="button"
                                onClick={() => setCategoryForm({ ...categoryForm, color: col })}
                                className={`w-5.5 h-5.5 rounded-full ${colorBg} flex items-center justify-center transition-all cursor-pointer hover:scale-110 relative`}
                              >
                                {categoryForm.color === col && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-white block border border-black/20" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Description</label>
                        <textarea
                          rows="3"
                          placeholder="Briefly describe the genre's characteristics..."
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-medium leading-relaxed"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 mt-1 rounded-xl text-white font-semibold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        Simpan Kategori
                      </button>
                    </form>
                  </div>

                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card relative overflow-hidden group">
                    <span className="text-[9px] font-extrabold tracking-wider uppercase text-[#ff3b70]">Insights</span>
                    <h4 className="text-sm font-bold text-white mt-1.5">Category Performance</h4>
                    <p className="text-xs text-[#8b8b9a] mt-2.5 leading-relaxed">
                      &ldquo;<span className="text-white font-semibold">Jazz</span>&rdquo; categories are trending up by <span className="text-[#10b981] font-bold">12%</span> this week in Jakarta.
                    </p>
                    <button 
                      onClick={() => triggerNotification("Redirecting to detailed category reports...")}
                      className="text-xs font-bold text-[#ff3b70] hover:text-[#ff5c8a] hover:underline mt-4 block transition-all"
                    >
                      View Analytics
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141419] border border-[#26262f] rounded-2xl glow-card overflow-hidden">
                  <div className="p-6 border-b border-[#26262f]/45 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                      <FolderKanban className="w-4.5 h-4.5 text-[#ff3b70]" /> Daftar Kategori
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => triggerNotification("Urutkan kategori diaktifkan.")}
                        className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 text-[#8b8b9a] hover:text-white transition-all cursor-pointer"
                        title="Sort"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => triggerNotification("Download daftar kategori diaktifkan.")}
                        className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 text-[#8b8b9a] hover:text-white transition-all cursor-pointer"
                        title="Export"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#26262f] text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase bg-[#0d0d10]/40">
                          <th className="py-4 px-6">Category Name</th>
                          <th className="py-4 px-6">Description</th>
                          <th className="py-4 px-6 text-center">Linked Events</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#26262f]/50">
                        {categories.map((cat) => {
                          const linkedEventCount = events.filter(ev => ev.category === cat.name).length;
                          return (
                            <tr key={cat.id} className="hover:bg-[#181822]/40 transition-colors">
                              <td className="py-4.5 px-6">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getCategoryColorClass(cat.color)} shrink-0`}>
                                    {renderCategoryIcon(cat.icon, "w-4 h-4")}
                                  </div>
                                  <span className="text-xs font-bold text-white">{cat.name}</span>
                                </div>
                              </td>

                              <td className="py-4.5 px-6 max-w-[200px]">
                                <p className="text-[11px] text-[#8b8b9a] line-clamp-2 leading-relaxed font-medium">
                                  {cat.description}
                                </p>
                              </td>

                              <td className="py-4.5 px-6 text-center text-xs font-bold font-mono text-white">
                                {linkedEventCount} {linkedEventCount === 1 ? "Event" : "Events"}
                              </td>

                              <td className="py-4.5 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => triggerNotification(`Edit kategori "${cat.name}" is under development.`)}
                                    className="p-1.5 rounded-lg border border-[#26262f]/80 bg-[#0d0d10]/40 text-[#8b8b9a] hover:text-white hover:border-[#ff3b70]/20 transition-all cursor-pointer"
                                    title="Edit Kategori"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="p-1.5 rounded-lg border border-[#26262f]/80 bg-[#0d0d10]/40 text-[#ff3b70]/70 hover:text-white hover:bg-[#ff3b70]/10 hover:border-[#ff3b70]/40 transition-all cursor-pointer"
                                    title="Hapus Kategori"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-[#26262f]/60 flex items-center justify-between text-[11px] font-semibold text-[#8b8b9a]">
                    <span>Showing 1-{categories.length} of {categories.length} categories</span>
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer">
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button className="w-6.5 h-6.5 rounded-lg flex items-center justify-center border border-[#ff3b70]/30 bg-[#ff3b70]/10 text-white font-bold">
                        1
                      </button>
                      <button className="p-1.5 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer">
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ==================== D. ARTIST VIEW (NEWLY ADDED PAGE) ==================== */}
          {activeTab === "artis" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              
              {/* VIEW 1: ARTISTS GRID */}
              {artistSubView === "grid" && (
                <div className="flex flex-col gap-8">
                  {/* Title & Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-white">Kelola Artis</h1>
                      <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                        Manajemen profil artis, penentuan genre musik, dan pemantauan performa event yang sedang berjalan.
                      </p>
                    </div>

                    <button
                      onClick={() => setArtistSubView("add")}
                      className="py-3 px-5 rounded-xl text-white font-bold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Tambah Artis</span>
                    </button>
                  </div>

                  {/* Filter row */}
                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    {/* Search inside tab */}
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9a]" />
                      <input
                        type="text"
                        placeholder="Cari nama artis atau genre..."
                        className="w-full bg-[#0d0d10] border border-[#26262f] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Filter controls */}
                    <div className="flex gap-3 text-xs font-semibold shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8b8b9a]">Filter:</span>
                        <div className="relative">
                          <select 
                            className="bg-[#0d0d10] border border-[#26262f] text-white py-2.5 pl-4 pr-9 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer"
                            value={artistGenreFilter}
                            onChange={(e) => setArtistGenreFilter(e.target.value)}
                          >
                            <option>Semua Genre</option>
                            <option>Synthwave</option>
                            <option>Indie Rock</option>
                            <option>Jazz Fusion</option>
                          </select>
                          <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[#8b8b9a]">Urutkan:</span>
                        <div className="relative">
                          <select className="bg-[#0d0d10] border border-[#26262f] text-white py-2.5 pl-4 pr-9 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer">
                            <option>Terbaru</option>
                            <option>Nama A-Z</option>
                            <option>Event Terbanyak</option>
                          </select>
                          <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid layout containing artist cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    
                    {/* Rendered dynamic artists list */}
                    {filteredArtists.map((art) => (
                      <div 
                        key={art.id} 
                        className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card flex flex-col items-center text-center gap-4 group transition-all duration-300 hover:border-[#ff3b70]/30 hover:scale-[1.01]"
                      >
                        {/* Avatar block */}
                        {renderArtistAvatar(art.avatarIndex, art.name)}

                        {/* Text info */}
                        <div className="flex flex-col items-center gap-1.5">
                          <h3 className="text-base font-bold text-white tracking-wide">{art.name}</h3>
                          <span className="text-[9px] font-bold tracking-wider text-[#ff3b70] border border-[#ff3b70]/20 bg-[#ff3b70]/5 px-2.5 py-0.5 rounded-full uppercase leading-none">
                            {art.genre}
                          </span>
                          <span className="text-[11px] text-[#8b8b9a] font-mono mt-1 flex items-center gap-1">
                            <Instagram className="w-3 h-3 text-[#ff3b70]" />
                            {art.instagram}
                          </span>
                        </div>

                        {/* Stats indicator & details button */}
                        <div className="w-full flex items-center justify-between border-t border-[#26262f]/45 pt-4 mt-1">
                          <div className="flex flex-col text-left gap-0.5">
                            <span className="text-[8px] text-[#8b8b9a] font-bold tracking-wider uppercase">Event Aktif</span>
                            <span className="text-sm font-bold text-white font-mono">{art.activeEvents < 10 ? `0${art.activeEvents}` : art.activeEvents}</span>
                          </div>
                          <button
                            onClick={() => setSelectedArtist(art)}
                            className="px-3.5 py-2 rounded-xl bg-[#1e1e24] hover:bg-[#2c2c35] text-white text-[10px] font-bold transition-all border border-[#26262f] cursor-pointer"
                          >
                            Detail Artis
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Dotted empty slot Add New Card */}
                    <div 
                      onClick={() => setArtistSubView("add")}
                      className="border border-dashed border-[#26262f] hover:border-[#ff3b70]/30 bg-[#0d0d10] hover:bg-[#141419]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3.5 cursor-pointer min-h-[290px] transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 rounded-full border border-dashed border-[#26262f] group-hover:border-[#ff3b70]/50 flex items-center justify-center text-[#8b8b9a] group-hover:text-white transition-all bg-[#141419]">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-bold leading-normal">Tambah Artis</p>
                        <p className="text-xs text-[#8b8b9a] mt-1 leading-normal max-w-[160px] mx-auto">Klik untuk mendaftarkan artis baru.</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* VIEW 2: ADD NEW ARTIST FORM */}
              {artistSubView === "add" && (
                <div className="flex flex-col gap-8 max-w-xl">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Tambah Artis Baru</h1>
                    <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                      Booking management talent, daftarkan musisi baru dalam ekosistem Electric Pulse.
                    </p>
                  </div>

                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                    <form onSubmit={handleSaveArtist} className="flex flex-col gap-5">
                      
                      {/* Name */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Nama Artis / Grup</label>
                        <input
                          type="text"
                          placeholder="e.g. The Eras Band"
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                          value={artistForm.name}
                          onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })}
                        />
                      </div>

                      {/* Genre dropdown */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Genre Musik</label>
                        <div className="relative">
                          <select 
                            className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold appearance-none cursor-pointer"
                            value={artistForm.genre}
                            onChange={(e) => setArtistForm({ ...artistForm, genre: e.target.value })}
                          >
                            <option>SYNTHWAVE</option>
                            <option>INDIE ROCK</option>
                            <option>JAZZ FUSION</option>
                            <option>POP DANCE</option>
                            <option>HIP HOP</option>
                          </select>
                          <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      {/* Instagram Handle */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Instagram Username</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#ff3b70]">@</span>
                          <input
                            type="text"
                            placeholder="username_artis"
                            className="w-full bg-[#18181f] border border-[#26262f] rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                            value={artistForm.instagram}
                            onChange={(e) => setArtistForm({ ...artistForm, instagram: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Initial active events (mock) */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Jumlah Event Aktif Pertama</label>
                        <input
                          type="number"
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold font-mono"
                          value={artistForm.activeEvents}
                          onChange={(e) => setArtistForm({ ...artistForm, activeEvents: Math.max(0, Number(e.target.value)) })}
                        />
                      </div>

                      {/* Form Buttons */}
                      <div className="flex gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setArtistSubView("grid")}
                          className="flex-1 py-3 bg-transparent border border-[#26262f] hover:border-white/20 text-[#f4f4f5] rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 rounded-xl text-white font-bold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        >
                          Simpan Artis
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== E. PAYMENTS VIEW (RIWAYAT PEMBAYARAN TIKET) ==================== */}
          {activeTab === "pembayaran" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Riwayat Pembayaran Tiket</h1>
                <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">Daftar seluruh transaksi pembayaran tiket dari para pembeli.</p>
              </div>

              {/* Grid 3 stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Menunggu pembayaran */}
                <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-[#8b8b9a] font-bold tracking-wider uppercase">Menunggu Pembayaran</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/15">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-white font-mono leading-none">{pendingPaymentsCount}</span>
                    <span className="text-[9px] text-[#8b8b9a] mt-2 font-medium">Transaksi menunggu pembayaran pembeli</span>
                  </div>
                </div>

                {/* 2. Total Terbayar Hari Ini */}
                <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-[#8b8b9a] font-bold tracking-wider uppercase">Total Terbayar Hari Ini</span>
                    <div className="w-8 h-8 rounded-xl bg-[#ff3b70]/10 text-[#ff3b70] flex items-center justify-center border border-[#ff3b70]/15">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-[#10b981] font-mono leading-none">{formatIDR(verifiedRevenueToday)}</span>
                    <span className="text-[9px] text-[#8b8b9a] mt-2 font-medium">Nominal akumulasi transaksi sukses</span>
                  </div>
                </div>

                {/* 3. Total Transaksi */}
                <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-[#8b8b9a] font-bold tracking-wider uppercase">Total Transaksi</span>
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/15">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-white font-mono leading-none">1.240</span>
                    <span className="text-[9px] text-[#8b8b9a] mt-2 font-medium">Akun terdaftar melakukan checkout</span>
                  </div>
                </div>
              </div>

              {/* Payments Table card */}
              <div className="bg-[#141419] border border-[#26262f] rounded-2xl glow-card overflow-hidden">
                
                <div className="p-6 border-b border-[#26262f]/45 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                    <CreditCard className="w-4.5 h-4.5 text-[#ff3b70]" /> Riwayat Pembayaran
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => triggerNotification("Filter status pembayaran...")}
                      className="py-2 px-3.5 bg-[#0d0d10] border border-[#26262f] text-xs font-semibold text-[#8b8b9a] hover:text-white rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Filter Status</span>
                    </button>
                    <button 
                      onClick={() => triggerNotification("Ekspor log audit pembayaran sukses...")}
                      className="py-2 px-3.5 bg-[#0d0d10] border border-[#26262f] text-xs font-semibold text-[#8b8b9a] hover:text-white rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 rotate-180" />
                      <span>Export Log</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#26262f] text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase bg-[#0d0d10]/40">
                        <th className="py-4 px-6">Order ID</th>
                        <th className="py-4 px-6">Nama User</th>
                        <th className="py-4 px-6">Event Name</th>
                        <th className="py-4 px-6">Total Bayar</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#26262f]/50">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-xs text-[#8b8b9a] font-semibold">
                            Tidak ada transaksi pembayaran dalam daftar.
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((pay) => {
                          let payStatusClass = "";
                          switch (pay.status) {
                            case "PAID": payStatusClass = "border-emerald-500/35 bg-emerald-500/5 text-emerald-400"; break;
                            case "PENDING": payStatusClass = "border-amber-500/35 bg-amber-500/5 text-amber-400"; break;
                            case "REJECTED": payStatusClass = "border-[#ff3b70]/35 bg-[#ff3b70]/5 text-[#ff3b70]"; break;
                          }

                          return (
                            <tr key={pay.orderId} className="hover:bg-[#181822]/40 transition-colors">
                              {/* Order ID */}
                              <td className="py-5 px-6 font-mono text-xs font-semibold text-[#ff3b70]">
                                {pay.orderId}
                              </td>

                              {/* User Name with avatar */}
                              <td className="py-5 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full bg-[#18181f] border border-[#26262f] flex items-center justify-center text-[10px] font-bold text-white text-indigo-400">
                                    {pay.avatar}
                                  </div>
                                  <span className="text-xs font-bold text-white">{pay.user}</span>
                                </div>
                              </td>

                              {/* Target Event */}
                              <td className="py-5 px-6">
                                <span className="text-xs font-bold text-white block max-w-[150px] truncate">{pay.event}</span>
                              </td>

                              {/* Total Bayar */}
                              <td className="py-5 px-6 font-mono text-xs font-bold text-white">
                                Rp {pay.totalBayar.toLocaleString("id-ID")}
                              </td>

                              {/* Status Badge */}
                              <td className="py-5 px-6 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full border text-[9px] font-bold tracking-wider leading-none ${payStatusClass}`}>
                                  {pay.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-5 border-t border-[#26262f]/60 flex items-center justify-between text-xs font-semibold text-[#8b8b9a]">
                  <span>Showing 1-4 of 12 entries</span>
                  <div className="flex items-center gap-1.5">
                    <button className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#ff3b70]/30 bg-[#ff3b70]/10 text-white font-bold">
                      1
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all">
                      2
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all">
                      3
                    </button>
                    <button className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== F. REPORTS VIEW (NEWLY ADDED PAGE) ==================== */}
          {activeTab === "laporan" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">Laporan Penjualan</h1>
                  <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">Analisis data transaksi dan performa penjualan tiket.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* Select timeline */}
                  <div className="relative">
                    <select className="bg-[#141419] border border-[#26262f] text-xs text-white py-3 pl-4 pr-10 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer font-semibold tracking-wide">
                      <option>Terakhir 30 Hari</option>
                      <option>Terakhir 7 Hari</option>
                      <option>Terakhir 90 Hari</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                  {/* Export button */}
                  <button 
                    onClick={() => triggerNotification("Proses ekspor file CSV dimulai...")}
                    className="py-3 px-4.5 bg-[#fecdd3] hover:bg-[#fda4af] text-[#4c0519] rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff3b70]/10 hover:scale-[1.01]"
                  >
                    <Upload className="w-4.5 h-4.5 rotate-180" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Revenue Breakdown Table (Left) */}
                <div className="lg:col-span-8 bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-semibold text-white tracking-wide">Revenue Breakdown</h3>
                        <p className="text-[10px] text-[#8b8b9a] mt-0.5">Penjualan tiket pertunjukan aktif.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold font-mono">LIVE DATA</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#26262f] text-[9px] tracking-wider text-[#8b8b9a] font-bold uppercase pb-3">
                            <th className="py-3 px-1">Event Name</th>
                            <th className="py-3 px-3">Tickets Sold</th>
                            <th className="py-3 px-3">Avg Price</th>
                            <th className="py-3 px-3 text-right">Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#26262f]/40">
                          {[
                            { name: "Born Pink World Tour", sold: "12,450 / 15,000", avg: 1250000, revenue: 15560000000 },
                            { name: "The Eras Festival", sold: "8,900 / 10,000", avg: 950000, revenue: 8450000000 },
                            { name: "Jazz Under the Stars", sold: "2,100 / 2,500", avg: 450000, revenue: 945000000 },
                            { name: "Rock Night: Rebirth", sold: "4,500 / 5,000", avg: 350000, revenue: 1570000000 }
                          ].map((row, index) => (
                            <tr key={index} className="hover:bg-[#181822]/20 transition-colors">
                              <td className="py-4 px-1 font-bold text-white">{row.name}</td>
                              <td className="py-4 px-3 font-mono font-semibold text-[#8b8b9a]">{row.sold}</td>
                              <td className="py-4 px-3 font-mono text-[#8b8b9a]">Rp {row.avg.toLocaleString("id-ID")}</td>
                              <td className="py-4 px-3 text-right font-mono font-extrabold text-[#ff3b70]">{formatIDR(row.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 2. Genre Performance Donut Chart (Right) */}
                <div className="lg:col-span-4 bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-wide mb-6">Genre Performance</h3>
                    
                    {/* SVG Donut Chart container */}
                    <div className="relative flex items-center justify-center py-4">
                      <svg viewBox="0 0 150 150" className="w-44 h-44 overflow-visible rotate-[-90deg]">
                        {/* Donut sectors calculation using strokeDasharray/strokeDashoffset */}
                        {/* Total circumference = 314.16 */}
                        {/* Pop (40%): color #ff3b70 */}
                        <circle
                          cx="75" cy="75" r="50"
                          fill="transparent"
                          stroke="#ff3b70"
                          strokeWidth="16"
                          strokeDasharray="125.66 314.16"
                          strokeDashoffset="0"
                          className="transition-all duration-300 cursor-pointer hover:stroke-width-[18]"
                          onMouseEnter={() => setHoveredDonutSegment("Pop (40%)")}
                          onMouseLeave={() => setHoveredDonutSegment(null)}
                        />
                        {/* Rock (25%): color #8b5cf6 */}
                        <circle
                          cx="75" cy="75" r="50"
                          fill="transparent"
                          stroke="#8b5cf6"
                          strokeWidth="16"
                          strokeDasharray="78.54 314.16"
                          strokeDashoffset="-125.66"
                          className="transition-all duration-300 cursor-pointer hover:stroke-width-[18]"
                          onMouseEnter={() => setHoveredDonutSegment("Rock (25%)")}
                          onMouseLeave={() => setHoveredDonutSegment(null)}
                        />
                        {/* Jazz (15%): color #06b6d4 */}
                        <circle
                          cx="75" cy="75" r="50"
                          fill="transparent"
                          stroke="#06b6d4"
                          strokeWidth="16"
                          strokeDasharray="47.12 314.16"
                          strokeDashoffset="-204.2"
                          className="transition-all duration-300 cursor-pointer hover:stroke-width-[18]"
                          onMouseEnter={() => setHoveredDonutSegment("Jazz (15%)")}
                          onMouseLeave={() => setHoveredDonutSegment(null)}
                        />
                        {/* Indie (10%): color #fb923c */}
                        <circle
                          cx="75" cy="75" r="50"
                          fill="transparent"
                          stroke="#fb923c"
                          strokeWidth="16"
                          strokeDasharray="31.42 314.16"
                          strokeDashoffset="-251.32"
                          className="transition-all duration-300 cursor-pointer hover:stroke-width-[18]"
                          onMouseEnter={() => setHoveredDonutSegment("Indie (10%)")}
                          onMouseLeave={() => setHoveredDonutSegment(null)}
                        />
                        {/* Festival (10%): color #d946ef */}
                        <circle
                          cx="75" cy="75" r="50"
                          fill="transparent"
                          stroke="#d946ef"
                          strokeWidth="16"
                          strokeDasharray="31.42 314.16"
                          strokeDashoffset="-282.74"
                          className="transition-all duration-300 cursor-pointer hover:stroke-width-[18]"
                          onMouseEnter={() => setHoveredDonutSegment("Festival (10%)")}
                          onMouseLeave={() => setHoveredDonutSegment(null)}
                        />
                      </svg>

                      {/* Donut Center Label */}
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-extrabold text-white leading-none">100%</span>
                        <span className="text-[9px] text-[#8b8b9a] font-bold tracking-wider uppercase mt-1">Total Share</span>
                      </div>
                    </div>

                    {/* Show hovered label dynamic overlay */}
                    <div className="h-4 text-center mt-2">
                      {hoveredDonutSegment && (
                        <span className="text-xs font-bold text-white transition-all">{hoveredDonutSegment}</span>
                      )}
                    </div>

                    {/* Donut Legend */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-semibold text-[#8b8b9a] border-t border-[#26262f]/45 pt-4 mt-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#ff3b70] shrink-0" />
                        <span>Pop (40%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#8b5cf6] shrink-0" />
                        <span>Rock (25%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#06b6d4] shrink-0" />
                        <span>Jazz (15%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#fb923c] shrink-0" />
                        <span>Indie (10%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#d946ef] shrink-0" />
                        <span>Festival (10%)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Card - Ticket Sales Progress */}
              <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                <h3 className="text-base font-semibold text-white tracking-wide mb-6">Ticket Sales Progress</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {[
                    { name: "Born Pink World Tour", sold: 85 },
                    { name: "The Eras Festival", sold: 89 },
                    { name: "Rock Night: Rebirth", sold: 90 },
                    { name: "Jazz Under the Stars", sold: 84 },
                    { name: "Indie Vibes Bandung", sold: 72 }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-semibold leading-none">
                        <span className="text-[#8b8b9a]">{bar.name}</span>
                        <span className="text-white font-mono font-bold">{bar.sold}% Sold</span>
                      </div>
                      {/* Meter bar */}
                      <div className="w-full h-2 bg-[#09090b] rounded-full overflow-hidden border border-[#26262f]/35">
                        <div 
                          className="h-full bg-gradient-to-r from-[#ff3b70] to-[#8b5cf6] rounded-full transition-all duration-500"
                          style={{ width: `${bar.sold}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== G. PROFILE VIEW (PROFIL ADMIN) ==================== */}
          {activeTab === "profil" && (
            <div className="flex flex-col gap-8 animate-fade-in max-w-4xl">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Profil Admin</h1>
                <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                  Kelola informasi akun admin dan keamanan akses konsol.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card flex flex-col items-center text-center gap-3.5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#ff3b70] to-[#8b5cf6] flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-[#ff3b70]/20 border-2 border-[#ff3b70]/30">
                      {(adminUser?.name || "AU").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{adminUser?.name || "Admin User"}</h3>
                      <p className="text-[11px] text-[#8b8b9a] font-mono mt-1">{adminUser?.email || "admin@electricpulse.com"}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border border-[#ff3b70]/30 bg-[#ff3b70]/10 text-[#ff3b70]">
                      Admin
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  {/* Account Info */}
                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                    <div className="flex items-center gap-2 mb-6 border-b border-[#26262f]/40 pb-4">
                      <UserCircle className="w-4.5 h-4.5 text-[#ff3b70]" />
                      <h3 className="text-sm font-bold tracking-wider text-white uppercase">Informasi Akun</h3>
                    </div>

                    <form 
                      onSubmit={(e) => { e.preventDefault(); triggerNotification("Profil admin berhasil diperbarui!"); }} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Nama Lengkap</label>
                        <input
                          type="text"
                          defaultValue={adminUser?.name || "Admin User"}
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Email</label>
                        <input
                          type="email"
                          defaultValue={adminUser?.email || "admin@electricpulse.com"}
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex justify-end md:col-span-2 pt-2">
                        <button
                          type="submit"
                          className="py-3 px-6 rounded-xl text-white font-bold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security */}
                  <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                    <div className="flex items-center gap-2 mb-6 border-b border-[#26262f]/40 pb-4">
                      <Shield className="w-4.5 h-4.5 text-[#ff3b70]" />
                      <h3 className="text-sm font-bold tracking-wider text-white uppercase">Keamanan</h3>
                    </div>

                    <form 
                      onSubmit={(e) => { e.preventDefault(); triggerNotification("Password admin berhasil diperbarui!"); }} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Password Lama</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Password Baru</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex justify-end md:col-span-2 pt-2">
                        <button
                          type="submit"
                          className="py-3 px-6 rounded-xl text-white font-bold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== H. SETTINGS VIEW (PENGATURAN ADMIN) ==================== */}
          {activeTab === "pengaturan" && (
            <div className="flex flex-col gap-8 animate-fade-in max-w-4xl">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Pengaturan</h1>
                <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                  Kelola preferensi konsol admin dan notifikasi sistem.
                </p>
              </div>

              <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                <div className="flex items-center gap-2 mb-6 border-b border-[#26262f]/40 pb-4">
                  <Bell className="w-4.5 h-4.5 text-[#ff3b70]" />
                  <h3 className="text-sm font-bold tracking-wider text-white uppercase">Notifikasi</h3>
                </div>

                <div className="flex flex-col gap-5">
                  {[
                    { label: "Email Alerts", desc: "Terima ringkasan laporan penjualan harian." },
                    { label: "Notifikasi Pembayaran", desc: "Diberitahu saat ada transaksi baru menunggu verifikasi." },
                    { label: "Peringatan Stok Tiket", desc: "Diberitahu saat okupansi tiket mencapai 80%." }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{item.label}</span>
                        <span className="text-[10px] text-[#8b8b9a] mt-0.5 block">{item.desc}</span>
                      </div>
                      <button
                        type="button"
                        className="w-10 h-6 rounded-full bg-[#ff3b70] p-1 transition-colors cursor-pointer"
                      >
                        <div className="w-4 h-4 bg-white rounded-full translate-x-4 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                <div className="flex items-center gap-2 mb-6 border-b border-[#26262f]/40 pb-4">
                  <Info className="w-4.5 h-4.5 text-[#ff3b70]" />
                  <h3 className="text-sm font-bold tracking-wider text-white uppercase">Preferensi Konsol</h3>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Bahasa Tampilan</span>
                      <span className="text-[10px] text-[#8b8b9a] mt-0.5 block">Pilih bahasa untuk antarmuka konsol.</span>
                    </div>
                    <div className="relative">
                      <select className="bg-[#18181f] border border-[#26262f] text-white text-xs py-2.5 pl-4 pr-9 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer">
                        <option>Bahasa Indonesia</option>
                        <option>English</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Mata Uang</span>
                      <span className="text-[10px] text-[#8b8b9a] mt-0.5 block">Format nominal pada laporan keuangan.</span>
                    </div>
                    <div className="relative">
                      <select className="bg-[#18181f] border border-[#26262f] text-white text-xs py-2.5 pl-4 pr-9 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer">
                        <option>IDR (Rp)</option>
                        <option>USD ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

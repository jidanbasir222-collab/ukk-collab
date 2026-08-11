"use client";

import React, { useEffect, useState } from "react";
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
  ChevronDown,
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ideal-wonder-production-445e.up.railway.app";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "event", label: "Event", icon: Calendar },
  { id: "artis", label: "Artis", icon: Users },
  { id: "kategori", label: "Kategori", icon: FolderKanban },
  { id: "pembayaran", label: "Riwayat Pembayaran Tiket", icon: CreditCard },
  { id: "laporan", label: "Laporan", icon: BarChart3 },
  { id: "profil", label: "Profil", icon: User },
  { id: "pengaturan", label: "Pengaturan", icon: Settings }
];

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
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

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

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, event, artis, kategori, pembayaran, laporan
  const [eventSubView, setEventSubView] = useState("list"); // list, add
  const [artistSubView, setArtistSubView] = useState("grid"); // grid, add

  // Notification State
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const notificationTimer = React.useRef(null);

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

  // Payments history metrics (live from API, fallback to mock baseline)
  const verifiedRevenueToday = Number(stats?.verifiedRevenueToday) || 45200000;

  // Live data refresh helper
  // Saat token kedaluwarsa (401), logout otomatis & kembali ke halaman login
  const handleAuthFailure = (res) => {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      router.replace("/");
      return true;
    }
    return false;
  };

  const refreshEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(
          data.map((e) => ({
            ...e,
            id: String(e.id),
            status: e.status || "ACTIVE",
            sold: Number(e.sold) || 0,
            quota: Number(e.quota) || 0,
            ticketPrice: Number(e.ticketPrice) || 0
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Deterministic avatar index dari id artis (hindari avatar berubah tiap polling)
  const avatarIndexFor = (id) => {
    const hash = String(id).split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 997, 7);
    return hash % 3;
  };

  const refreshArtists = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/artists`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setArtists(
          data.map((a) => ({
            ...a,
            id: String(a.id),
            avatarIndex: a.avatarIndex != null ? Number(a.avatarIndex) : avatarIndexFor(a.id)
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(
          data.map((c, idx) => ({
            ...c,
            id: String(c.id),
            icon: ["music", "zap", "radio", "headphones"][idx % 4] || "music",
            color: ["pink", "teal", "purple", "peach", "green"][idx % 5] || "pink"
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/payments`, { headers: { Authorization: `Bearer ${token}` } });
      if (handleAuthFailure(res)) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((p, idx) => ({
          orderId: p.orderId || `#VB-${100000 + idx}`,
          user: p.user_name || "Unknown",
          avatar: (p.user_name || "U").substring(0, 2).toUpperCase(),
          event: p.event_name || `Event #${p.event_id || "?"}`,
          totalBayar: Number(p.totalBayar) || 0,
          status: p.status || "PENDING",
          ticketQty: Number(p.ticket_qty) || 1
        }));
        setPayments(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Event Handler (POST to API)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.artist || !eventForm.category || !eventForm.date || !eventForm.location) {
      triggerNotification("Lengkapi semua field utama event!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: eventForm.name,
        artist: eventForm.artist,
        category: eventForm.category,
        date: eventForm.date,
        time: eventForm.time || "19:00",
        ticketPrice: Number(eventForm.ticketPrice) || 0,
        quota: Number(eventForm.quota) || 5000,
        location: eventForm.location,
        description: eventForm.description || null,
        poster: eventForm.poster || null,
        banner: eventForm.banner || null,
        status: eventForm.status || "ACTIVE"
      };

      let res;
      if (editingEventId) {
        res = await fetch(`${API_BASE}/api/events/${editingEventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan event.");

      const wasEditing = editingEventId;
      await refreshEvents();
      setEditingEventId(null);
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
        status: "ACTIVE",
        poster: null,
        banner: null
      });
      setEventSubView("list");
      triggerNotification(wasEditing ? "Event berhasil diperbarui!" : "Event baru berhasil ditambahkan!");
    } catch (error) {
      triggerNotification(error.message || "Gagal menambahkan event.");
    }
  };

  // Delete Event Handler (DELETE to API)
  const handleDeleteEvent = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus event.");
      await refreshEvents();
      triggerNotification("Event berhasil dihapus.");
    } catch (error) {
      triggerNotification(error.message || "Gagal menghapus event.");
    }
  };

  // Upload poster/banner event ke server (asli, bukan mock)
  const posterInputRef = React.useRef(null);
  const bannerInputRef = React.useRef(null);

  const handleFileUpload = (field) => {
    if (field === "poster") posterInputRef.current?.click();
    else bannerInputRef.current?.click();
  };

  const uploadFile = async (e, field) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar.");
      setEventForm((prev) => ({ ...prev, [field]: data.url }));
      triggerNotification(`Gambar ${field === "poster" ? "poster" : "banner"} berhasil diunggah!`);
    } catch (error) {
      triggerNotification(error.message || "Gagal mengunggah gambar.");
    }
  };

  // Save Category Handler (POST/PUT to API)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      triggerNotification("Nama kategori tidak boleh kosong!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const isEditing = editingCategoryId !== null;
      const res = await fetch(`${API_BASE}/api/categories${isEditing ? `/${editingCategoryId}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: categoryForm.name,
          icon: categoryForm.icon || null,
          color: categoryForm.color || null,
          description: categoryForm.description || ""
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan kategori.");

      await refreshCategories();
      setCategoryForm({ name: "", icon: "music", color: "pink", description: "" });
      setEditingCategoryId(null);
      triggerNotification(isEditing ? "Kategori berhasil diperbarui!" : "Kategori baru berhasil ditambahkan!");
    } catch (error) {
      triggerNotification(error.message || "Gagal menyimpan kategori.");
    }
  };

  // Mulai edit kategori: isi form dari data yang dipilih
  const handleEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name || "",
      icon: cat.icon || "music",
      color: cat.color || "pink",
      description: cat.description || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Category Handler (DELETE to API)
  const handleDeleteCategory = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus kategori.");
      await refreshCategories();
      triggerNotification("Kategori berhasil dihapus.");
    } catch (error) {
      triggerNotification(error.message || "Gagal menghapus kategori.");
    }
  };

  // Save Artist Handler (POST to API)
  const handleSaveArtist = async (e) => {
    e.preventDefault();
    if (!artistForm.name || !artistForm.instagram) {
      triggerNotification("Lengkapi nama artis dan instagram handle!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/artists`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: artistForm.name,
          genre: artistForm.genre || "SYNTHWAVE",
          instagram: artistForm.instagram,
          activeEvents: Number(artistForm.activeEvents) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendaftarkan artis.");

      await refreshArtists();
      setArtistForm({ name: "", genre: "SYNTHWAVE", instagram: "", activeEvents: 1 });
      setArtistSubView("grid");
      triggerNotification(`Artis "${data.name || artistForm.name}" berhasil didaftarkan!`);
    } catch (error) {
      triggerNotification(error.message || "Gagal mendaftarkan artis.");
    }
  };

  // Delete Artist Handler (DELETE to API) — konfirmasi sudah ditangani oleh modal detail
  const handleDeleteArtist = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/artists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus artis.");
      await refreshArtists();
      triggerNotification("Artis berhasil dihapus.");
    } catch (error) {
      triggerNotification(error.message || "Gagal menghapus artis.");
    }
  };

  // Verify / Reject Payment (POST to API)
  const handleVerifyPayment = async (orderId, status) => {
    if (!confirm(`Tandai pembayaran ${orderId} sebagai ${status}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/payments/${orderId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui status pembayaran.");
      await refreshPayments();
      triggerNotification(`Pembayaran ${orderId} ditandai ${status}.`);
    } catch (error) {
      triggerNotification(error.message || "Gagal memperbarui status pembayaran.");
    }
  };

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
    status: "ACTIVE",
    poster: null,
    banner: null
  });
  const [editingEventId, setEditingEventId] = useState(null);

  // Add Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "music",
    color: "pink",
    description: ""
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  // Payment status filter
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("SEMUA");
  // Artist Filter state
  const [artistGenreFilter, setArtistGenreFilter] = useState("Semua Genre");
  // Artist sort state
  const [artistSort, setArtistSort] = useState("Terbaru");
  // Event category filter state
  const [eventCategoryFilter, setEventCategoryFilter] = useState("Semua Kategori");
  // Laporan timeline filter state
  const [reportRange, setReportRange] = useState("Terakhir 30 Hari");
  // Settings toggles & preferences state
  const [adminSettings, setAdminSettings] = useState({
    emailAlerts: true,
    paymentNotif: true,
    stockNotif: true,
    language: "Bahasa Indonesia",
    currency: "IDR (Rp)"
  });

  // Fetch live data from API when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_BASE}/api/payments`, { headers })
      .then((res) => {
        if (handleAuthFailure(res)) return null;
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p, idx) => ({
            orderId: p.orderId || `#VB-${100000 + idx}`,
            user: p.user_name || "Unknown",
            avatar: (p.user_name || "U").substring(0, 2).toUpperCase(),
            event: p.event_name || `Event #${p.event_id || "?"}`,
            totalBayar: Number(p.totalBayar) || 0,
            status: p.status || "PENDING",
            ticketQty: Number(p.ticket_qty) || 1
          }));
          setPayments(mapped);
        } else {
          setPayments([]);
        }
      })
      .catch((err) => console.error("Gagal mengambil riwayat pembayaran:", err));

    fetch(`${API_BASE}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(
            data.map((e) => ({
              ...e,
              id: String(e.id),
              status: e.status || "ACTIVE",
              sold: Number(e.sold) || 0,
              quota: Number(e.quota) || 0,
              ticketPrice: Number(e.ticketPrice) || 0
            }))
          );
        }
      })
      .catch((err) => console.error("Gagal mengambil data event:", err));

    fetch(`${API_BASE}/api/artists`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArtists(
            data.map((a) => ({
              ...a,
              id: String(a.id),
              avatarIndex: a.avatarIndex != null ? Number(a.avatarIndex) : avatarIndexFor(a.id)
            }))
          );
        }
      })
      .catch((err) => console.error("Gagal mengambil data artis:", err));

    fetch(`${API_BASE}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(
            data.map((c, idx) => ({
              ...c,
              id: String(c.id),
              icon: ["music", "zap", "radio", "headphones"][idx % 4] || "music",
              color: ["pink", "teal", "purple", "peach", "green"][idx % 5] || "pink"
            }))
          );
        }
      })
      .catch((err) => console.error("Gagal mengambil data kategori:", err));

    fetch(`${API_BASE}/api/dashboard/stats`, { headers })
      .then((res) => {
        if (handleAuthFailure(res)) return null;
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.totalEvents === "number") setStats(data);
      })
      .catch((err) => console.error("Gagal mengambil statistik dashboard:", err));

    fetch(`${API_BASE}/api/dashboard/activity`, { headers })
      .then((res) => {
        if (handleAuthFailure(res)) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setActivity(data);
      })
      .catch((err) => console.error("Gagal mengambil aktivitas:", err));
  }, [isLoggedIn]);

  // Auto-refresh data (polling) tiap 10 detik agar pembayaran/statistik terupdate tanpa F5
  useEffect(() => {
    if (!isLoggedIn) return;
    const refreshAll = () => {
      refreshEvents();
      refreshArtists();
      refreshCategories();
      refreshPayments();
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      fetch(`${API_BASE}/api/dashboard/stats`, { headers })
        .then((res) => {
          if (handleAuthFailure(res)) return null;
          return res.json();
        })
        .then((data) => {
          if (data && typeof data.totalEvents === "number") setStats(data);
        })
        .catch(() => {});
      fetch(`${API_BASE}/api/dashboard/activity`, { headers })
        .then((res) => {
          if (handleAuthFailure(res)) return null;
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) setActivity(data);
        })
        .catch(() => {});
    };
    refreshAll();
    const interval = setInterval(refreshAll, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Helper trigger notification (dengan cleanup timer agar tidak saling menimpa)
  const triggerNotification = (msg) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    notificationTimer.current = setTimeout(() => {
      setShowNotification(false);
      notificationTimer.current = null;
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

  // Profil & keamanan admin (form yang BENAR-BENAR menyimpan ke API)
  const [adminProfileName, setAdminProfileName] = useState("");
  const [adminProfileEmail, setAdminProfileEmail] = useState("");
  const [adminOldPassword, setAdminOldPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");

  useEffect(() => {
    if (adminUser) {
      setAdminProfileName(adminUser.name || "");
      setAdminProfileEmail(adminUser.email || "");
    }
  }, [adminUser]);

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    if (!adminProfileName.trim() || !adminProfileEmail.trim()) {
      triggerNotification("Nama dan email wajib diisi.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: adminProfileName, email: adminProfileEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan profil.");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, name: adminProfileName, email: adminProfileEmail }));
      setAdminUser((prev) => ({ ...prev, name: adminProfileName, email: adminProfileEmail }));
      triggerNotification("Profil admin berhasil diperbarui!");
    } catch (error) {
      triggerNotification(error.message || "Gagal menyimpan profil.");
    }
  };

  const handleUpdateAdminPassword = async (e) => {
    e.preventDefault();
    if (!adminOldPassword || !adminNewPassword) {
      triggerNotification("Password lama dan baru wajib diisi.");
      return;
    }
    if (String(adminNewPassword).length < 6) {
      triggerNotification("Password baru minimal 6 karakter.");
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      triggerNotification("Konfirmasi password baru tidak cocok.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: adminOldPassword, newPassword: adminNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah password.");
      setAdminOldPassword("");
      setAdminNewPassword("");
      setAdminConfirmPassword("");
      triggerNotification("Password admin berhasil diperbarui!");
    } catch (error) {
      triggerNotification(error.message || "Gagal mengubah password.");
    }
  };

  // Dynamic Potential Revenue for Add Form
  const potentialRevenue = eventForm.ticketPrice * eventForm.quota;

  // Dynamic Dashboard Stats
  const totalEventsCount = events.length;
  const activeEventsCount = events.filter(e => e.status === "ACTIVE").length;
  const totalSoldTickets = events.reduce((sum, e) => sum + e.sold, 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.sold * e.ticketPrice), 0);

  // Helper to format currency (null-safe)
  const formatIDR = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000000000) {
      return `Rp ${(n / 1000000000).toFixed(1)}B`;
    }
    if (n >= 1000000) {
      return `Rp ${(n / 1000000).toFixed(1)}M`;
    }
    return `Rp ${n.toLocaleString("id-ID")}`;
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

  // Filtered Events by Search Query (null-safe: category/artist bisa null di DB)
  const filteredEvents = events.filter(ev => {
    const query = searchQuery.toLowerCase();
    const matchesCategory =
      eventCategoryFilter === "Semua Kategori" ||
      String(ev.category || "").toLowerCase() === String(eventCategoryFilter).toLowerCase();
    return (
      matchesCategory &&
      (
        String(ev.name || "").toLowerCase().includes(query) ||
        String(ev.artist || "").toLowerCase().includes(query) ||
        String(ev.location || "").toLowerCase().includes(query) ||
        String(ev.category || "").toLowerCase().includes(query)
      )
    );
  });

  // Filtered Artists by search, genre dropdown, and sort (null-safe)
  const filteredArtists = artists
    .filter(art => {
      const sQuery = searchQuery.toLowerCase();
      const name = String(art.name || "");
      const genre = String(art.genre || "");
      const matchesSearch = name.toLowerCase().includes(sQuery) || genre.toLowerCase().includes(sQuery);
      const matchesGenre = artistGenreFilter === "Semua Genre" || genre.toUpperCase() === artistGenreFilter.toUpperCase();
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (artistSort === "Nama A-Z") return String(a.name || "").localeCompare(String(b.name || ""));
      if (artistSort === "Event Terbanyak") return (Number(b.activeEvents) || 0) - (Number(a.activeEvents) || 0);
      return 0;
    });

  // Filtered Payments by Search Query + status
  const filteredPayments = payments.filter(pay => {
    const pQuery = searchQuery.toLowerCase();
    const matchesQuery =
      (pay.user || "").toLowerCase().includes(pQuery) ||
      (pay.orderId || "").toLowerCase().includes(pQuery) ||
      (pay.event || "").toLowerCase().includes(pQuery);
    const matchesStatus = paymentStatusFilter === "SEMUA" || pay.status === paymentStatusFilter;
    return matchesQuery && matchesStatus;
  });

  // Pagination sederhana (8 baris per halaman) — tombol pagination berfungsi sungguhan
  const ROWS_PER_PAGE = 8;
  const [eventsPage, setEventsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);

  const eventsTotalPages = Math.max(1, Math.ceil(filteredEvents.length / ROWS_PER_PAGE));
  const paymentsTotalPages = Math.max(1, Math.ceil(filteredPayments.length / ROWS_PER_PAGE));
  const categoriesTotalPages = Math.max(1, Math.ceil(categories.length / ROWS_PER_PAGE));
  const pagedEvents = filteredEvents.slice((eventsPage - 1) * ROWS_PER_PAGE, eventsPage * ROWS_PER_PAGE);
  const pagedPayments = filteredPayments.slice((paymentsPage - 1) * ROWS_PER_PAGE, paymentsPage * ROWS_PER_PAGE);
  const pagedCategories = categories.slice((categoriesPage - 1) * ROWS_PER_PAGE, categoriesPage * ROWS_PER_PAGE);

  useEffect(() => { setEventsPage(1); }, [searchQuery, eventCategoryFilter]);
  useEffect(() => { setPaymentsPage(1); }, [searchQuery, paymentStatusFilter]);
  useEffect(() => { setCategoriesPage(1); }, [categories.length]);

  // Export pembayaran ke file CSV (bisa dibuka di Excel)
  const handleExportPayments = () => {
    if (filteredPayments.length === 0) {
      triggerNotification("Tidak ada data pembayaran untuk diekspor.");
      return;
    }
    const header = ["Order ID", "Nama User", "Event", "Total Bayar", "Status", "Dibuat"];
    const rows = filteredPayments.map((p) => [
      `"${(p.orderId || "").replace(/"/g, '""')}"`,
      `"${(p.user || "").replace(/"/g, '""')}"`,
      `"${(p.event || "").replace(/"/g, '""')}"`,
      Number(p.totalBayar || 0),
      p.status || "",
      p.createdAt ? String(p.createdAt).substring(0, 10) : ""
    ]);
    const csv = [header.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pembayaran-${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    triggerNotification(`Diekspor ${filteredPayments.length} transaksi ke CSV.`);
  };

  // Dynamic values based on payments history states
  const pendingPaymentsCount = payments.filter(p => p.status === "PENDING").length;

  // Custom Artist Avatar Renderers matching the screenshots
  const renderArtistAvatar = (avatarIndex, nameStr) => {
    const initials = String(nameStr || "?").substring(0, 2).toUpperCase();
    
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
        <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-[#141419] border border-[#ff3b70]/50 text-white rounded-2xl px-5 py-4 shadow-2xl shadow-[#ff3b70]/10 flex items-center gap-3.5 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-[#ff3b70]/10 flex items-center justify-center text-[#ff3b70] shrink-0 border border-[#ff3b70]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-semibold text-xs text-white">System Alert</span>
            <span className="text-xs text-[#8b8b9a]">{notificationMsg}</span>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="text-[#8b8b9a] hover:text-white ml-2 transition-colors shrink-0"
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
                if (confirm(`Apakah Anda yakin ingin menghapus artis "${selectedArtist.name}" dari management?`)) {
                  handleDeleteArtist(selectedArtist.id);
                }
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

      {/* 1. SIDEBAR CONTAINER (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex w-[260px] bg-[#0d0d10] border-r border-[#26262f] flex-col justify-between shrink-0">
        
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
            {NAV_ITEMS.map((item) => {
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
              onClick={handleExportPayments}
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
        <div className="absolute top-0 right-[15%] w-[280px] md:w-[400px] h-[280px] md:h-[400px] bg-[#ff3b70]/[0.02] rounded-full blur-[100px] pointer-events-none" />

        {/* TOP HEADER */}
        <header className="h-[75px] border-b border-[#26262f]/45 px-4 md:px-8 flex items-center justify-between gap-3 shrink-0 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-0 max-w-[400px]">
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
            <div className="hidden sm:block h-6 w-px bg-[#26262f]" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold border border-[#26262f] hover:border-[#ff3b70]/30 hover:bg-[#ff3b70]/5 text-[#f4f4f5] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* MOBILE NAV BAR (visible on mobile only) */}
        <nav className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-3 border-b border-[#26262f]/45 bg-[#0d0d10]/80 backdrop-blur-md sticky top-[75px] z-20 shrink-0">
          {NAV_ITEMS.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === "event") setEventSubView("list");
                  if (item.id === "artis") setArtistSubView("grid");
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-[#ff3b70] to-[#ff3b70]/80 text-white shadow-[0_4px_15px_rgba(255,59,112,0.25)] border border-[#ff3b70]/30"
                    : "text-[#8b8b9a] hover:text-white hover:bg-[#181822] border border-[#26262f]"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">

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
                  { label: "Pending Approval", value: Number(stats?.pendingPayments) || 0, note: "Butuh Review", icon: Info, color: "text-amber-400 bg-amber-500/10" }
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
                      {[...events]
                        .sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0))
                        .slice(0, 2)
                        .map((ev) => {
                        const evQuota = Number(ev.quota) || 0;
                        const evSold = Number(ev.sold) || 0;
                        const occupancyPercent = evQuota > 0 ? Math.round((evSold / evQuota) * 100) : 0;
                        return (
                          <div key={ev.id} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-[#0d0d10] border border-[#26262f] flex items-center justify-center text-xs font-bold text-[#ff3b70] shrink-0">
                                  {(ev.name || "?").substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-bold text-white leading-snug truncate">{ev.name}</span>
                                  <span className="text-[11px] text-[#8b8b9a] mt-0.5 leading-none flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#ff3b70]" />
                                    {(ev.location || "").split(",")[0]}
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
                    {(activity.length === 0 ? [] : activity.map((log) => {
                      const actionMap = {
                        PURCHASE: { action: "membeli tiket", item: log.description, color: "bg-[#ff3b70]/15 text-[#ff3b70]" },
                        ARTIST_REGISTER: { action: "mendaftarkan artis", item: log.description, color: "bg-purple-500/15 text-purple-400" },
                        EVENT_APPROVED: { action: "menyetujui event", item: log.description, color: "bg-teal-500/15 text-teal-400" },
                        PAYMENT_VERIFIED: { action: "memverifikasi pembayaran", item: log.description, color: "bg-amber-500/15 text-amber-400" },
                        PAYMENT_REJECTED: { action: "membatalkan pembayaran", item: log.description, color: "bg-red-500/15 text-red-400" }
                      };
                      const act = actionMap[log.action_type] || { action: log.action_type, item: log.description, color: "bg-zinc-500/15 text-zinc-400" };
                      let time = "";
                      try {
                        const then = new Date(log.createdAt);
                        if (!isNaN(then.getTime())) {
                          time = then.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
                        }
                      } catch (err) { time = ""; }
                      return { user: log.user_name || "System", ...act, time, color: act.color };
                    })).map((act, idx) => (
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
                    {activity.length === 0 && (
                      <p className="text-xs text-[#50505f] text-center py-4">Belum ada aktivitas tercatat.</p>
                    )}
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

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="relative flex-1 min-w-[160px] sm:flex-none">
                        <select
                          value={eventCategoryFilter}
                          onChange={(e) => setEventCategoryFilter(e.target.value)}
                          className="w-full bg-[#141419] border border-[#26262f] text-xs text-white py-3 px-4.5 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer pr-10 font-semibold tracking-wide"
                        >
                          <option>Semua Kategori</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                        <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                      </div>

                      <button
                        onClick={() => { setEventSubView("add"); setEditingEventId(null); }}
                        className="flex-1 sm:flex-none py-3 px-4.5 bg-[#fecdd3] hover:bg-[#fda4af] text-[#4c0519] rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#ff3b70]/10 hover:scale-[1.01]"
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
                          {pagedEvents.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-12 text-center text-xs text-[#8b8b9a] font-semibold">
                                Tidak ada event yang cocok dengan pencarian Anda.
                              </td>
                            </tr>
                          ) : (
                            pagedEvents.map((ev) => {
                              const evQuota = Number(ev.quota) || 0;
                              const evSold = Number(ev.sold) || 0;
                              const occupancyPercent = evQuota > 0 ? Math.round((evSold / evQuota) * 100) : 0;
                              
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
                                        {(ev.name || "?").substring(0, 2).toUpperCase()}
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
                                        {(() => {
                                          try {
                                            const d = new Date(ev.date);
                                            return isNaN(d.getTime())
                                              ? (ev.date || "-")
                                              : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
                                          } catch (err) {
                                            return ev.date || "-";
                                          }
                                        })()}
                                      </span>
                                      <span className="text-[10px] text-[#ff3b70] truncate max-w-[150px] font-medium">
                                        {(ev.location || "").split(",")[0]}
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
                                        onClick={() => {
                                          setEventForm({
                                            name: ev.name,
                                            artist: ev.artist,
                                            category: ev.category,
                                            date: ev.date ? String(ev.date).substring(0, 10) : "",
                                            time: ev.time || "19:00",
                                            ticketPrice: Number(ev.ticketPrice) || 0,
                                            quota: Number(ev.quota) || 5000,
                                            location: ev.location || "",
                                            description: ev.description || "",
                                            status: ev.status || "ACTIVE",
                                            poster: ev.poster || null,
                                            banner: ev.banner || null
                                          });
                                          setEditingEventId(ev.id);
                                          setEventSubView("add");
                                        }}
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

                    <div className="p-5 border-t border-[#26262f]/60 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[#8b8b9a]">
                      <span>
                        Menampilkan {filteredEvents.length === 0 ? 0 : (eventsPage - 1) * ROWS_PER_PAGE + 1}-
                        {Math.min(eventsPage * ROWS_PER_PAGE, filteredEvents.length)} dari {filteredEvents.length} event
                      </span>
                      {eventsTotalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            disabled={eventsPage <= 1}
                            onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                            className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer disabled:opacity-30"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          {Array.from({ length: eventsTotalPages }, (_, i) => i + 1).map((pg) => (
                            <button
                              key={pg}
                              onClick={() => setEventsPage(pg)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold transition-all cursor-pointer ${
                                pg === eventsPage
                                  ? "border-[#ff3b70]/30 bg-[#ff3b70]/10 text-white"
                                  : "border border-[#26262f] bg-[#0d0d10]/40 hover:text-white"
                              }`}
                            >
                              {pg}
                            </button>
                          ))}
                          <button
                            disabled={eventsPage >= eventsTotalPages}
                            onClick={() => setEventsPage((p) => Math.min(eventsTotalPages, p + 1))}
                            className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer disabled:opacity-30"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
                        <span className="text-[10px] text-[#8b8b9a] font-semibold mt-1 block">Event berstatus aktif saat ini</span>
                      </div>
                      <CalendarDays className="w-12 h-12 text-[#26262f] absolute right-4 top-1/2 -translate-y-1/2 opacity-20 shrink-0" />
                    </div>
                  </div>
                </div>
              )}

              {eventSubView === "add" && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        {editingEventId ? "Edit Event" : "Add New Event"}
                      </h1>
                      <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                        {editingEventId ? "Perbarui detail event yang sedang berjalan." : "Launch your next massive music experience."}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => { setEventSubView("list"); setEditingEventId(null); }}
                        className="flex-1 sm:flex-none py-3 px-6 bg-transparent border border-[#26262f] hover:border-white/20 text-[#f4f4f5] rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveEvent}
                        className="flex-1 sm:flex-none py-3 px-6 rounded-xl text-white font-bold text-xs gradient-btn shadow-lg shadow-[#ff3b70]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        {editingEventId ? "Simpan Perubahan" : "Simpan Event"}
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
                          <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Status Event</label>
                          <div className="relative">
                            <select
                              className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold appearance-none cursor-pointer"
                              value={eventForm.status || "ACTIVE"}
                              onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="SOLD OUT">SOLD OUT</option>
                              <option value="CLOSED">CLOSED</option>
                              <option value="DRAFT">DRAFT</option>
                            </select>
                            <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
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
                          onClick={() => handleFileUpload("poster")}
                          className="border border-dashed border-[#ff3b70]/20 hover:border-[#ff3b70]/50 bg-[#0d0d10] rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all duration-300 min-h-[220px]"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#ff3b70]/10 flex items-center justify-center text-[#ff3b70] border border-[#ff3b70]/20">
                            <Upload className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="text-xs text-white font-bold leading-normal">
                              {eventForm.poster ? "Ganti poster (klik untuk unggah ulang)" : "Click to upload or drag & drop"}
                            </p>
                            <p className="text-[10px] text-[#8b8b9a] mt-1 leading-normal">High resolution PNG, JPG, or WebP (Max 5MB)</p>
                          </div>
                          {eventForm.poster && (
                            <img src={eventForm.poster} alt="Poster preview" className="w-full h-32 object-cover rounded-lg" />
                          )}
                          <input type="file" accept="image/*" className="hidden" ref={posterInputRef} onChange={(e) => uploadFile(e, "poster")} />
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
                          onClick={() => handleFileUpload("banner")}
                          className="border border-dashed border-[#ff3b70]/20 hover:border-[#ff3b70]/50 bg-[#0d0d10] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer transition-all duration-300 min-h-[140px]"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#ff3b70]/10 flex items-center justify-center text-[#ff3b70] border border-[#ff3b70]/20">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-white font-bold leading-normal">
                              {eventForm.banner ? "Ganti banner (klik untuk unggah ulang)" : "Upload Banner"}
                            </p>
                            <p className="text-[10px] text-[#8b8b9a] mt-1 leading-none">Recommended 1920x820px</p>
                          </div>
                          {eventForm.banner && (
                            <img src={eventForm.banner} alt="Banner preview" className="w-full h-20 object-cover rounded-lg" />
                          )}
                          <input type="file" accept="image/*" className="hidden" ref={bannerInputRef} onChange={(e) => uploadFile(e, "banner")} />
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
                      <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                        {editingCategoryId ? "Edit Kategori" : "Tambah Kategori Baru"}
                      </h3>
                      {editingCategoryId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setCategoryForm({ name: "", icon: "music", color: "pink", description: "" });
                          }}
                          className="ml-auto text-[10px] font-bold text-[#8b8b9a] hover:text-white border border-[#26262f] rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
                        >
                          Batal Edit
                        </button>
                      )}
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
                        {editingCategoryId ? "Perbarui Kategori" : "Simpan Kategori"}
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
                        {pagedCategories.map((cat) => {
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
                                    onClick={() => handleEditCategory(cat)}
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

                  <div className="p-4 border-t border-[#26262f]/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold text-[#8b8b9a]">
                    <span>
                      Showing {categories.length === 0 ? 0 : (categoriesPage - 1) * ROWS_PER_PAGE + 1}-
                      {Math.min(categoriesPage * ROWS_PER_PAGE, categories.length)} of {categories.length} categories
                    </span>
                    {categoriesTotalPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={categoriesPage <= 1}
                          onClick={() => setCategoriesPage((p) => Math.max(1, p - 1))}
                          className="p-1.5 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer disabled:opacity-30"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        {Array.from({ length: categoriesTotalPages }, (_, i) => i + 1).map((pg) => (
                          <button
                            key={pg}
                            onClick={() => setCategoriesPage(pg)}
                            className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center border font-bold transition-all cursor-pointer ${
                              pg === categoriesPage
                                ? "border-[#ff3b70]/30 bg-[#ff3b70]/10 text-white"
                                : "border-[#26262f] bg-[#0d0d10]/40 hover:text-white"
                            }`}
                          >
                            {pg}
                          </button>
                        ))}
                        <button
                          disabled={categoriesPage >= categoriesTotalPages}
                          onClick={() => setCategoriesPage((p) => Math.min(categoriesTotalPages, p + 1))}
                          className="p-1.5 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer disabled:opacity-30"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
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
                    <div className="flex flex-wrap gap-3 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8b8b9a]">Filter:</span>
                        <div className="relative">
                          <select 
                            className="bg-[#0d0d10] border border-[#26262f] text-white py-2.5 pl-4 pr-9 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer"
                            value={artistGenreFilter}
                            onChange={(e) => setArtistGenreFilter(e.target.value)}
                          >
                            <option>Semua Genre</option>
                            {[...new Set(artists.map((a) => (a.genre || "Synthwave").toUpperCase()))].map((g) => (
                              <option key={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
                            ))}
                          </select>
                          <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[#8b8b9a]">Urutkan:</span>
                        <div className="relative">
                          <select
                            value={artistSort}
                            onChange={(e) => setArtistSort(e.target.value)}
                            className="bg-[#0d0d10] border border-[#26262f] text-white py-2.5 pl-4 pr-9 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer"
                          >
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
                            <span className="text-sm font-bold text-white font-mono">
                              {(() => { const n = Number(art.activeEvents) || 0; return n < 10 ? `0${n}` : n; })()}
                            </span>
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
                    <span className="text-2xl font-extrabold text-white font-mono leading-none">
                      {(Number(stats?.totalPayments) || payments.length).toLocaleString("id-ID")}
                    </span>
                    <span className="text-[9px] text-[#8b8b9a] mt-2 font-medium">Akun terdaftar melakukan checkout</span>
                  </div>
                </div>
              </div>

              {/* Payments Table card */}
              <div className="bg-[#141419] border border-[#26262f] rounded-2xl glow-card overflow-hidden">
                
                <div className="p-6 border-b border-[#26262f]/45 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                    <CreditCard className="w-4.5 h-4.5 text-[#ff3b70]" /> Riwayat Pembayaran
                  </span>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="appearance-none w-full py-2 pl-3 pr-9 bg-[#0d0d10] border border-[#26262f] text-xs font-semibold text-[#8b8b9a] hover:text-white rounded-xl cursor-pointer transition-colors focus:outline-none focus:border-[#ff3b70]/40"
                      >
                        <option value="SEMUA">Semua Status</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                      <Search className="w-3.5 h-3.5 text-[#50505f] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button 
                      onClick={handleExportPayments}
                      className="flex-1 sm:flex-none py-2 px-3.5 bg-[#0d0d10] border border-[#26262f] text-xs font-semibold text-[#8b8b9a] hover:text-white rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors justify-center"
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
                        <th className="py-4 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#26262f]/50">
                      {pagedPayments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-xs text-[#8b8b9a] font-semibold">
                            Tidak ada transaksi pembayaran dalam daftar.
                          </td>
                        </tr>
                      ) : (
                        pagedPayments.map((pay) => {
                          let payStatusClass = "border-zinc-500/30 bg-zinc-500/5 text-zinc-400";
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
                                  <div className="w-7 h-7 rounded-full bg-[#18181f] border border-[#26262f] flex items-center justify-center text-[10px] font-bold text-indigo-400">
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

                              {/* Aksi */}
                              <td className="py-5 px-6 text-center">
                                {pay.status === "PENDING" ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleVerifyPayment(pay.orderId, "PAID")}
                                      className="py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                                      title="Tandai sudah dibayar"
                                    >
                                      <Check className="w-3 h-3" /> Verify
                                    </button>
                                    <button
                                      onClick={() => handleVerifyPayment(pay.orderId, "REJECTED")}
                                      className="py-1.5 px-3 rounded-lg bg-[#ff3b70]/10 border border-[#ff3b70]/30 text-[#ff3b70] text-[9px] font-bold hover:bg-[#ff3b70]/20 transition-all cursor-pointer flex items-center gap-1"
                                      title="Tolak pembayaran"
                                    >
                                      <X className="w-3 h-3" /> Tolak
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-[#8b8b9a] font-semibold">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-5 border-t border-[#26262f]/60 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[#8b8b9a]">
                  <span>
                    Showing {filteredPayments.length === 0 ? 0 : (paymentsPage - 1) * ROWS_PER_PAGE + 1}-
                    {Math.min(paymentsPage * ROWS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length} entries
                  </span>
                  {paymentsTotalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={paymentsPage <= 1}
                        onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))}
                        className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer disabled:opacity-30"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      {Array.from({ length: paymentsTotalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setPaymentsPage(pg)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold transition-all cursor-pointer ${
                            pg === paymentsPage
                              ? "border-[#ff3b70]/30 bg-[#ff3b70]/10 text-white"
                              : "border-[#26262f] bg-[#0d0d10]/40 hover:text-white"
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                      <button
                        disabled={paymentsPage >= paymentsTotalPages}
                        onClick={() => setPaymentsPage((p) => Math.min(paymentsTotalPages, p + 1))}
                        className="p-2 rounded-lg border border-[#26262f] bg-[#0d0d10]/40 hover:text-white transition-all cursor-pointer disabled:opacity-30"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ==================== F. REPORTS VIEW (NEWLY ADDED PAGE) ==================== */}
          {/* ==================== F. LAPORAN VIEW (DATA NYATA) ==================== */}
          {(() => {
            // Data laporan dihitung dari events & payments yang sudah dimuat (bukan mock)
            // Filter sesuai rentang waktu terpilih
            const rangeDays = reportRange === "Terakhir 7 Hari" ? 7 : reportRange === "Terakhir 90 Hari" ? 90 : 30;
            const rangeCutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;
            const reportEvents = events
              .filter((e) => e.status !== "DRAFT")
              .filter((e) => {
                if (!e.date) return true;
                const d = new Date(e.date);
                return isNaN(d.getTime()) ? true : d.getTime() >= rangeCutoff;
              })
              .map((e) => ({
                name: e.name,
                sold: `${Number(e.sold) || 0} / ${Number(e.quota) || 0}`,
                soldPct: Number(e.quota) ? Math.min(100, Math.round(((Number(e.sold) || 0) / Number(e.quota)) * 100)) : 0,
                avg: Number(e.ticketPrice) || 0,
                revenue: (Number(e.sold) || 0) * (Number(e.ticketPrice) || 0)
              }))
              .sort((a, b) => b.revenue - a.revenue);
            const topSales = reportEvents.filter((e) => e.soldPct > 0).slice(0, 6);

            const genreCounts = {};
            events.forEach((e) => {
              if (e.status === "DRAFT") return;
              const g = String(e.category || "Lainnya").trim() || "Lainnya";
              genreCounts[g] = (genreCounts[g] || 0) + 1;
            });
            const genreEntries = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
            const totalGenres = genreEntries.reduce((s, [, c]) => s + c, 0) || 1;
            const GENRE_COLORS = ["#ff3b70", "#8b5cf6", "#06b6d4", "#fb923c", "#d946ef", "#10b981", "#f59e0b"];
            const genreSegments = genreEntries.map(([name, count], i) => ({
              name,
              count,
              pct: Math.round((count / totalGenres) * 100),
              color: GENRE_COLORS[i % GENRE_COLORS.length]
            }));
            const circumference = 2 * Math.PI * 50;
            let accOffset = 0;
            const donutCircles = genreSegments.map((seg, i) => {
              const dash = (seg.count / totalGenres) * circumference;
              const circle = (
                <circle
                  key={i} cx="75" cy="75" r="50" fill="transparent" stroke={seg.color} strokeWidth="16"
                  strokeDasharray={`${dash} ${circumference}`} strokeDashoffset={-accOffset}
                  className="transition-all duration-300 cursor-pointer hover:stroke-width-[18]"
                  onMouseEnter={() => setHoveredDonutSegment(`${seg.name} (${seg.pct}%)`)}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                />
              );
              accOffset += dash;
              return circle;
            });

            return (
            <div className="flex flex-col gap-8 animate-fade-in">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">Laporan Penjualan</h1>
                  <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">Analisis data transaksi dan performa penjualan tiket.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Select timeline */}
                  <div className="relative">
                    <select
                      value={reportRange}
                      onChange={(e) => setReportRange(e.target.value)}
                      className="bg-[#141419] border border-[#26262f] text-xs text-white py-3 pl-4 pr-10 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer font-semibold tracking-wide"
                    >
                      <option>Terakhir 30 Hari</option>
                      <option>Terakhir 7 Hari</option>
                      <option>Terakhir 90 Hari</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#8b8b9a] absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                  {/* Export button */}
                  <button 
                    onClick={handleExportPayments}
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
                          {reportEvents.length === 0 && (
                            <tr><td colSpan="4" className="py-6 text-center text-[#50505f]">Belum ada data event.</td></tr>
                          )}
                          {reportEvents.map((row, index) => (
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
                        {donutCircles.length === 0 && (
                          <circle cx="75" cy="75" r="50" fill="none" stroke="#26262f" strokeWidth="16" />
                        )}
                        {donutCircles}
                      </svg>

                      {/* Donut Center Label */}
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-extrabold text-white leading-none">{totalGenres}</span>
                        <span className="text-[9px] text-[#8b8b9a] font-bold tracking-wider uppercase mt-1">Kategori</span>
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
                      {genreSegments.length === 0 && (
                        <span className="text-[#50505f]">Belum ada kategori.</span>
                      )}
                      {genreSegments.map((seg, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: seg.color }} />
                          <span>{seg.name} ({seg.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Card - Ticket Sales Progress */}
              <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                <h3 className="text-base font-semibold text-white tracking-wide mb-6">Ticket Sales Progress</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {topSales.length === 0 && (
                    <p className="text-xs text-[#50505f] md:col-span-2">Belum ada penjualan tiket.</p>
                  )}
                  {topSales.map((bar, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-semibold leading-none">
                        <span className="text-[#8b8b9a]">{bar.name}</span>
                        <span className="text-white font-mono font-bold">{bar.soldPct}% Sold</span>
                      </div>
                      {/* Meter bar */}
                      <div className="w-full h-2 bg-[#09090b] rounded-full overflow-hidden border border-[#26262f]/35">
                        <div 
                          className="h-full bg-gradient-to-r from-[#ff3b70] to-[#8b5cf6] rounded-full transition-all duration-500"
                          style={{ width: `${bar.soldPct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}

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
                      onSubmit={handleSaveAdminProfile}
                      className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Nama Lengkap</label>
                        <input
                          type="text"
                          value={adminProfileName}
                          onChange={(e) => setAdminProfileName(e.target.value)}
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Email</label>
                        <input
                          type="email"
                          value={adminProfileEmail}
                          onChange={(e) => setAdminProfileEmail(e.target.value)}
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
                      onSubmit={handleUpdateAdminPassword}
                      className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Password Lama</label>
                        <input
                          type="password"
                          value={adminOldPassword}
                          onChange={(e) => setAdminOldPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Password Baru</label>
                        <input
                          type="password"
                          value={adminNewPassword}
                          onChange={(e) => setAdminNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#18181f] border border-[#26262f] rounded-xl px-4 py-3 text-xs text-white placeholder-[#50505f] focus:outline-none focus:border-[#ff3b70]/40 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-wider text-[#8b8b9a] font-bold uppercase">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          value={adminConfirmPassword}
                          onChange={(e) => setAdminConfirmPassword(e.target.value)}
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Pengaturan</h1>
                  <p className="text-xs text-[#8b8b9a] mt-1.5 font-medium">
                    Kelola preferensi konsol admin dan notifikasi sistem.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d0d10] border border-[#26262f] text-[#8b8b9a] hover:text-white hover:border-[#ff3b70]/40 transition-all text-xs font-bold cursor-pointer shrink-0 mt-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Kembali</span>
                </button>
              </div>

              <div className="bg-[#141419] border border-[#26262f] rounded-2xl p-6 glow-card">
                <div className="flex items-center gap-2 mb-6 border-b border-[#26262f]/40 pb-4">
                  <Bell className="w-4.5 h-4.5 text-[#ff3b70]" />
                  <h3 className="text-sm font-bold tracking-wider text-white uppercase">Notifikasi</h3>
                </div>

                <div className="flex flex-col gap-5">
                  {[
                    { key: "emailAlerts", label: "Email Alerts", desc: "Terima ringkasan laporan penjualan harian." },
                    { key: "paymentNotif", label: "Notifikasi Pembayaran", desc: "Diberitahu saat ada transaksi baru menunggu verifikasi." },
                    { key: "stockNotif", label: "Peringatan Stok Tiket", desc: "Diberitahu saat okupansi tiket mencapai 80%." }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block">{item.label}</span>
                        <span className="text-[10px] text-[#8b8b9a] mt-0.5 block">{item.desc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdminSettings((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          adminSettings[item.key] ? "bg-[#ff3b70]" : "bg-[#26262f]"
                        }`}
                        aria-pressed={adminSettings[item.key]}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          adminSettings[item.key] ? "translate-x-4" : "translate-x-0"
                        }`} />
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block">Bahasa Tampilan</span>
                      <span className="text-[10px] text-[#8b8b9a] mt-0.5 block">Pilih bahasa untuk antarmuka konsol.</span>
                    </div>
                    <div className="relative shrink-0 w-full sm:w-auto">
                      <select
                        value={adminSettings.language}
                        onChange={(e) => setAdminSettings((prev) => ({ ...prev, language: e.target.value }))}
                        className="w-full sm:w-auto bg-[#18181f] border border-[#26262f] text-white text-xs py-2.5 pl-4 pr-9 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer"
                      >
                        <option>Bahasa Indonesia</option>
                        <option>English</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8b8b9a] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block">Mata Uang</span>
                      <span className="text-[10px] text-[#8b8b9a] mt-0.5 block">Format nominal pada laporan keuangan.</span>
                    </div>
                    <div className="relative shrink-0 w-full sm:w-auto">
                      <select
                        value={adminSettings.currency}
                        onChange={(e) => setAdminSettings((prev) => ({ ...prev, currency: e.target.value }))}
                        className="w-full sm:w-auto bg-[#18181f] border border-[#26262f] text-white text-xs py-2.5 pl-4 pr-9 rounded-xl outline-none focus:border-[#ff3b70]/40 appearance-none cursor-pointer"
                      >
                        <option>IDR (Rp)</option>
                        <option>USD ($)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8b8b9a] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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

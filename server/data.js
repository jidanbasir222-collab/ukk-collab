// In-memory data store for the Electric Pulse console

let categories = [
  { id: "1", name: "Pop", description: "Mainstream melodies, catchy hooks, and clean production.", count: 24, icon: "music", color: "pink" },
  { id: "2", name: "Rock", description: "Powerful guitars, driving drums, and energetic vocals.", count: 15, icon: "zap", color: "teal" },
  { id: "3", name: "Jazz", description: "Improvisational rhythms, brass solos, and smooth club vibes.", count: 8, icon: "radio", color: "purple" },
  { id: "4", name: "Indie", description: "Independent production, unique lyricism, and alternative tunes.", count: 12, icon: "headphones", color: "peach" },
  { id: "5", name: "Festival", description: "Multi-artist outdoor concerts and massive experiences.", count: 5, icon: "music", color: "green" }
];

let events = [
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
];

let artists = [
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
];

let payments = [
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

let verifiedRevenueToday = 45200000;

module.exports = {
  // GETTERS
  getCategories: () => categories,
  getEvents: () => events,
  getArtists: () => artists,
  getPayments: () => payments,
  getVerifiedRevenueToday: () => verifiedRevenueToday,

  // MUTATORS
  addEvent: (ev) => {
    events.unshift(ev);
    return ev;
  },
  deleteEvent: (id) => {
    events = events.filter(e => e.id !== id);
    return true;
  },

  addCategory: (cat) => {
    categories.push(cat);
    return cat;
  },
  deleteCategory: (id) => {
    categories = categories.filter(c => c.id !== id);
    return true;
  },

  addArtist: (art) => {
    artists.push(art);
    return art;
  },
  deleteArtist: (id) => {
    artists = artists.filter(a => a.id !== id);
    return true;
  },

  updatePaymentStatus: (orderId, newStatus) => {
    const payment = payments.find(p => p.orderId === orderId);
    if (!payment) return null;

    // Check transition to PAID to update stats
    if (payment.status !== "PAID" && newStatus === "PAID") {
      verifiedRevenueToday += payment.totalBayar;
    }

    payment.status = newStatus;
    return payment;
  }
};

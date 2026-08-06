import Link from "next/link";

const features = [
  {
    title: "Smart Ticketing",
    description: "Full-stack ticketing with dynamic pricing, checkout, and digital access.",
    icon: "🎟️"
  },
  {
    title: "Artist Management",
    description: "Organize lineups, roster details, and performance schedules with ease.",
    icon: "🎤"
  },
  {
    title: "Real-time Analytics",
    description: "Track attendance, sales, and event momentum in one dashboard.",
    icon: "📈"
  }
];

const events = [
  {
    name: "Neon Night Tour 2024",
    date: "15 Nov 2024",
    venue: "GBK Stadium",
    category: "Live Concert"
  },
  {
    name: "Thunderous Echoes",
    date: "22 Nov 2024",
    venue: "The Warehouse Arena",
    category: "Rock Night"
  },
  {
    name: "Electric Pulse Fest",
    date: "05 Des 2024",
    venue: "Beach Club Bali",
    category: "Festival"
  },
  {
    name: "Midnight Jazz",
    date: "30 Oct 2024",
    venue: "Sky Lounge Jakarta",
    category: "Jazz Session"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05050d] text-white overflow-x-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,59,112,0.18),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.16),_transparent_20%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.55),_rgba(0,0,0,0.9))]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff3b70] to-[#8b5cf6] flex items-center justify-center text-sm font-bold shadow-lg shadow-[#ff3b70]/20">
              EP
            </div>
            <div>
              <p className="text-sm font-semibold">Electric Pulse</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-[#c7c7d4] md:flex">
            <a href="#home" className="hover:text-white transition">Home</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#events" className="hover:text-white transition">Events</a>
            <a href="#support" className="hover:text-white transition">Support</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-[#ffffff26] bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/15">
              Login
            </Link>
            <Link href="/register" className="rounded-full bg-[#ff3b70] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff3b70]/20 transition hover:bg-[#ff5c8a]">
              Register
            </Link>
          </div>
        </header>

        <section id="home" className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:px-10 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[0.95fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.4em] text-[#8b8b9a]">Electric Pulse</p>
                <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white sm:text-6xl">
                  Experience the Pulse of Future Events
                </h1>
                <p className="mt-6 text-base leading-8 text-[#c7c7d4] sm:text-lg">
                  The ultimate platform for ticketing, artist management, and real-time event analytics. Step into the future of entertainment.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-[#ff3b70] px-8 py-4 text-sm font-semibold text-white shadow-[0_20px_80px_rgba(255,59,112,0.25)] transition hover:bg-[#ff5c8a]">
                  Jelajahi Event ➜
                </Link>
                <div className="text-sm text-[#8b8b9a]">
                  Everything you need to manage live experiences, from discovery to checkout.
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111019]/90 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,59,112,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.14),_transparent_28%)]" />
              <div className="relative grid gap-4 sm:grid-cols-2">
                {events.slice(0, 4).map((item) => (
                  <div key={item.name} className="rounded-[1.5rem] border border-white/10 bg-[#0b0b12]/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition hover:scale-[1.01]">
                    <div className="mb-4 h-36 rounded-3xl bg-gradient-to-br from-[#ff3b70]/20 via-[#8b5cf6]/10 to-[#0d0d12]" />
                    <div className="space-y-3">
                      <p className="text-sm uppercase tracking-[0.3em] text-[#8b8b9a]">{item.category}</p>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-[#9ca3af]">{item.date} · {item.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:px-10">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#ff3b70]">Platform Features</p>
          <h2 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">Powerful tools for every live experience.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#9ca3af]">
            Everything you need to manage and grow your event brand, all in one secure platform.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[2rem] border border-white/10 bg-[#0d0d14]/90 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.18)] hover:border-[#ff3b70]/20 transition">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[#111019] text-2xl shadow-lg shadow-[#ff3b70]/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#9ca3af]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="events" className="mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#ff3b70]">Popular Events</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Trending experiences you can’t miss.</h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-[#ff3b70] hover:text-[#ffa3c9] transition">
            View all →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {events.slice(0, 4).map((item) => (
            <div key={item.name} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f18]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-[#ff3b70]/20">
              <div className="mb-5 h-44 rounded-[1.75rem] bg-cover bg-center bg-[linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.8)),url('https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=800&q=80')]" />
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.32em] text-[#8b8b9a]">
                  <span>{item.date}</span>
                  <span>{item.category}</span>
                </div>
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-[#9ca3af]">{item.venue}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="support" className="mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#0d0d14]/90 p-10 shadow-[0_25px_80px_rgba(0,0,0,0.22)]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#ff3b70]">Need Help?</p>
            <h3 className="mt-4 text-3xl font-extrabold text-white">Support that keeps your events moving.</h3>
            <p className="mt-4 text-base leading-8 text-[#9ca3af]">
              Our support team is ready to help with setup, billing, and live event operations whenever you need it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/support" className="inline-flex items-center justify-center rounded-full bg-[#ff3b70] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff3b70]/20 transition hover:bg-[#ff5c8a]">
                Hubungi Support
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#0d0d14]/90 p-10 shadow-[0_25px_80px_rgba(0,0,0,0.22)]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#8b8b9a]">Need an answer?</p>
            <h3 className="mt-4 text-3xl font-extrabold text-white">Frequently asked questions.</h3>
            <div className="mt-8 space-y-4 text-sm text-[#c7c7d4]">
              <div className="rounded-3xl border border-white/10 bg-[#111019] p-5">How do I create an event?</div>
              <div className="rounded-3xl border border-white/10 bg-[#111019] p-5">Can I manage tickets and artists in one place?</div>
              <div className="rounded-3xl border border-white/10 bg-[#111019] p-5">What payment methods are supported?</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#05050d]/90 px-6 py-8 text-[#8b8b9a] sm:px-10">
        <div className="mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-6xl">
          <p className="text-sm">© 2026 Electric Pulse. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Contact Us</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

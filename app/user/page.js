"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.replace("/");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] px-4 py-20 text-white">
      <div className="max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#8b8b9a] mb-3">User Dashboard</p>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Halo, {user?.name || user?.email || "Pengguna"}!</h1>
        <p className="text-sm text-[#c7c7d4] mb-10">
          Selamat datang di halaman user. Di sini kamu bisa melihat event, tiket, dan informasi akun.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/"
            className="rounded-2xl border border-[#26262f] bg-[#141419] px-6 py-4 text-sm text-white hover:border-[#ff3b70]/40 hover:bg-[#1f1f2c] transition"
          >
            Kembali ke Landing
          </Link>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="rounded-2xl border border-[#ff3b70] bg-[#ff3b70]/10 px-6 py-4 text-sm text-[#ff3b70] hover:bg-[#ff3b70]/20 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

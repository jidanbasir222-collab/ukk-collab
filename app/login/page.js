"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginBox from "../../components/LoginBox";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 py-16">
          <p className="text-sm font-semibold text-white">Memuat halaman login...</p>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ideal-wonder-production-445e.up.railway.app";

  // Cegah open redirect: hanya izinkan path internal (mis. /user, /admin/...)
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    if (!email || !password) {
      setAuthError("Email dan password wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || data.message || "Login gagal.");
        return;
      }
      if (!data || !data.token || !data.user) {
        setAuthError("Respons login tidak valid. Hubungi administrator.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (String(data.user.role).toLowerCase().includes("admin")) {
        router.push("/admin");
      } else if (safeNext) {
        router.push(safeNext);
      } else {
        router.push("/user");
      }
    } catch (error) {
      console.error(error);
      setAuthError("Terjadi kesalahan jaringan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8b8b9a] mb-3">Electric Pulse</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Masuk ke Akun Anda</h1>
          <p className="mt-3 text-sm text-[#c7c7d4]">
            Login disini agar sistem dapat mengarahkan admin ke dashboard admin dan user ke halaman pengguna.
          </p>
        </div>

        <LoginBox
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          authError={authError}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loading={loading}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
        />
      </div>
    </main>
  );
}

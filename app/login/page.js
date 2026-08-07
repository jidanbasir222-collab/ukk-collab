"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginBox from "../../components/LoginBox";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || data.message || "Login gagal.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (String(data.user.role).toLowerCase().includes("admin")) {
        router.push("/admin");
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
        />
      </div>
    </main>
  );
}

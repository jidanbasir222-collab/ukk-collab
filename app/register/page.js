"use client";
import RegisterBox from "../../components/RegisterBox";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-2xl mt-24">
        <h2 className="text-2xl text-white font-bold mb-6 text-center">Buat Akun Baru</h2>
        <div className="flex justify-center">
          <RegisterBox />
        </div>
      </div>
    </main>
  );
}

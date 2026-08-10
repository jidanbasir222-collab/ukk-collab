export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#09090b] text-[#f4f4f5] font-sans">
      <div className="w-12 h-12 rounded-full border-2 border-[#26262f] border-t-[#ff3b70] animate-spin" />
      <p className="text-xs font-bold text-[#8b8b9a] font-mono">Memuat halaman...</p>
    </main>
  );
}

export const COLORS = {
  bg: "#09090b",
  surface: "#141419",
  surface2: "#18181f",
  border: "#26262f",
  text: "#f4f4f5",
  textMuted: "#8b8b9a",
  accent: "#ff3b70",
  accent2: "#8b5cf6",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  cyan: "#22d3ee"
};

export const formatIDR = (num) => "Rp " + Number(num || 0).toLocaleString("id-ID");

export const formatDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

export const formatTimeLeft = (seconds) => {
  const s = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

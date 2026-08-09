import Constants from "expo-constants";

// Deteksi IP LAN komputer dev dari Expo Go (mode LAN, bukan tunnel).
// Fallback: localhost (untuk web/emulator) atau EXPO_PUBLIC_API_URL eksplisit.
const isLanIp = (host) => {
  if (!host) return false;
  return (
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
};

const getApiBase = () => {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit;

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (isLanIp(host)) {
      return `http://${host}:5000`;
    }
  }
  return "http://localhost:5000";
};

export const API_BASE = getApiBase();

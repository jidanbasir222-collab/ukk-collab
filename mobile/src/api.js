import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";

const getToken = async () => AsyncStorage.getItem("token");

export const getStoredUser = async () => {
  try {
    const raw = await AsyncStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const headers = async (json = true) => {
  const token = await getToken();
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const handle = async (res) => {
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || "Terjadi kesalahan pada server.";
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
};

export const api = {
  async get(path, auth = false) {
    const res = await fetch(`${API_BASE}${path}`, { headers: await headers(false) });
    return handle(res);
  },
  async post(path, body, auth = false) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify(body)
    });
    return handle(res);
  },
  async put(path, body, auth = false) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: await headers(),
      body: JSON.stringify(body)
    });
    return handle(res);
  },
  async del(path) {
    const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers: await headers() });
    return handle(res);
  }
};

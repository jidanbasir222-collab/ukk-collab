import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { COLORS, formatIDR, formatDate } from "../../theme";

const EMPTY_FORM = {
  name: "", artist: "", category: "", date: "", time: "19:00", location: "",
  ticketPrice: "", quota: "5000", status: "ACTIVE", description: ""
};

const STATUSES = ["ACTIVE", "SOLD OUT", "CLOSED", "DRAFT"];

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get("/api/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      name: ev.name || "",
      artist: ev.artist || "",
      category: ev.category || "",
      date: ev.date || "",
      time: ev.time || "19:00",
      location: ev.location || "",
      ticketPrice: String(ev.ticketPrice || ""),
      quota: String(ev.quota || ""),
      status: ev.status || "ACTIVE",
      description: ev.description || ""
    });
  };

  const save = async () => {
    if (!form.name || !form.artist || !form.category || !form.date || !form.location) {
      Alert.alert("Gagal", "Field utama (nama, artis, kategori, tanggal, lokasi) wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        ticketPrice: Number(form.ticketPrice) || 0,
        quota: Number(form.quota) || 5000
      };
      if (editingId) {
        await api.put(`/api/events/${editingId}`, payload, true);
      } else {
        await api.post("/api/events", payload, true);
      }
      setForm(null);
      load();
      Alert.alert("Berhasil", editingId ? "Event diperbarui." : "Event ditambahkan.");
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = (id, name) => {
    Alert.alert("Hapus Event", `Hapus event "${name}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del(`/api/events/${id}`, true);
            load();
          } catch (e) {
            Alert.alert("Gagal", e.message);
          }
        }
      }
    ]);
  };

  if (form) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Text style={styles.formTitle}>{editingId ? "Edit Event" : "Tambah Event"}</Text>
        {[
          { key: "name", label: "Nama Event", placeholder: "Nama event" },
          { key: "artist", label: "Artis", placeholder: "Nama artis" },
          { key: "category", label: "Kategori", placeholder: "cth: Pop, Rock" },
          { key: "date", label: "Tanggal (YYYY-MM-DD)", placeholder: "2026-12-05" },
          { key: "time", label: "Jam (HH:MM)", placeholder: "19:00" },
          { key: "location", label: "Lokasi", placeholder: "Nama venue" }
        ].map((f) => (
          <View key={f.key}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput style={styles.input} value={form[f.key]} onChangeText={(v) => setForm({ ...form, [f.key]: v })} placeholder={f.placeholder} placeholderTextColor={COLORS.textMuted} />
          </View>
        ))}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Harga Tiket</Text>
            <TextInput style={styles.input} value={form.ticketPrice} onChangeText={(v) => setForm({ ...form, ticketPrice: v })} keyboardType="numeric" placeholder="350000" placeholderTextColor={COLORS.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Kuota</Text>
            <TextInput style={styles.input} value={form.quota} onChangeText={(v) => setForm({ ...form, quota: v })} keyboardType="numeric" placeholder="5000" placeholderTextColor={COLORS.textMuted} />
          </View>
        </View>
        <Text style={styles.label}>Status</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setForm({ ...form, status: s })}
              style={[styles.chip, form.status === s && styles.chipActive]}
            >
              <Text style={{ color: form.status === s ? "#fff" : COLORS.textMuted, fontSize: 11, fontWeight: "700" }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Deskripsi</Text>
        <TextInput style={[styles.input, { height: 90, textAlignVertical: "top" }]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Deskripsi event" placeholderTextColor={COLORS.textMuted} multiline />

        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: COLORS.border }]} onPress={() => setForm(null)}>
            <Text style={{ color: COLORS.text, fontWeight: "800", fontSize: 13 }}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: COLORS.accent }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Simpan</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>+ Tambah Event</Text>
      </TouchableOpacity>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 10 }}
        data={events}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={{ color: COLORS.textMuted, textAlign: "center", marginTop: 40 }}>Belum ada event.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.chipText, { color: item.status === "ACTIVE" ? COLORS.cyan : COLORS.textMuted }]}>{item.status}</Text>
            </View>
            <Text style={styles.meta}>{item.artist} • {item.category}</Text>
            <Text style={styles.meta}>{formatDate(item.date)} • {item.location}</Text>
            <Text style={styles.meta}>
              Terjual {Number(item.sold || 0).toLocaleString("id-ID")}/{Number(item.quota || 0).toLocaleString("id-ID")} • {formatIDR(item.ticketPrice)}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: COLORS.accent }]} onPress={() => openEdit(item)}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: COLORS.danger }]} onPress={() => remove(item.id, item.name)}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = {
  addBtn: {
    backgroundColor: COLORS.accent,
    margin: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center"
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 3
  },
  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: "800", flex: 1 },
  chipText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  meta: { color: COLORS.textMuted, fontSize: 11 },
  smallBtn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  formTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800", marginBottom: 4 },
  label: { color: COLORS.textMuted, fontSize: 11, fontWeight: "700", marginTop: 8, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 },
  input: {
    backgroundColor: COLORS.surface2,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 13
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" }
};

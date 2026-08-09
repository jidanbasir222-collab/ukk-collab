import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { COLORS } from "../../theme";

const EMPTY_FORM = { name: "", genre: "SYNTHWAVE", instagram: "", activeEvents: "0" };

export default function ArtistsScreen() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get("/api/artists");
      setArtists(Array.isArray(data) ? data : []);
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

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      name: a.name || "",
      genre: a.genre || "SYNTHWAVE",
      instagram: a.instagram || "",
      activeEvents: String(a.activeEvents || "0")
    });
  };

  const save = async () => {
    if (!form.name || !form.instagram) {
      Alert.alert("Gagal", "Nama dan Instagram artis wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, activeEvents: Number(form.activeEvents) || 0 };
      if (editingId) {
        await api.put(`/api/artists/${editingId}`, payload, true);
      } else {
        await api.post("/api/artists", payload, true);
      }
      setForm(null);
      load();
      Alert.alert("Berhasil", editingId ? "Artis diperbarui." : "Artis didaftarkan.");
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = (id, name) => {
    Alert.alert("Hapus Artis", `Hapus artis "${name}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del(`/api/artists/${id}`, true);
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
        <Text style={styles.formTitle}>{editingId ? "Edit Artis" : "Daftarkan Artis"}</Text>
        <Text style={styles.label}>Nama</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Nama artis" placeholderTextColor={COLORS.textMuted} />
        <Text style={styles.label}>Genre</Text>
        <TextInput style={styles.input} value={form.genre} onChangeText={(v) => setForm({ ...form, genre: v })} placeholder="SYNTHWAVE" placeholderTextColor={COLORS.textMuted} autoCapitalize="characters" />
        <Text style={styles.label}>Instagram</Text>
        <TextInput style={styles.input} value={form.instagram} onChangeText={(v) => setForm({ ...form, instagram: v })} placeholder="@handle" placeholderTextColor={COLORS.textMuted} />
        <Text style={styles.label}>Event Aktif</Text>
        <TextInput style={styles.input} value={form.activeEvents} onChangeText={(v) => setForm({ ...form, activeEvents: v })} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />

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
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>+ Daftarkan Artis</Text>
      </TouchableOpacity>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 10 }}
        data={artists}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={{ color: COLORS.textMuted, textAlign: "center", marginTop: 40 }}>Belum ada artis.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>{(item.name || "?").substring(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.meta}>{item.genre} • {item.instagram}</Text>
              <Text style={styles.meta}>Event aktif: {Number(item.activeEvents || 0)}</Text>
            </View>
            <View style={{ gap: 6 }}>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: COLORS.accent }]} onPress={() => openEdit(item)}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: COLORS.danger }]} onPress={() => remove(item.id, item.name)}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = {
  addBtn: { backgroundColor: COLORS.accent, margin: 16, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent2,
    alignItems: "center",
    justifyContent: "center"
  },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  meta: { color: COLORS.textMuted, fontSize: 11 },
  smallBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
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
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" }
};

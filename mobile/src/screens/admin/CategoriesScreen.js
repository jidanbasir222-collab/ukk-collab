import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { COLORS } from "../../theme";

const EMPTY_FORM = { name: "", description: "", icon: "music", color: "pink" };
const ICONS = ["music", "zap", "radio", "headphones"];
const COLORS_OPT = ["pink", "teal", "purple", "peach", "green"];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get("/api/categories");
      setCategories(Array.isArray(data) ? data : []);
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

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      description: c.description || "",
      icon: c.icon || "music",
      color: c.color || "pink"
    });
  };

  const save = async () => {
    if (!form.name) {
      Alert.alert("Gagal", "Nama kategori wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/categories/${editingId}`, form, true);
      } else {
        await api.post("/api/categories", form, true);
      }
      setForm(null);
      load();
      Alert.alert("Berhasil", editingId ? "Kategori diperbarui." : "Kategori ditambahkan.");
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = (id, name) => {
    Alert.alert("Hapus Kategori", `Hapus kategori "${name}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del(`/api/categories/${id}`, true);
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
        <Text style={styles.formTitle}>{editingId ? "Edit Kategori" : "Tambah Kategori"}</Text>
        <Text style={styles.label}>Nama</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="cth: Pop" placeholderTextColor={COLORS.textMuted} />
        <Text style={styles.label}>Deskripsi</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: "top" }]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Deskripsi kategori" placeholderTextColor={COLORS.textMuted} multiline />
        <Text style={styles.label}>Icon</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {ICONS.map((i) => (
            <TouchableOpacity key={i} onPress={() => setForm({ ...form, icon: i })} style={[styles.chip, form.icon === i && styles.chipActive]}>
              <Text style={{ color: form.icon === i ? "#fff" : COLORS.textMuted, fontSize: 11, fontWeight: "700" }}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Warna</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {COLORS_OPT.map((c) => (
            <TouchableOpacity key={c} onPress={() => setForm({ ...form, color: c })} style={[styles.chip, form.color === c && styles.chipActive]}>
              <Text style={{ color: form.color === c ? "#fff" : COLORS.textMuted, fontSize: 11, fontWeight: "700" }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>+ Tambah Kategori</Text>
      </TouchableOpacity>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 10 }}
        data={categories}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={{ color: COLORS.textMuted, textAlign: "center", marginTop: 40 }}>Belum ada kategori.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>{(item.name || "?").substring(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={2}>{item.description || "No description provided."}</Text>
              <Text style={styles.meta}>icon: {item.icon} • color: {item.color}</Text>
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
  chip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" }
};

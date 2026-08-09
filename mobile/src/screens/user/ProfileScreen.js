import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "../../AuthContext";
import { api } from "../../api";
import { API_BASE } from "../../config";
import { COLORS } from "../../theme";

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const saveProfile = async () => {
    if (!name) {
      Alert.alert("Gagal", "Nama tidak boleh kosong.");
      return;
    }
    setSaving(true);
    try {
      const data = await api.put("/api/profile", { name, phone }, true);
      const storedUser = { ...user, ...(data.user || { name, phone }) };
      setUser(storedUser);
      Alert.alert("Berhasil", "Profil berhasil diperbarui.");
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Gagal", "Password lama dan baru wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Gagal", "Password baru minimal 6 karakter.");
      return;
    }
    setChanging(true);
    try {
      await api.put("/api/profile/password", { currentPassword, newPassword }, true);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Berhasil", "Password berhasil diperbarui.");
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setChanging(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={styles.panel}>
        <View style={styles.avatar}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
            {(user?.name || "U").substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "800", textAlign: "center" }}>{user?.name}</Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 12, textAlign: "center" }}>{user?.email}</Text>
        <Text style={[styles.role, { color: String(user?.role || "").includes("admin") ? COLORS.accent : COLORS.cyan }]}>
          {String(user?.role || "").toUpperCase()}
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 10, textAlign: "center", marginTop: 6 }}>
          Server: {API_BASE}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Informasi Profil</Text>
        <Text style={styles.label}>Nama</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={COLORS.textMuted} />
        <Text style={styles.label}>No. Telepon</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="08xxxxxxxxxx" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" />
        <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Simpan Profil</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Ganti Password</Text>
        <Text style={styles.label}>Password Lama</Text>
        <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholderTextColor={COLORS.textMuted} />
        <Text style={styles.label}>Password Baru</Text>
        <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Minimal 6 karakter" placeholderTextColor={COLORS.textMuted} />
        <TouchableOpacity style={styles.button} onPress={changePassword} disabled={changing}>
          {changing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ubah Password</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = {
  panel: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6
  },
  panelTitle: { color: COLORS.text, fontSize: 14, fontWeight: "800", marginBottom: 4 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8
  },
  role: { fontSize: 10, fontWeight: "800", letterSpacing: 2, textAlign: "center", marginTop: 4 },
  label: { color: COLORS.textMuted, fontSize: 11, fontWeight: "700", marginTop: 8, textTransform: "uppercase", letterSpacing: 1 },
  input: {
    backgroundColor: COLORS.surface2,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 13,
    marginTop: 4
  },
  button: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 14 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  logout: { backgroundColor: COLORS.danger, borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 6 }
};

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../AuthContext";
import { COLORS } from "../theme";

export default function RegisterScreen({ navigation }) {
  const { register, sendOtp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Gagal", "Nama, email, dan password wajib diisi terlebih dahulu.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Gagal", "Password minimal 6 karakter.");
      return;
    }
    setSending(true);
    try {
      const data = await sendOtp(email, "register");
      setOtpSent(true);
      if (data.devMode && data.devOtp) {
        setDevOtp(data.devOtp);
        Alert.alert("Mode Demo", `SMTP belum dikonfigurasi. Kode OTP Anda: ${data.devOtp}`);
      } else {
        Alert.alert("OTP Terkirim", data.message || "Kode OTP telah dikirim ke email Anda.");
      }
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setSending(false);
    }
  };

  const handleRegister = async () => {
    if (!otp) {
      Alert.alert("Gagal", "Masukkan kode OTP yang Anda terima.");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, otp);
      Alert.alert("Berhasil", "Registrasi berhasil. Selamat datang!");
    } catch (e) {
      Alert.alert("Registrasi Gagal", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>Akun biasa hanya dapat mendaftar sebagai user.</Text>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={[styles.input, otpSent && styles.inputDisabled]} value={name} onChangeText={setName} placeholder="Nama lengkap" placeholderTextColor={COLORS.textMuted} editable={!otpSent} />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, otpSent && styles.inputDisabled]} value={email} onChangeText={setEmail}
            placeholder="you@example.com" placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address" autoCapitalize="none" editable={!otpSent}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput style={[styles.input, otpSent && styles.inputDisabled]} value={password} onChangeText={setPassword} placeholder="Minimal 6 karakter" placeholderTextColor={COLORS.textMuted} secureTextEntry editable={!otpSent} />

          {otpSent && (
            <>
              <Text style={styles.label}>Kode OTP</Text>
              <TextInput
                style={styles.input} value={otp} onChangeText={(t) => setOtp(t.replace(/\D/g, ""))}
                placeholder="6 digit kode" placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad" maxLength={6}
              />
            </>
          )}

          {!otpSent ? (
            <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={sending}>
              {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kirim Kode OTP</Text>}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verifikasi & Daftar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 12, alignItems: "center" }} onPress={handleSendOtp} disabled={sending}>
                <Text style={styles.link}>{sending ? "Mengirim ulang..." : "Kirim ulang kode OTP"}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={{ marginTop: 16, alignItems: "center" }} onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Sudah punya akun? Masuk</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  title: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 6 },
  label: { color: COLORS.textMuted, fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 1 },
  input: {
    backgroundColor: COLORS.surface2,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 14
  },
  inputDisabled: { opacity: 0.5 },
  button: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  link: { color: COLORS.textMuted, fontSize: 13, textDecorationLine: "underline" }
};

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../../AuthContext";
import { api } from "../../api";
import { COLORS, formatIDR, formatTimeLeft } from "../../theme";

export default function CheckoutScreen({ route, navigation }) {
  const { user } = useAuth();
  const { eventId, qty } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(284);

  useEffect(() => {
    api
      .get(`/api/events/${eventId}`)
      .then(setEvent)
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    if (!paying || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [paying, timeLeft]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!event) return null;

  const ticketPrice = Number(event.ticketPrice) || 0;
  const subtotal = ticketPrice * Number(qty);
  const taxes = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + taxes;

  const handlePayment = async () => {
    if (paying) return;
    setPaying(true);
    try {
      const data = await api.post("/api/payments/create", {
        user: user?.name || "Guest",
        email: user?.email || "guest@example.com",
        event: event.name,
        eventId: event.id,
        ticketQty: Number(qty),
        totalBayar: Math.round(total)
      });

      // Buka halaman pembayaran Midtrans di browser lalu poll status
      if (data.redirectUrl) {
        await WebBrowser.openBrowserAsync(data.redirectUrl);
      }

      const pollStart = Date.now();
      const poll = setInterval(async () => {
        try {
          const statusRes = await api.get(`/api/payments/${data.payment.orderId}/status`, true);
          if (statusRes.status === "PAID") {
            clearInterval(poll);
            setPaying(false);
            Alert.alert("Pembayaran Berhasil", "Tiket kamu sudah aktif. Cek tab Tiket Saya.", [
              { text: "OK", onPress: () => navigation.navigate("UserTabs", { screen: "Tickets" }) }
            ]);
          } else if (Date.now() - pollStart > 120000) {
            clearInterval(poll);
            setPaying(false);
            Alert.alert("Menunggu Pembayaran", "Pembayaran masih pending. Admin akan memverifikasi atau kamu bisa cek status nanti.");
          }
        } catch (e) {
          clearInterval(poll);
          setPaying(false);
          Alert.alert("Gagal", e.message);
        }
      }, 3000);
    } catch (e) {
      setPaying(false);
      Alert.alert("Pembayaran Gagal", e.message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={styles.timer}>
        <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "800" }}>
          Selesaikan pembayaran dalam {formatTimeLeft(timeLeft)}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Ringkasan Pesanan</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: "700" }}>{event.name}</Text>
            <Text style={styles.metaText}>{qty}x {formatIDR(ticketPrice)}</Text>
          </View>
          <Text style={{ color: COLORS.text, fontWeight: "800" }}>{formatIDR(ticketPrice * qty)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.metaText}>Subtotal</Text>
          <Text style={styles.metaText}>{formatIDR(subtotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaText}>Taxes & Fees (10%)</Text>
          <Text style={styles.metaText}>{formatIDR(taxes)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>Total</Text>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800" }}>{formatIDR(total)}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Metode Pembayaran</Text>
        <Text style={styles.metaText}>Anda akan diarahkan ke halaman pembayaran Midtrans (E-Wallet, Virtual Account, atau Kartu Kredit).</Text>
      </View>

      <TouchableOpacity style={[styles.button, paying && { opacity: 0.5 }]} disabled={paying} onPress={handlePayment}>
        {paying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Bayar Sekarang — {formatIDR(total)}</Text>
        )}
      </TouchableOpacity>
      <Text style={{ color: COLORS.textMuted, fontSize: 10, textAlign: "center" }}>
        Pembayaran aman via Midtrans
      </Text>
    </ScrollView>
  );
}

const styles = {
  timer: {
    alignSelf: "center",
    backgroundColor: "rgba(255,59,112,0.1)",
    borderColor: "rgba(255,59,112,0.25)",
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10
  },
  panelTitle: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  metaText: { color: COLORS.textMuted, fontSize: 12 },
  divider: { height: 1, backgroundColor: COLORS.border },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 14 }
};

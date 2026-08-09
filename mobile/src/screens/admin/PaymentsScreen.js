import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { api } from "../../api";
import { COLORS, formatIDR, formatDate } from "../../theme";

const STATUS_COLOR = { PAID: COLORS.success, PENDING: COLORS.warning, REJECTED: COLORS.danger };

export default function PaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const load = useCallback(async () => {
    try {
      const data = await api.get("/api/payments", true);
      setPayments(Array.isArray(data) ? data : []);
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

  const verify = (orderId, status) => {
    Alert.alert("Verifikasi", `Tandai ${orderId} sebagai ${status}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya",
        onPress: async () => {
          try {
            await api.post(`/api/payments/${orderId}/verify`, { status }, true);
            load();
            Alert.alert("Berhasil", `Pembayaran ${orderId} ditandai ${status}.`);
          } catch (e) {
            Alert.alert("Gagal", e.message);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      data={payments}
      keyExtractor={(item) => item.orderId || String(item.id)}
      ListEmptyComponent={<Text style={{ color: COLORS.textMuted, textAlign: "center", marginTop: 40 }}>Belum ada pembayaran.</Text>}
      ListHeaderComponent={
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}>
          Auto-refresh saat tab dibuka. Data terbaru: {new Date().toLocaleTimeString("id-ID")}
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <Text style={styles.orderId} numberOfLines={1}>{item.orderId}</Text>
            <Text style={{ color: STATUS_COLOR[item.status] || COLORS.textMuted, fontSize: 11, fontWeight: "800" }}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.userName}>{item.user_name}</Text>
          <Text style={styles.eventName} numberOfLines={1}>{item.event_name || `Event #${item.event_id || "?"}`}</Text>
          <Text style={styles.meta}>
            {Number(item.ticket_qty || 1)} tiket • {formatDate(item.createdAt)}
          </Text>
          <Text style={styles.amount}>{formatIDR(item.totalBayar)}</Text>

          {item.status === "PENDING" && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: COLORS.success }]} onPress={() => verify(item.orderId, "PAID")}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>Tandai PAID</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: COLORS.danger }]} onPress={() => verify(item.orderId, "REJECTED")}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>Tolak</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = {
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 3
  },
  orderId: { color: COLORS.textMuted, fontSize: 11, fontFamily: "monospace", flex: 1 },
  userName: { color: COLORS.text, fontSize: 14, fontWeight: "800", marginTop: 4 },
  eventName: { color: COLORS.textMuted, fontSize: 12 },
  meta: { color: COLORS.textMuted, fontSize: 11 },
  amount: { color: COLORS.accent, fontSize: 15, fontWeight: "800", marginTop: 4 },
  btn: { borderRadius: 8, paddingVertical: 10, alignItems: "center" }
};

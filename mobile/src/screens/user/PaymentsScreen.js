import React, { useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { COLORS, formatIDR, formatDate } from "../../theme";

const STATUS_COLOR = { PAID: COLORS.success, PENDING: COLORS.warning, REJECTED: COLORS.danger };
const STATUS_LABEL = { PAID: "Sukses", PENDING: "Pending", REJECTED: "Ditolak" };

export default function PaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      const data = await api.get("/api/me/payments", true);
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments])
  );

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
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={payments}
      keyExtractor={(item) => item.orderId || String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPayments(); }} tintColor={COLORS.accent} />}
      ListEmptyComponent={
        <Text style={{ color: COLORS.textMuted, textAlign: "center", marginTop: 60 }}>Belum ada riwayat pembayaran.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.orderId} numberOfLines={1}>{item.orderId}</Text>
            <Text style={[styles.status, { color: STATUS_COLOR[item.status] || COLORS.textMuted }]}>
              {STATUS_LABEL[item.status] || item.status}
            </Text>
          </View>
          <Text style={styles.eventName}>{item.event_name || "Event"}</Text>
          <Text style={styles.meta}>{formatDate(item.createdAt || item.verifiedAt)}</Text>
          <Text style={styles.amount}>{formatIDR(item.totalBayar)}</Text>
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
    borderRadius: 16,
    padding: 16,
    gap: 4
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  orderId: { color: COLORS.textMuted, fontSize: 11, fontFamily: "monospace", flex: 1 },
  status: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  eventName: { color: COLORS.text, fontSize: 14, fontWeight: "700", marginTop: 6 },
  meta: { color: COLORS.textMuted, fontSize: 11 },
  amount: { color: COLORS.accent, fontSize: 16, fontWeight: "800", marginTop: 6 }
};

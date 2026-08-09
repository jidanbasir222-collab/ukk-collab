import React, { useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { COLORS, formatDate } from "../../theme";

export default function TicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    setError("");
    try {
      const data = await api.get("/api/me/tickets", true);
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
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
      data={tickets}
      keyExtractor={(item) => item.code || item.orderId || String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTickets(); }} tintColor={COLORS.accent} />}
      ListEmptyComponent={
        error ? (
          <View style={{ alignItems: "center", marginTop: 60, gap: 12 }}>
            <Text style={{ color: COLORS.textMuted, textAlign: "center" }}>
              Tidak bisa terhubung ke server.{'\n'}{error}
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}
              onPress={() => { setLoading(true); loadTickets(); }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ color: COLORS.textMuted, textAlign: "center", marginTop: 60 }}>
            Belum ada tiket aktif. Yuk beli tiket!
          </Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.eventName} numberOfLines={1}>{item.event_name}</Text>
            <Text style={styles.status}>{item.status === "PAID" ? "AKTIF" : item.status}</Text>
          </View>
          <Text style={styles.meta}>Kode: {item.code || item.orderId}</Text>
          <Text style={styles.meta}>Kategori: {item.category || "General"} x{Number(item.ticket_qty) || 1}</Text>
          <Text style={styles.meta}>Tanggal: {formatDate(item.event_date)}</Text>
          <Text style={styles.meta}>Lokasi: {item.location || "-"}</Text>
          <TouchableOpacity
            style={styles.download}
            onPress={() =>
              Alert.alert(
                "Tiket",
                `${item.event_name}\nKode: ${item.code || item.orderId}\n${item.category || "General"} x${Number(item.ticket_qty) || 1}\n${formatDate(item.event_date)}`
              )
            }
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>Lihat Tiket</Text>
          </TouchableOpacity>
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
  eventName: { color: COLORS.text, fontSize: 15, fontWeight: "800", flex: 1 },
  status: { color: COLORS.success, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  meta: { color: COLORS.textMuted, fontSize: 12 },
  download: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10
  }
};

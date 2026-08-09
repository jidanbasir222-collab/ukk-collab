import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { COLORS, formatIDR } from "../../theme";
import { useAuth } from "../../AuthContext";

const StatCard = ({ label, value, color = COLORS.text }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([api.get("/api/dashboard/stats", true), api.get("/api/dashboard/activity", true)]);
      setStats(s);
      setActivity(Array.isArray(a) ? a : []);
    } catch (e) {
      Alert.alert("Gagal", e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Auto-refresh tiap 10 detik
  useEffect(() => {
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.accent} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800" }}>Halo, {user?.name}</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Dashboard Admin Electric Pulse</Text>
        </View>
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={{ color: COLORS.danger, fontSize: 11, fontWeight: "800" }}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {!stats ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard label="Total Event" value={stats.totalEvents ?? 0} />
            <StatCard label="Event Aktif" value={stats.activeEvents ?? 0} color={COLORS.cyan} />
            <StatCard label="Tiket Terjual" value={Number(stats.totalSoldTickets ?? 0).toLocaleString("id-ID")} color={COLORS.accent} />
            <StatCard label="Total Revenue" value={formatIDR(stats.totalRevenue)} color={COLORS.success} />
            <StatCard label="Revenue Hari Ini" value={formatIDR(stats.verifiedRevenueToday)} color={COLORS.success} />
            <StatCard label="Pending Pembayaran" value={stats.pendingPayments ?? 0} color={COLORS.warning} />
            <StatCard label="Total Transaksi" value={stats.totalPayments ?? 0} />
            <StatCard label="Total Kuota" value={Number(stats.totalQuota ?? 0).toLocaleString("id-ID")} />
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Aktivitas Terakhir</Text>
            {activity.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Belum ada aktivitas.</Text>
            ) : (
              activity.map((a, i) => (
                <View key={i} style={styles.activityRow}>
                  <View style={[styles.dot, { backgroundColor: a.action_type === "PURCHASE" ? COLORS.success : COLORS.accent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: "700" }} numberOfLines={2}>{a.description}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>{a.user_name} • {a.createdAt ? new Date(a.createdAt).toLocaleString("id-ID") : ""}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = {
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logout: { borderWidth: 1, borderColor: COLORS.danger, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4
  },
  statValue: { fontSize: 17, fontWeight: "800" },
  statLabel: { color: COLORS.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  panel: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10
  },
  panelTitle: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  activityRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 }
};

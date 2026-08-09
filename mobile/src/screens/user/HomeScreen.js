import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Image
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { COLORS, formatIDR, formatDate } from "../../theme";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80";

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const data = await api.get("/api/events");
      setEvents(Array.isArray(data) ? data.filter((e) => e.status !== "DRAFT") : []);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const visible = events.filter((ev) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${ev.name || ""} ${ev.artist || ""} ${ev.category || ""} ${ev.location || ""}`.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "800" }}>Temukan Event</Text>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Cari event, artis, kategori..."
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadEvents(); }} tintColor={COLORS.accent} />}
        ListEmptyComponent={
          <Text style={{ color: COLORS.textMuted, textAlign: "center", marginTop: 60 }}>Belum ada event.</Text>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 14 }}
        renderItem={({ item }) => {
          const soldOut = item.status === "SOLD OUT" || item.status === "CLOSED";
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("EventDetail", { id: item.id })}
            >
              <Image source={{ uri: item.poster || item.banner || DEFAULT_IMAGE }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <View style={styles.badgeRow}>
                  <Text style={styles.badge}>{item.category || "General"}</Text>
                  <Text style={[styles.badge, soldOut ? styles.badgeSoldOut : styles.badgeActive]}>
                    {item.status || "ACTIVE"}
                  </Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardMeta}>{item.artist}</Text>
                <Text style={styles.cardMeta}>
                  {formatDate(item.date)} • {item.location}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <Text style={styles.cardPrice}>{formatIDR(item.ticketPrice)}</Text>
                  <Text style={styles.cardSold}>
                    {Number(item.sold || 0).toLocaleString("id-ID")}/{Number(item.quota || 0).toLocaleString("id-ID")} terjual
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = {
  search: {
    backgroundColor: COLORS.surface2,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: COLORS.text,
    fontSize: 13
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden"
  },
  cardImage: { width: "100%", height: 150, backgroundColor: COLORS.surface2 },
  cardBody: { padding: 14 },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  badge: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: "uppercase"
  },
  badgeActive: { color: COLORS.cyan, borderColor: COLORS.cyan },
  badgeSoldOut: { color: COLORS.textMuted },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  cardMeta: { color: COLORS.textMuted, fontSize: 11, marginTop: 3 },
  cardPrice: { color: COLORS.accent, fontSize: 15, fontWeight: "800" },
  cardSold: { color: COLORS.textMuted, fontSize: 10 }
};

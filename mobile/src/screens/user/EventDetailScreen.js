import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useAuth } from "../../AuthContext";
import { api } from "../../api";
import { COLORS, formatIDR, formatDate } from "../../theme";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";

export default function EventDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api
      .get(`/api/events/${route.params.id}`)
      .then(setEvent)
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, [route.params.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: COLORS.textMuted }}>Event tidak ditemukan.</Text>
      </View>
    );
  }

  const sold = Number(event.sold) || 0;
  const quota = Number(event.quota) || 1;
  const remaining = Math.max(quota - sold, 0);
  const soldOut = event.status === "SOLD OUT" || event.status === "CLOSED" || remaining <= 0;

  const handleOrder = () => {
    if (!user) {
      Alert.alert("Login Dulu", "Silakan masuk untuk memesan tiket.");
      return;
    }
    navigation.navigate("Checkout", { eventId: event.id, qty });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Image source={{ uri: event.banner || event.poster || DEFAULT_IMAGE }} style={{ width: "100%", height: 220, backgroundColor: COLORS.surface2 }} />

      <View style={{ padding: 16, gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Text style={styles.badge}>{event.category}</Text>
          <Text style={[styles.badge, { color: soldOut ? COLORS.danger : COLORS.cyan, borderColor: soldOut ? COLORS.danger : COLORS.cyan }]}>
            {event.status}
          </Text>
        </View>

        <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: "800" }}>{event.name}</Text>
        {event.artist ? <Text style={styles.meta}>Bersama {event.artist}</Text> : null}
        <Text style={styles.meta}>{formatDate(event.date)} • {event.time || "19:00"} WIB</Text>
        <Text style={styles.meta}>{event.location}</Text>

        <View style={styles.panel}>
          <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: "700", marginBottom: 8 }}>Ketersediaan Tiket</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.meta}>
              {sold.toLocaleString("id-ID")} terjual dari {quota.toLocaleString("id-ID")}
            </Text>
            <Text style={{ color: soldOut ? COLORS.danger : COLORS.cyan, fontWeight: "800" }}>
              {Math.min(Math.round((sold / quota) * 100), 100)}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={{
                width: `${Math.min(Math.round((sold / quota) * 100), 100)}%`,
                height: "100%",
                borderRadius: 99,
                backgroundColor: soldOut ? COLORS.danger : COLORS.accent
              }}
            />
          </View>
          {soldOut ? (
            <Text style={{ color: COLORS.danger, fontSize: 12, fontWeight: "700", marginTop: 8 }}>
              Tiket sudah habis atau event ditutup.
            </Text>
          ) : remaining <= quota * 0.2 ? (
            <Text style={{ color: COLORS.warning, fontSize: 12, fontWeight: "700", marginTop: 8 }}>
              Sisa {remaining} tiket! Segera pesan.
            </Text>
          ) : null}
        </View>

        <View style={styles.panel}>
          <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: "700", marginBottom: 4 }}>HARGA TIKET</Text>
          <Text style={{ color: COLORS.accent, fontSize: 22, fontWeight: "800" }}>{formatIDR(event.ticketPrice)}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: "700" }}>Jumlah Tiket</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
              <TouchableOpacity onPress={() => setQty((v) => Math.max(1, v - 1))} disabled={qty <= 1 || soldOut}>
                <Text style={{ color: qty <= 1 ? COLORS.border : COLORS.text, fontSize: 18, fontWeight: "800" }}>−</Text>
              </TouchableOpacity>
              <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: "800" }}>{qty}</Text>
              <TouchableOpacity onPress={() => setQty((v) => Math.min(remaining, v + 1))} disabled={soldOut || qty >= remaining}>
                <Text style={{ color: soldOut || qty >= remaining ? COLORS.border : COLORS.text, fontSize: 18, fontWeight: "800" }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, soldOut && { opacity: 0.4 }]}
            disabled={soldOut}
            onPress={handleOrder}
          >
            <Text style={styles.buttonText}>
              {soldOut ? "Habis / Ditutup" : "Lanjut ke Pembayaran"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = {
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
  meta: { color: COLORS.textMuted, fontSize: 12 },
  panel: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 6
  },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
    overflow: "hidden"
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 13 }
};

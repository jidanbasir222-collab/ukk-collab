import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme";
import DashboardScreen from "./DashboardScreen";
import EventsScreen from "./EventsScreen";
import ArtistsScreen from "./ArtistsScreen";
import CategoriesScreen from "./CategoriesScreen";
import PaymentsScreen from "./PaymentsScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: "800" },
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: "stats-chart",
            Events: "calendar",
            Artists: "musical-notes",
            Categories: "folder-open",
            Payments: "card"
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ title: "Events" }} />
      <Tab.Screen name="Artists" component={ArtistsScreen} options={{ title: "Artis" }} />
      <Tab.Screen name="Categories" component={CategoriesScreen} options={{ title: "Kategori" }} />
      <Tab.Screen name="Payments" component={PaymentsScreen} options={{ title: "Pembayaran" }} />
    </Tab.Navigator>
  );
}

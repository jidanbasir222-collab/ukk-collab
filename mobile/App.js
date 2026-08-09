import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/AuthContext";
import { COLORS } from "./src/theme";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import UserTabs from "./src/screens/user/UserTabs";
import EventDetailScreen from "./src/screens/user/EventDetailScreen";
import CheckoutScreen from "./src/screens/user/CheckoutScreen";
import AdminTabs from "./src/screens/admin/AdminTabs";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const isAdmin = user && String(user.role || "").toLowerCase().includes("admin");

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontFamily: "monospace", fontWeight: "800" },
        contentStyle: { backgroundColor: COLORS.bg }
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      ) : isAdmin ? (
        <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "Detail Event" }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

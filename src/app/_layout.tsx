import "@/global.css";

import * as Sentry from "@sentry/react-native";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  SplineSansMono_400Regular,
  SplineSansMono_700Bold,
} from "@expo-google-fonts/spline-sans-mono";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "production",
});

import { ExplainProvider } from "@/hooks/use-explain";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    SplineSansMono_400Regular,
    SplineSansMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) setReady(true);
  }, [fontsLoaded, fontError]);

  // Don't block forever if font loading stalls on device
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: "#F3F5F1" }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ExplainProvider>
          <Sentry.ErrorBoundary fallback={<View style={{ flex: 1, backgroundColor: "#F3F5F1" }} />}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#F3F5F1" },
                animation: "slide_from_right",
              }}
            >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="duel"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="learn"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="courses"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="ask"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="radar"
            options={{
              presentation: "modal",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="thesis-profile"
            options={{
              presentation: "modal",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen name="credit" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="screener" options={{ animation: "slide_from_right" }} />
          <Stack.Screen
            name="pro"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen name="cfo" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="accounts" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="investments" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="lenses" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="xray" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="brief" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="advice" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="forecast" options={{ animation: "slide_from_right", gestureEnabled: false }} />
          <Stack.Screen name="thesis-studio" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="thesis-model/index" options={{ animation: "slide_from_right", gestureEnabled: false }} />
          <Stack.Screen name="explore-climate" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="support" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="thesis-health" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="compounder" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="offers" options={{ animation: "slide_from_right" }} />
          <Stack.Screen
            name="feedback"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="auth"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              gestureEnabled: false,
            }}
          />
            </Stack>
          </Sentry.ErrorBoundary>
        </ExplainProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

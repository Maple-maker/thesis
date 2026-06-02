import { Stack } from "expo-router";

export default function BuilderLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F3F5F1" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="portfolio" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="build" />
    </Stack>
  );
}

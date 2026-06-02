import { Stack } from "expo-router";

export default function ThemeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F3F5F1" },
      }}
    />
  );
}

import { Stack } from "expo-router";

export default function StockLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F3F5F1" },
      }}
    />
  );
}

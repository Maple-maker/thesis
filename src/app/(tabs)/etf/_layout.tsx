import { Stack } from "expo-router";

export default function EtfLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F3F5F1" },
      }}
    />
  );
}

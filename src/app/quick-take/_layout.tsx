import { Stack } from "expo-router";

export default function QuickTakeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
        contentStyle: { backgroundColor: "#F3F5F1" },
      }}
    />
  );
}

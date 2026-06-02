import { Stack } from "expo-router";

export default function ThesisStudioLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F3F5F1" },
        animation: "slide_from_right",
      }}
    />
  );
}

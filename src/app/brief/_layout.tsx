import { Stack } from "expo-router";

export default function BriefLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

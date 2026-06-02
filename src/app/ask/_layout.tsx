import { Stack } from "expo-router";

export default function AskLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F3F5F1" } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="memory" />
    </Stack>
  );
}

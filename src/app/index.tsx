import { Redirect } from "expo-router";
import { useStore } from "@/store";

export default function Index() {
  const onboarding = useStore((s) => s.onboarding);
  if (onboarding === "not-started") {
    return <Redirect href="/quick-take" />;
  }
  if (onboarding !== "complete") {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/(tabs)" />;
}

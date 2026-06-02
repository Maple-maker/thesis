import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

/** Redirect-only tab, tapping Learn in the tab bar opens the modal. */
export default function LearnTab() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/learn");
  }, [router]);

  return <View />;
}

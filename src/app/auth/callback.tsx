import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";
import { useStore } from "@/store";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const setAuthUser = useStore((s) => s.setAuthUser);

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session?.user) {
          setAuthUser(data.session.user);
          router.replace("/(tabs)");
        } else {
          router.replace("/auth");
        }
      } catch {
        if (!cancelled) router.replace("/auth");
      }
    };

    // Small delay to let Supabase process the session from the URL
    const t = setTimeout(handleCallback, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [router, setAuthUser]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F3F5F1",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color="#0E7A66" />
      <Text className="text-ink-2 text-[14px] font-sansMd mt-4">
        Finishing sign in…
      </Text>
    </View>
  );
}

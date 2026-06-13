import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store";

const REDIRECT = "thesis://auth/callback";

export default function AuthScreen() {
  const router = useRouter();
  const setAuthUser = useStore((s) => s.setAuthUser);
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(provider);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: REDIRECT,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (data?.url) {
        // Import web browser lazily to avoid issues on native
        const { openAuthSessionAsync } = await import("expo-web-browser");
        const result = await openAuthSessionAsync(data.url, REDIRECT);

        if (result.type === "success" && result.url) {
          const params = new URLSearchParams(
            result.url.split("#")[1] ?? result.url.split("?")[1] ?? ""
          );
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { data: sessionData } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionData.user) {
              setAuthUser(sessionData.user);
              router.replace("/(tabs)");
              return;
            }
          }
        }

        // If we get here, try getting the session directly
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          setAuthUser(sessionData.session.user);
          router.replace("/(tabs)");
          return;
        }

        Alert.alert(
          "Sign in failed",
          "Could not complete sign in. Please try again."
        );
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      Alert.alert("Sign in failed", msg);
    } finally {
      setLoading(null);
    }
  };

  const onSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#F3F5F1" }}
    >
      {/* Close button */}
      <View className="flex-row justify-end px-3 pt-2">
        <Pressable
          onPress={onSkip}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center active:opacity-70"
        >
          <Icon name="close" size={16} color="#16201C" sw={2} />
        </Pressable>
      </View>

      <View className="flex-1 justify-center px-6" style={{ paddingBottom: 80 }}>
        {/* Logo + headline */}
        <View className="items-center mb-8">
          <View
            className="w-[64px] h-[64px] rounded-[20px] items-center justify-center mb-5"
            style={{ backgroundColor: "#0E7A66" }}
          >
            <Icon name="sparkle" size={32} color="#FFFFFF" sw={2.2} />
          </View>
          <Text
            className="text-ink font-displayX text-[28px] text-center"
            style={{ letterSpacing: -0.6, lineHeight: 32 }}
          >
            Save your thesis
          </Text>
          <Text className="text-ink-2 text-[15px] font-sansMd text-center mt-3 leading-[22px] px-2">
            Sign in to keep your themes, watchlist, and progress safe across
            devices. Your data stays private.
          </Text>
        </View>

        {/* Buttons */}
        <View className="gap-y-3 mb-6">
          {/* Google */}
          <Pressable
            onPress={() => handleOAuth("google")}
            disabled={loading != null}
            className="h-[52px] rounded-[14px] bg-[#FFFFFF] border border-[#DADCE0] flex-row items-center justify-center active:opacity-70"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            {loading === "google" ? (
              <Text className="text-ink-2 text-[15px] font-sansSb">
                Signing in…
              </Text>
            ) : (
              <View className="flex-row items-center">
                <View className="w-[20px] h-[20px] mr-3">
                  <Text className="text-[18px]">G</Text>
                </View>
                <Text className="text-[#3C4043] text-[15px] font-sansSb">
                  Continue with Google
                </Text>
              </View>
            )}
          </Pressable>

          {/* Apple — iOS only */}
          {Platform.OS === "ios" && (
            <Pressable
              onPress={() => handleOAuth("apple")}
              disabled={loading != null}
              className="h-[52px] rounded-[14px] bg-[#000000] flex-row items-center justify-center active:opacity-70"
            >
              {loading === "apple" ? (
                <Text className="text-white/80 text-[15px] font-sansSb">
                  Signing in…
                </Text>
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-[18px] mr-3"></Text>
                  <Text className="text-white text-[15px] font-sansSb">
                    Continue with Apple
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          {/* Email + password */}
          <Pressable
            onPress={() => router.push("/auth/sign-in")}
            disabled={loading != null}
            className="h-[52px] rounded-[14px] bg-bg-surface border border-line flex-row items-center justify-center active:opacity-70"
          >
            <Text className="text-ink text-[15px] font-sansSb">
              Continue with email
            </Text>
          </Pressable>
        </View>

        {/* Skip */}
        <Pressable
          onPress={onSkip}
          disabled={loading != null}
          className="items-center py-2 active:opacity-70"
        >
          <Text className="text-ink-3 text-[14px] font-sansMd">
            Maybe later →
          </Text>
        </Pressable>
      </View>

      {/* Disclaimer */}
      <View className="px-6 pb-8">
        <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px]">
          Your email is only used to identify your account. We never share your
          data. Educational tool, not investment advice.
        </Text>
      </View>
    </SafeAreaView>
  );
}

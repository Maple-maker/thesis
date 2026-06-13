import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { syncToCloud } from "@/lib/sync";
import { useStore } from "@/store";

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Email or password is incorrect.";
  if (m.includes("email not confirmed"))
    return "Check your inbox — confirm your email, then sign in.";
  if (m.includes("network") || m.includes("fetch"))
    return "Can't reach the server. Check your connection and try again.";
  return message;
}

export default function SignInScreen() {
  const router = useRouter();
  const setAuthUser = useStore((s) => s.setAuthUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().includes("@") && password.length >= 6;

  const onSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      if (authError) {
        setError(friendlyAuthError(authError.message));
        return;
      }
      if (data.user) {
        setAuthUser(data.user);
        void syncToCloud();
        // Quick Take users still need the full builder; returning users go home.
        const onboarding = useStore.getState().onboarding;
        router.replace(onboarding === "complete" ? "/(tabs)" : "/onboarding");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-row justify-between items-center px-4 pt-2">
          <Pressable
            onPress={() => router.back()}
            className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center active:opacity-70"
          >
            <Icon name="back" size={16} color="#16201C" sw={2} />
          </Pressable>
        </View>

        <View className="flex-1 justify-center px-6" style={{ paddingBottom: 60 }}>
          <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest">
            Welcome back
          </Text>
          <Text
            className="text-ink font-displayX text-[30px] mt-2"
            style={{ letterSpacing: -0.7, lineHeight: 34 }}
          >
            Sign in to your thesis
          </Text>

          <View className="mt-8 gap-y-3">
            <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3">
              <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-wider mb-1">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#8C988F"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                className="text-ink text-[16px] font-sansMd"
              />
            </View>
            <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3">
              <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-wider mb-1">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#8C988F"
                secureTextEntry
                autoComplete="password"
                className="text-ink text-[16px] font-sansMd"
                onSubmitEditing={onSubmit}
              />
            </View>
          </View>

          {error ? (
            <View className="bg-neg-bg rounded-[12px] px-4 py-3 mt-3">
              <Text className="text-neg text-[13px] font-sansSb leading-[18px]">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="mt-6">
            <Button
              label={loading ? "Signing in…" : "Sign in"}
              fullWidth
              size="lg"
              disabled={!canSubmit || loading}
              onPress={onSubmit}
            />
          </View>

          <Pressable
            onPress={() => router.replace("/auth/sign-up")}
            className="items-center mt-5 active:opacity-70"
          >
            <Text className="text-ink-2 text-[14px] font-sansMd">
              New here?{" "}
              <Text className="text-brand font-sansBold">Create an account</Text>
            </Text>
          </Pressable>
        </View>

        <View className="px-6 pb-6">
          <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px]">
            Educational only · not investment advice
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

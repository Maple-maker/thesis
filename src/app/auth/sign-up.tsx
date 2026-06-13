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
  if (m.includes("already registered"))
    return "That email already has an account. Try signing in instead.";
  if (m.includes("invalid") && m.includes("email"))
    return "That doesn't look like a valid email address.";
  if (m.includes("password"))
    return "Password needs at least 6 characters.";
  if (m.includes("network") || m.includes("fetch"))
    return "Can't reach the server. Check your connection and try again.";
  return message;
}

export default function SignUpScreen() {
  const router = useRouter();
  const setAuthUser = useStore((s) => s.setAuthUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const canSubmit = email.trim().includes("@") && password.length >= 6;

  const onSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(friendlyAuthError(authError.message));
        return;
      }
      // Project may require email confirmation — no session until confirmed.
      if (data.session && data.user) {
        setAuthUser(data.user);
        void syncToCloud();
        // Quick Take users still need the full builder; returning users go home.
        const onboarding = useStore.getState().onboarding;
        router.replace(onboarding === "complete" ? "/(tabs)" : "/onboarding");
        return;
      }
      if (data.user) setConfirmSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmSent) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 justify-center px-6">
          <View className="bg-brand-bg w-12 h-12 rounded-[14px] items-center justify-center mb-5">
            <Icon name="check" size={24} color="#0E7A66" sw={2.4} />
          </View>
          <Text
            className="text-ink font-displayX text-[28px]"
            style={{ letterSpacing: -0.6, lineHeight: 32 }}
          >
            Check your email
          </Text>
          <Text className="text-ink-2 text-[15px] font-sansMd mt-3 leading-[22px]">
            We sent a confirmation link to{" "}
            <Text className="font-sansBold text-ink">{email.trim()}</Text>. Tap
            it, then come back and sign in.
          </Text>
          <View className="mt-8">
            <Button
              label="Go to sign in"
              fullWidth
              size="lg"
              onPress={() => router.replace("/auth/sign-in")}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            Create account
          </Text>
          <Text
            className="text-ink font-displayX text-[30px] mt-2"
            style={{ letterSpacing: -0.7, lineHeight: 34 }}
          >
            Keep your thesis safe
          </Text>
          <Text className="text-ink-2 text-[14.5px] font-sansMd mt-2 leading-[21px]">
            Your themes, watchlist, and journal sync across devices.
          </Text>

          <View className="mt-7 gap-y-3">
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
                placeholder="At least 6 characters"
                placeholderTextColor="#8C988F"
                secureTextEntry
                autoComplete="password-new"
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
              label={loading ? "Creating account…" : "Create account"}
              fullWidth
              size="lg"
              disabled={!canSubmit || loading}
              onPress={onSubmit}
            />
          </View>

          <Pressable
            onPress={() => router.replace("/auth/sign-in")}
            className="items-center mt-5 active:opacity-70"
          >
            <Text className="text-ink-2 text-[14px] font-sansMd">
              Already have an account?{" "}
              <Text className="text-brand font-sansBold">Sign in</Text>
            </Text>
          </Pressable>
        </View>

        <View className="px-6 pb-6">
          <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px]">
            Your email is only used to identify your account. Educational only ·
            not investment advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

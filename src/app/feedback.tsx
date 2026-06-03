import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { submitFeedback } from "@/lib/thesis-api";

const CATEGORIES = [
  { key: "bug" as const, label: "Bug Report", icon: "shield" as const, desc: "Something is broken or not working right" },
  { key: "ux" as const, label: "UX / Confusing", icon: "discover" as const, desc: "Something is hard to use or unclear" },
  { key: "feature" as const, label: "Feature Request", icon: "sparkle" as const, desc: "Something you wish the app could do" },
  { key: "general" as const, label: "General Feedback", icon: "compare" as const, desc: "Any other thoughts or impressions" },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<typeof CATEGORIES[number]["key"]>("general");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (description.trim().length < 5) return;
    setSubmitting(true);
    setError(null);

    const ok = await submitFeedback({
      category,
      description: description.trim(),
      steps: steps.trim() || undefined,
    });

    setSubmitting(false);
    if (ok) {
      setDone(true);
    } else {
      setError("Couldn't send feedback. Check your connection and try again.");
    }
  };

  if (done) {
    return (
      <Screen padded>
        <Header back onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-4" style={{ paddingBottom: 120 }}>
          <View className="w-[64px] h-[64px] rounded-[20px] bg-brand-bg items-center justify-center mb-5">
            <Icon name="check" size={32} color="#0E7A66" sw={2.4} />
          </View>
          <Text className="text-ink font-displayX text-[22px] text-center" style={{ letterSpacing: -0.3 }}>
            Feedback sent
          </Text>
          <Text className="text-ink-2 text-[14px] font-sansMd text-center mt-2 leading-[21px]">
            Thank you! Your feedback goes directly to the builder and helps shape the next version of Thesis.
          </Text>
          <View className="mt-8">
            <Button
              label="Done"
              variant="primary"
              size="md"
              onPress={() => router.back()}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <Header back onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest mt-2">
            Share feedback
          </Text>
          <Text
            className="text-ink font-displayX text-[28px] mt-1"
            style={{ letterSpacing: -0.5, lineHeight: 32 }}
          >
            Report an issue
          </Text>
          <Text className="text-ink-2 text-[14px] font-sansMd mt-3 leading-[21px] mb-6">
            Your feedback goes directly to the builder. Every report helps shape the next version.
          </Text>

          {/* Category picker */}
          <Text className="text-ink font-sansBold text-[13px] uppercase tracking-wider mb-2.5">
            What kind of feedback?
          </Text>
          <View className="gap-y-2 mb-6">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                className={`flex-row items-start p-3.5 rounded-[14px] border active:opacity-70 ${
                  category === cat.key
                    ? "border-brand bg-brand-bg"
                    : "border-line bg-bg-surface"
                }`}
              >
                <View
                  className={`w-[36px] h-[36px] rounded-[10px] items-center justify-center mr-3 ${
                    category === cat.key ? "bg-brand/20" : "bg-bg-surface2"
                  }`}
                  style={
                    category === cat.key
                      ? { backgroundColor: "rgba(14,122,102,0.15)" }
                      : {}
                  }
                >
                  <Icon
                    name={cat.icon}
                    size={18}
                    color={category === cat.key ? "#0E7A66" : "#8C988F"}
                    sw={2}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-[14px] font-sansBold ${
                      category === cat.key ? "text-brand" : "text-ink"
                    }`}
                  >
                    {cat.label}
                  </Text>
                  <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5">
                    {cat.desc}
                  </Text>
                </View>
                <View
                  className={`w-[22px] h-[22px] rounded-full border-2 items-center justify-center mt-1.5 ${
                    category === cat.key
                      ? "border-brand bg-brand"
                      : "border-line-strong"
                  }`}
                >
                  {category === cat.key && (
                    <Icon name="check" size={11} color="#FFFFFF" sw={2.6} />
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Description */}
          <Text className="text-ink font-sansBold text-[13px] uppercase tracking-wider mb-2.5">
            What's happening?
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue or share your thoughts..."
            placeholderTextColor="#8C988F"
            multiline
            textAlignVertical="top"
            className="bg-bg-surface border border-line rounded-[14px] px-4 py-3.5 text-ink text-[14px] font-sansMd leading-[20px]"
            style={{ minHeight: 100 }}
          />

          {/* Steps to reproduce (shown for bugs/ux) */}
          {(category === "bug" || category === "ux") && (
            <View className="mt-5">
              <Text className="text-ink font-sansBold text-[13px] uppercase tracking-wider mb-2.5">
                Steps to reproduce
                <Text className="text-ink-3 font-sansMd normal-case tracking-normal"> (optional)</Text>
              </Text>
              <TextInput
                value={steps}
                onChangeText={setSteps}
                placeholder="1. I tapped on...&#10;2. Then I saw...&#10;3. I expected..."
                placeholderTextColor="#8C988F"
                multiline
                textAlignVertical="top"
                className="bg-bg-surface border border-line rounded-[14px] px-4 py-3.5 text-ink text-[14px] font-sansMd leading-[20px]"
                style={{ minHeight: 80 }}
              />
            </View>
          )}

          {/* Error */}
          {error && (
            <View className="mt-5 bg-neg/10 border border-neg/30 rounded-[12px] px-4 py-3">
              <Text className="text-neg text-[13px] font-sansMd">{error}</Text>
            </View>
          )}

          {/* Submit */}
          <View className="mt-6">
            <Button
              label={submitting ? "Sending..." : "Send feedback"}
              variant="primary"
              size="md"
              fullWidth
              disabled={description.trim().length < 5 || submitting}
              onPress={handleSubmit}
            />
          </View>
          {submitting && (
            <ActivityIndicator size="small" color="#0E7A66" className="mt-3" />
          )}

          <Text className="text-ink-3 text-[11px] font-sansMd mt-4 text-center leading-[16px]">
            Your feedback goes to the builder's Google Sheet and is reviewed before each update.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

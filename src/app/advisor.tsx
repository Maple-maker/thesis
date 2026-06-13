import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { ProGateCard } from "@/components/ProGateCard";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { IconBtn } from "@/components/ui/IconBtn";
import { PromptChip } from "@/components/ui/PromptChip";
import { Tag } from "@/components/ui/Tag";
import { themeById } from "@/data/themes";
import { supabase } from "@/lib/supabase";
import { useStore, selectIsPro } from "@/store";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_HISTORY_SENT = 10;

/** Split a reply into body text and any trailing "Learn: X" concept lines. */
function splitLearnPills(reply: string): { body: string; learns: string[] } {
  const lines = reply.split("\n");
  const learns: string[] = [];
  const kept: string[] = [];
  for (const line of lines) {
    const m = line.trim().match(/^Learn:\s*(.+)$/i);
    if (m && m[1]) learns.push(m[1].trim());
    else kept.push(line);
  }
  return { body: kept.join("\n").trim(), learns: learns.slice(0, 2) };
}

export default function AdvisorScreen() {
  const router = useRouter();
  const isPro = useStore(selectIsPro);
  const authUser = useStore((s) => s.authUser);
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const watchlist = useStore((s) => s.watchlist);
  const portfolio = useStore((s) => s.portfolio);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const greeting = useMemo(() => {
    const theme = themeIds[0] ? themeById(themeIds[0]) : null;
    const themeBit = theme ? ` Your ${theme.title} theme is a good place to start.` : "";
    return `I know your thesis — your themes, your journal, and the reasons behind your holdings. Ask me to explain a concept, challenge your thinking, or unpack a risk.${themeBit}`;
  }, [themeIds]);

  const chips = useMemo(() => {
    const theme = themeIds[0] ? themeById(themeIds[0]) : null;
    const journalSymbol = portfolio[0]?.symbol ?? watchlist[0];
    const list: { label: string; icon?: "trend" | "bolt" | "compare" | "book"; tone?: "amber"; seed: string }[] = [
      { label: "What's a moat?", icon: "book", seed: "What's a moat, and why do investors care about it?" },
      {
        label: "Challenge my thesis",
        icon: "bolt",
        tone: "amber",
        seed: "Challenge my thesis. What's the strongest bear case against the themes I've chosen?",
      },
    ];
    if (theme) {
      list.push({
        label: `${theme.title} risks`,
        icon: "compare",
        seed: `What are the main risks to the ${theme.title} thesis?`,
      });
    }
    if (journalSymbol) {
      list.push({
        label: `Why did I pick ${journalSymbol}?`,
        icon: "trend",
        seed: `Looking at my journal and portfolio reasons, why did I pick ${journalSymbol} — and does that reason still hold?`,
      });
    }
    return list;
  }, [themeIds, watchlist, portfolio]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending) return;
    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setSending(true);
    try {
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!url || !token) {
        setError("Sign in to use the Advisor — it needs your synced thesis.");
        return;
      }
      const res = await fetch(`${url}/functions/v1/advisor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversation_history: messages.slice(-MAX_HISTORY_SENT),
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (res.status === 403) {
        setError(
          "Pro hasn't been activated on your account yet. If you just upgraded, give it a minute and try again."
        );
        return;
      }
      const payload = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !payload.reply) {
        setError("The Advisor couldn't answer that one. Try again in a moment.");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: payload.reply! }]);
    } catch {
      setError("Couldn't reach the Advisor. Check your connection and try again.");
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  // Free users see the gate, not the chat.
  if (!isPro) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
        <View className="flex-row items-center px-4 pt-1">
          <IconBtn name="back" onPress={() => router.back()} sw={2.2} />
        </View>
        <ProGateCard />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-1 pb-2">
          <IconBtn name="back" onPress={() => router.back()} sw={2.2} />
          <View className="flex-1 flex-row items-center justify-center">
            <Text className="text-ink font-displayX text-[18px] mr-2">
              Ask Thesis
            </Text>
            <Tag label="Pro" tone="brand" />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Thread */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 16, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          <View className="gap-y-2.5">
            <ChatBubble role="ai">{greeting}</ChatBubble>
            {messages.map((m, i) => {
              if (m.role === "user") {
                return (
                  <ChatBubble key={i} role="user">
                    {m.content}
                  </ChatBubble>
                );
              }
              const { body, learns } = splitLearnPills(m.content);
              return (
                <ChatBubble
                  key={i}
                  role="ai"
                  footer={
                    learns.length > 0 ? (
                      <View className="flex-row flex-wrap gap-1.5 mt-1.5">
                        {learns.map((l) => (
                          <Pressable
                            key={l}
                            onPress={() => router.push("/learn" as never)}
                            className="bg-brand-bg px-2.5 py-1 rounded-[20px] flex-row items-center gap-x-1 active:opacity-70"
                          >
                            <Icon name="book" size={12} color="#06483C" sw={2} />
                            <Text className="text-brand-deep text-[11px] font-sansX">
                              Learn: {l}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null
                  }
                >
                  {body}
                </ChatBubble>
              );
            })}
            {sending && (
              <View className="bg-bg self-start px-4 py-3 rounded-[14px] flex-row items-center">
                <ActivityIndicator size="small" color="#0E7A66" />
                <Text className="text-ink-3 text-[13px] font-sansMd ml-2">
                  Thinking…
                </Text>
              </View>
            )}
            {error && (
              <View className="bg-neg-bg rounded-[12px] px-4 py-3">
                <Text className="text-neg text-[13px] font-sansSb leading-[18px]">
                  {error}
                </Text>
              </View>
            )}
          </View>

          {/* Not signed in — advisor context lives in the cloud */}
          {!authUser && messages.length === 0 && (
            <View className="mt-4">
              <Button
                label="Sign in to start"
                fullWidth
                size="md"
                variant="secondary"
                onPress={() => router.push("/auth/sign-in" as never)}
              />
            </View>
          )}
        </ScrollView>

        {/* Try-asking chips */}
        {messages.length === 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-grow-0 px-4 mb-2"
            contentContainerStyle={{ gap: 8 }}
          >
            {chips.map((c) => (
              <PromptChip
                key={c.label}
                label={c.label}
                icon={c.icon}
                tone={c.tone === "amber" ? "amber" : "default"}
                onPress={() => void send(c.seed)}
              />
            ))}
          </ScrollView>
        )}

        {/* Input row */}
        <View className="px-4 pb-2">
          <View className="flex-row items-end bg-bg-surface border border-line rounded-[16px] px-3.5 py-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about a concept, a risk, your thesis…"
              placeholderTextColor="#8C988F"
              multiline
              maxLength={1000}
              className="text-ink text-[15px] font-sansMd flex-1 py-1.5"
              style={{ maxHeight: 110 }}
            />
            <Pressable
              onPress={() => void send(input)}
              disabled={!input.trim() || sending}
              className={`w-[34px] h-[34px] rounded-full items-center justify-center ml-2 mb-0.5 ${
                input.trim() && !sending ? "bg-brand" : "bg-track"
              }`}
            >
              <Icon
                name="arrow"
                size={16}
                color={input.trim() && !sending ? "#FFFFFF" : "#8C988F"}
                sw={2.4}
              />
            </Pressable>
          </View>
          <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-2 mb-1">
            Educational only · not financial advice
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

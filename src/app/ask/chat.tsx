import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { SymbolActionSheet } from "@/components/chat/SymbolActionSheet";
import { ExplainSheet } from "@/components/ExplainSheet";
import { Icon } from "@/components/Icon";
import type { ConceptId } from "@/data/concepts";
import { useExplainSheet } from "@/hooks/useExplainSheet";
import type { EntityKind } from "@/lib/message-entities";
import { buildAssistantContext } from "@/lib/assistant-context";
import { sendAssistantMessage, type ChatMessage } from "@/lib/assistant-chat";
import { learnFromAssistantTurn } from "@/lib/assistant-memory-learn";
import { askPromptsForProfile } from "@/lib/ask-prompts";
import { CFO_UNAVAILABLE_USER, logCfoDevIssue } from "@/lib/cfo-user-message";
import { fetchBackendStatus } from "@/lib/thesis-api";
import { useStore, selectIsPro, selectPlaidConnected } from "@/store";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I'm your investing wizard, macro, crypto, commodities, earnings, ETFs, and your linked book. I remember this thread and your profile. Try: \"How do Fed rate cuts affect my portfolio?\" or \"Walk me through NVDA earnings\" or \"ETFs for rare earth metals.\"",
  createdAt: Date.now(),
};

export default function AskChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ seed?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const seedSentRef = useRef(false);
  const isPro = useStore(selectIsPro);
  const accountsConnected = useStore(selectPlaidConnected);

  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const completedLessons = useStore((s) => s.completedLessons);
  const watchlist = useStore((s) => s.watchlist);
  const memory = useStore((s) => s.assistantMemory);
  const thesisUserId = useStore((s) => s.thesisUserId);
  const plaidStatus = useStore((s) => s.plaidStatus);
  const linkedAccounts = useStore((s) => s.linkedAccounts);
  const holdings = useStore((s) => s.holdings);
  const messages = useStore((s) => s.chatMessages);
  const appendChat = useStore((s) => s.appendChatMessage);
  const recordMsg = useStore((s) => s.recordAssistantMessage);
  const clearChat = useStore((s) => s.clearChat);
  const setAssistantMemory = useStore((s) => s.setAssistantMemory);

  const [loading, setLoading] = useState(false);
  const [apiLine, setApiLine] = useState("Checking API…");
  const { openConcept, sheetProps: explainSheetProps } = useExplainSheet();
  const [symbolSheet, setSymbolSheet] = useState<{
    symbol: string;
    kind: EntityKind;
  } | null>(null);

  const onConceptPress = useCallback(
    (id: ConceptId) => openConcept(id),
    [openConcept]
  );

  const onSymbolPress = useCallback((symbol: string, kind: EntityKind) => {
    setSymbolSheet({ symbol, kind });
  }, []);

  const closeSymbolSheet = useCallback(() => setSymbolSheet(null), []);

  const onViewSymbol = useCallback(
    (symbol: string, kind: EntityKind) => {
      closeSymbolSheet();
      if (kind === "etf") {
        router.push({ pathname: "/(tabs)/etf/[symbol]", params: { symbol } } as never);
      } else {
        router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol } } as never);
      }
    },
    [router, closeSymbolSheet]
  );

  const onDuelSymbol = useCallback(
    (symbol: string) => {
      closeSymbolSheet();
      router.push({ pathname: "/duel", params: { a: symbol } } as never);
    },
    [router, closeSymbolSheet]
  );

  useEffect(() => {
    let cancelled = false;
    fetchBackendStatus().then((s) => {
      if (cancelled) return;
      if (!s.configured) {
        setApiLine("API not configured");
        return;
      }
      if (!s.reachable) {
        setApiLine(`API offline · ${s.url}`);
        return;
      }
      setApiLine(
        `DeepSeek ${s.pacePrimary ?? "ok"} · ${s.url.replace("http://", "")}`
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayMessages = useMemo(
    () => (messages.length ? messages : [WELCOME]),
    [messages]
  );

  const prompts = useMemo(
    () => askPromptsForProfile(profile, themeIds, { accountsConnected }),
    [profile, themeIds, accountsConnected]
  );

  const modelThesis = useStore((s) => s.modelThesis);

  const contextInput = useMemo(
    () => ({
      profile,
      themeIds,
      completedLessons,
      watchlist,
      memoryNotes: memory,
      plaidStatus,
      linkedAccounts,
      holdings,
      modelThesis,
    }),
    [
      profile,
      themeIds,
      completedLessons,
      watchlist,
      memory,
      plaidStatus,
      linkedAccounts,
      holdings,
      modelThesis,
    ]
  );

  const send = useCallback(
    async (text: string) => {
      if (!isPro) {
        router.push("/pro" as any);
        return;
      }
      if (!recordMsg()) {
        Alert.alert("Daily limit reached", "You've used today's CFO messages. Try again tomorrow.");
        return;
      }

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
        createdAt: Date.now(),
      };
      appendChat(userMsg);
      setLoading(true);

      try {
        const history = [...messages, userMsg].filter((m) => m.id !== "welcome");
        const result = await sendAssistantMessage(text, contextInput, history, {
          userId: thesisUserId,
          isPro: true,
        });
        appendChat(result.message);

        learnFromAssistantTurn({
          userMessage: text,
          assistantReply: result.message.content,
          existingNotes: memory,
          userId: thesisUserId,
        })
          .then(({ merged, added }) => {
            if (added > 0) setAssistantMemory(merged);
          })
          .catch(() => {});
      } catch (e) {
        const msg = String(e);
        let userMsg: string;
        if (msg.includes("not configured") || msg.includes("URL not configured")) {
          userMsg =
            "The AI CFO backend isn't connected yet. This requires setting up the Thesis API server. Check that EXPO_PUBLIC_THESIS_API_URL is set in your .env file. For self-hosting instructions, see the README.";
        } else if (
          msg.includes("Network request failed") ||
          msg.includes("fetch failed") ||
          msg.includes("abort") ||
          msg.includes("timeout")
        ) {
          userMsg =
            "Can't reach the AI CFO server. Make sure `npm run dev` is running in the server/ directory on port 8787, then try again.";
        } else {
          userMsg = CFO_UNAVAILABLE_USER;
        }
        logCfoDevIssue(msg);
        appendChat({
          id: `err-${Date.now()}`,
          role: "assistant",
          content: userMsg,
          createdAt: Date.now(),
        });
      } finally {
        setLoading(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [
      isPro,
      recordMsg,
      appendChat,
      messages,
      contextInput,
      thesisUserId,
      memory,
      setAssistantMemory,
      router,
    ]
  );

  useEffect(() => {
    const seed = typeof params.seed === "string" ? params.seed.trim() : "";
    if (!seed || !isPro || seedSentRef.current || loading) return;
    seedSentRef.current = true;
    send(seed);
  }, [params.seed, isPro, send, loading]);

  if (!isPro) {
    return null;
  }

  const { estimatedTokens } = buildAssistantContext(contextInput);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2 border-b border-line bg-bg-surface">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface2 items-center justify-center active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View className="flex-1 mx-3">
          <Text className="text-ink font-displayX text-[18px] text-center">AI CFO</Text>
          <Text className="text-ink-3 text-[10px] font-sansMd text-center">
            {apiLine} · ~{estimatedTokens} tok ·{" "}
            {plaidStatus !== "disconnected" ? "accounts linked" : "no accounts"}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/ask/memory" as any)}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface2 items-center justify-center active:opacity-70"
        >
          <Icon name="book" size={16} color="#16201C" sw={2} />
        </Pressable>
        <Pressable
          onPress={() => {
            Alert.alert("Clear chat?", "Clears bad/old replies too. Memory stays.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clear",
                style: "destructive",
                onPress: () => {
                  clearChat();
                  setApiLine("Checking API…");
                  fetchBackendStatus().then((s) => {
                    if (!s.reachable) {
                      setApiLine(`API offline · ${s.url}`);
                      return;
                    }
                    setApiLine(
                      `DeepSeek ${s.pacePrimary ?? "ok"} · ${s.url.replace("http://", "")}`
                    );
                  });
                },
              },
            ]);
          }}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface2 items-center justify-center ml-1 active:opacity-70"
        >
          <Icon name="grid" size={16} color="#16201C" sw={2} />
        </Pressable>
      </View>

      {(apiLine.includes("offline") || apiLine.includes("not configured")) && (
        <View className="mx-4 mt-2 bg-neg-bg/40 border border-neg/20 rounded-[12px] px-3 py-2.5">
          <Text className="text-neg text-[12px] font-sansMd leading-[17px]">
            {apiLine.includes("not configured")
              ? "AI CFO needs setup. Add EXPO_PUBLIC_THESIS_API_URL to your .env file and ensure your server has DEEPSEEK_API_KEY set."
              : "AI CFO server unreachable. Run the API server (npm run dev in server/) and check your connection."}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {displayMessages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              onConceptPress={onConceptPress}
              onSymbolPress={onSymbolPress}
            />
          ))}
          {loading && (
            <View className="flex-row items-center py-2">
              <ActivityIndicator color="#0E7A66" />
              <Text className="text-ink-3 text-[12px] font-sansMd ml-2">
                Thinking… (10–20s for full answers)
              </Text>
            </View>
          )}

          {messages.length === 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2 mb-4">
              {prompts.slice(0, 4).map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => send(p.question)}
                  className="px-3 py-2 rounded-full bg-bg-surface border border-line active:opacity-70"
                >
                  <Text className="text-ink-2 text-[12px] font-sansSb">{p.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <ChatComposer
          onSend={send}
          loading={loading}
          disabled={!isPro}
          initialText={typeof params.seed === "string" ? params.seed : ""}
        />
      </KeyboardAvoidingView>

      <ExplainSheet
        {...explainSheetProps}
        onSelectRelated={(id) => openConcept(id)}
      />
      <SymbolActionSheet
        symbol={symbolSheet?.symbol ?? null}
        kind={symbolSheet?.kind ?? null}
        visible={symbolSheet != null}
        onClose={closeSymbolSheet}
        onView={onViewSymbol}
        onDuel={onDuelSymbol}
      />
    </SafeAreaView>
  );
}

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { runDebateAsync, getDebateJob, type DebateResult } from "@/lib/thesis-api";
import { searchDuelSymbols } from "@/lib/duel-asset";
import { useStore } from "@/store";

/** Strip markdown tables, headers, and formatting chars from LLM output for readability */
function cleanMarkdown(text: string): string {
  return text
    // Remove markdown table rows (| --- | --- |)
    .replace(new RegExp("^\\|[\\-:\\s|]+\\|$", "gm"), "")
    // Remove table cell pipes but keep content
    .replace(/^\|(.+)\|$/gm, (_, content) => content.replace(/\|/g, " · "))
    // Remove bold/italic markers
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    // Remove heading markers but keep text
    .replace(/^#{1,4}\s+/gm, "")
    // Collapse multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ScoreBadge({ score, stance }: { score: number; stance: string }) {
  const isBull = stance === "Bullish";
  const isBear = stance === "Bearish";
  const bg = isBull ? "bg-pos/10" : isBear ? "bg-neg/10" : "bg-ink-3/10";
  const color = isBull ? "#0E7A66" : isBear ? "#DC2626" : "#6B7280";
  return (
    <View className={`rounded-[8px] px-3 py-1 ${bg}`}>
      <Text className="text-[12px] font-sansBold" style={{ color }}>
        {stance} · {score}/100
      </Text>
    </View>
  );
}

export default function DebateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ticker?: string }>();
  const initialTicker = params.ticker?.toUpperCase() ?? "";
  const profile = useStore((s) => s.profile);
  const modelThesis = useStore((s) => s.modelThesis);

  const [ticker, setTicker] = useState(initialTicker);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DebateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [ran, setRan] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  // Ticker search
  const suggestions = useMemo(() => {
    if (query.trim().length < 1) return [];
    return searchDuelSymbols(query, 12);
  }, [query]);

  // Auto-run if ticker passed from stock detail
  useEffect(() => {
    if (!initialTicker || ran) return;
    runIt(initialTicker);
  }, [initialTicker]);

  // Poll for job completion
  useEffect(() => {
    if (!jobId || jobStatus === "done" || jobStatus === "error") return;
    const interval = setInterval(async () => {
      try {
        const job = await getDebateJob(jobId);
        setJobStatus(job.status);
        if (job.status === "done" && job.result) {
          setResult(job.result);
          setLoading(false);
        } else if (job.status === "error") {
          setError(job.error ?? "Research failed");
          setLoading(false);
        }
      } catch { /* keep polling */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const runIt = async (sym: string) => {
    const t = sym.toUpperCase().trim();
    if (!t) return;
    setTicker(t);
    setQuery("");
    setLoading(true);
    setError(null);
    setResult(null);
    setRan(true);
    setExpandedRound(null);
    setJobId(null);
    setJobStatus(null);

    const thesisCtx = modelThesis?.conviction
      ? `Thesis: ${modelThesis.name} — ${modelThesis.conviction}`
      : undefined;

    try {
      const job = await runDebateAsync({
        ticker: t,
        thesisContext: thesisCtx,
        profile: {
          timeHorizon: profile.horizon,
          riskTolerance: profile.risk,
          experienceLevel: profile.experience,
          topGoal: profile.primaryGoal,
        },
      });
      setJobId(job.jobId);
      setJobStatus(job.status);
      // Don't set loading to false — polling will handle it
    } catch (e: any) {
      setError(e.message ?? "Research failed. Is the API server running?");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setJobId(null);
    setJobStatus(null);
    // Navigate away — polling continues in background
    router.back();
  };

  const consensus = result?.consensus;
  const round1 = result?.rounds.filter((r) => !r.role.includes("rebuttal")) ?? [];
  const round2 = result?.rounds.filter((r) => r.role.includes("rebuttal")) ?? [];

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
              Thesis Research
            </Text>
            <View
              className="px-1.5 py-0.5 rounded-[5px]"
              style={{ backgroundColor: "rgba(124,58,237,0.12)" }}
            >
              <Text className="text-[8px] font-sansX uppercase tracking-wider" style={{ color: "#7C3AED" }}>
                Experimental
              </Text>
            </View>
          </View>
          <Text className="text-ink font-displayX text-[22px]" style={{ letterSpacing: -0.5 }}>
            {ticker ? `$${ticker} Debate` : "Analyst Debate"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Ticker search + run button */}
        <View className="mb-4">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-bg-surface border border-line rounded-[14px] px-4 py-3">
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Type a ticker (NVDA, AMD, TSLA…)"
                placeholderTextColor="#8C988F"
                autoCapitalize="characters"
                className="text-ink text-[16px] font-monoBold"
                onSubmitEditing={() => query.trim() && runIt(query)}
                returnKeyType="go"
              />
            </View>
            <Button
              label="Run"
              variant="primary"
              size="lg"
              disabled={!query.trim() || loading}
              onPress={() => runIt(query)}
            />
          </View>

          {/* Suggestions */}
          {suggestions.length > 0 && !ticker && (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {suggestions.map((sym) => (
                <Pressable
                  key={sym}
                  onPress={() => { setQuery(sym); runIt(sym); }}
                  className="bg-bg-surface border border-line rounded-full px-3.5 py-2 active:opacity-70"
                >
                  <Text className="text-ink font-monoBold text-[13px]">{sym}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Re-run on same ticker */}
          {ticker && !loading && result && (
            <View className="flex-row gap-2 mt-3">
              <View className="flex-1 bg-bg-surface border border-line rounded-[14px] px-4 py-3">
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={`Try another ticker…`}
                  placeholderTextColor="#8C988F"
                  autoCapitalize="characters"
                  className="text-ink text-[16px] font-monoBold"
                  onSubmitEditing={() => query.trim() && runIt(query)}
                  returnKeyType="go"
                />
              </View>
              <Button
                label="Debate"
                variant="secondary"
                size="md"
                disabled={!query.trim() || loading}
                onPress={() => runIt(query)}
              />
            </View>
          )}
        </View>

        {/* Disclaimers — always visible */}
        <View
          className="rounded-[10px] px-3 py-2.5 mb-4"
          style={{ backgroundColor: "rgba(124,58,237,0.04)" }}
        >
          <Text className="text-[10px] font-sansMd leading-[16px] text-ink-3">
            <Text className="font-sansBold" style={{ color: "#7C3AED" }}>Verify before investing before investing. </Text>
            Given the probabilistic nature of machine learning, responses won't always be right. Do your own research.{"\n"}
            <Text className="font-sansBold" style={{ color: "#7C3AED" }}>No investment recommendations. </Text>
            Thesis Research gives you information, not advice.
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text className="text-ink-2 text-[13px] font-sansMd mt-4 text-center">
              {jobId ? "Research in progress..." : `Starting debate on ${ticker}...`}
            </Text>
            {jobId && (
              <Text className="text-ink-3 text-[11px] font-sansMd mt-1 text-center">
                9 LLM calls · ~30 seconds
              </Text>
            )}
            <Text className="text-ink-3 text-[11px] font-sansMd mt-3 text-center leading-[16px]">
              Round 1: 4 independent theses{"\n"}Round 2: 4 rebuttals{"\n"}Synthesis: committee verdict
            </Text>
            <View className="mt-5 gap-2 w-full">
              <Button label="Navigate away — we'll keep working" variant="secondary" fullWidth onPress={handleCancel} />
              <Text className="text-ink-3 text-[10px] font-sansMd text-center">
                Research continues in the background. Check back here to see results.
              </Text>
            </View>
          </View>
        )}

        {/* Error */}
        {error && (
          <Card pad={16} className="mb-4">
            <Text className="text-neg text-[14px] font-sansSb">{error}</Text>
            <Text className="text-ink-3 text-[12px] font-sansMd mt-2">
              Make sure the Thesis API server is running on port 8787 with DEEPSEEK_API_KEY set.
            </Text>
          </Card>
        )}

        {/* Consensus */}
        {consensus && (
          <Card pad={16} className="mb-4 border-brand/30 bg-brand-bg/5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Icon name="sparkle" size={16} color="#0E7A66" sw={2} />
                <Text className="text-brand text-[12px] font-sansX uppercase tracking-wider ml-1.5">
                  Committee Verdict
                </Text>
              </View>
              <ScoreBadge score={consensus.convictionScore} stance={consensus.verdict} />
            </View>
            <Text className="text-ink font-sansBold text-[15px] leading-[22px] mb-2">
              {consensus.summary}
            </Text>

            {consensus.mergedUpsides.length > 0 && (
              <View className="mb-2">
                <Text className="text-pos text-[11px] font-sansX uppercase tracking-wider mb-1">Upsides</Text>
                {consensus.mergedUpsides.map((u, i) => (
                  <Text key={i} className="text-ink-2 text-[12px] font-sansMd leading-[18px] ml-2">• {u}</Text>
                ))}
              </View>
            )}
            {consensus.mergedRisks.length > 0 && (
              <View className="mb-2">
                <Text className="text-neg text-[11px] font-sansX uppercase tracking-wider mb-1">Risks</Text>
                {consensus.mergedRisks.map((r, i) => (
                  <Text key={i} className="text-ink-2 text-[12px] font-sansMd leading-[18px] ml-2">• {r}</Text>
                ))}
              </View>
            )}
            {consensus.keyDisagreements.length > 0 && (
              <View>
                <Text className="text-amber text-[11px] font-sansX uppercase tracking-wider mb-1">Key Disagreements</Text>
                {consensus.keyDisagreements.map((d, i) => (
                  <Text key={i} className="text-ink-2 text-[12px] font-sansMd leading-[18px] ml-2">• {d}</Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Round 1 */}
        {round1.length > 0 && (
          <View className="mb-4">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">
              Round 1 · Independent Analyses
            </Text>
            {round1.map((r, i) => (
              <Pressable
                key={i}
                onPress={() => setExpandedRound(expandedRound === i ? null : i)}
                className="mb-2 active:opacity-70"
              >
                <Card pad={14}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-2">
                      <Text className="text-ink font-sansBold text-[13px]">{r.role}</Text>
                      <Text className="text-ink-3 text-[11px] font-sansMd mt-0.5 leading-[17px]">
                        {expandedRound === i ? cleanMarkdown(r.content) : cleanMarkdown(r.content).slice(0, 150) + (r.content.length > 150 ? "..." : "")}
                      </Text>
                    </View>
                    <ScoreBadge score={r.score} stance={r.stanceLabel} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        {/* Round 2 */}
        {round2.length > 0 && (
          <View className="mb-4">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">
              Round 2 · Rebuttals
            </Text>
            {round2.map((r, i) => {
              const idx = round1.length + i;
              return (
                <Pressable
                  key={i}
                  onPress={() => setExpandedRound(expandedRound === idx ? null : idx)}
                  className="mb-2 active:opacity-70"
                >
                  <Card pad={14}>
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-ink font-sansBold text-[13px]">{r.role}</Text>
                        <Text className="text-ink-3 text-[11px] font-sansMd mt-0.5 leading-[17px]">
                          {expandedRound === idx ? r.content : cleanMarkdown(r.content).slice(0, 150) + (r.content.length > 150 ? "..." : "")}
                        </Text>
                      </View>
                      <ScoreBadge score={r.score} stance={r.stanceLabel} />
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <Card pad={16} className="mb-4">
            <Text className="text-ink font-sansBold text-[15px] mb-2">How it works</Text>
            <Text className="text-ink-2 text-[13px] font-sansMd leading-[20px]">
              Type a ticker above and tap Run. Four specialized LLM analysts — Value, Growth, Macro
              Strategist, and Bear Case Strategist — each produce an independent thesis.
            </Text>
            <Text className="text-ink-2 text-[13px] font-sansMd leading-[20px] mt-2">
              In Round 2, each analyst reads the others' arguments and writes a rebuttal. Finally, a
              committee chair synthesizes all 8 arguments into a consolidated verdict with conviction
              score, key disagreements, and merged risks/upsides.
            </Text>
            <Text className="text-ink-3 text-[10px] font-sansMd mt-3 leading-[15px]">
              9 LLM calls · ~30 seconds · Requires API server on port 8787
            </Text>

            {/* Quick start suggestions */}
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mt-4 mb-2">
              Try one
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["NVDA", "AMD", "TSLA", "MSFT", "AAPL", "PLTR"].map((sym) => (
                <Pressable
                  key={sym}
                  onPress={() => runIt(sym)}
                  className="bg-brand-bg border border-brand/30 rounded-full px-3.5 py-2 active:opacity-70"
                >
                  <Text className="text-brand font-monoBold text-[13px]">{sym}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        <Text className="text-ink-3 text-[10px] text-center font-sansMd leading-[14px]">
          Educational tool. Analyst perspectives are AI-generated and not investment advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

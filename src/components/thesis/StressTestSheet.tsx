import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import {
  runThesisStressTest,
  STRESS_SCENARIOS,
  type StressTestResult,
} from "@/lib/thesis-stress-test";
import { useStore } from "@/store";

type Props = {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  /** Called when a stress test completes, so parent can persist the result. */
  onResult?: (result: StressTestResult) => void;
};

const SEVERITY_COLOR: Record<string, string> = {
  low: "#0E7A66",
  medium: "#D98512",
  high: "#D32F2F",
};

const RESILIENCE_COLOR: Record<string, string> = {
  Resilient: "#0E7A66",
  Stable: "#0E7A66",
  Vulnerable: "#D98512",
  Fragile: "#D32F2F",
};

export function StressTestSheet({ visible, onClose, symbol, onResult }: Props) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const modelThesis = useStore((s) => s.modelThesis);

  const [selected, setSelected] = useState<Set<string>>(
    new Set(STRESS_SCENARIOS.map((s) => s.id))
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<StressTestResult | null>(null);

  const toggleScenario = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(STRESS_SCENARIOS.map((s) => s.id)));
  const clearAll = () => setSelected(new Set());

  const canRun = modelThesis != null && selected.size > 0;

  const handleRun = () => {
    if (!modelThesis) {
      Alert.alert("No thesis model", "Build a thesis model first to run a stress test.");
      return;
    }
    setRunning(true);
    // Simulate async processing (in production: calls debate backend)
    setTimeout(() => {
      const testResult = runThesisStressTest(
        modelThesis,
        symbol,
        profile,
        themeIds,
        [...selected]
      );
      setResult(testResult);
      onResult?.(testResult);
      setRunning(false);
    }, 800);
  };

  const resilienceColor = result ? RESILIENCE_COLOR[result.resilienceLabel] : "#8C988F";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-2 border-b border-line bg-bg-surface">
          <Pressable
            onPress={onClose}
            className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface2 items-center justify-center active:opacity-70"
          >
            <Icon name="back" size={16} color="#16201C" sw={2} />
          </Pressable>
          <Text className="text-ink font-displayX text-[17px]">
            {result ? "Results" : `Stress test: ${symbol}`}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Pre-run: scenario selector */}
          {!result && (
            <>
              <Text className="text-ink-2 text-[14px] font-sansMd leading-[20px] mb-4">
                Run {symbol} through adverse scenarios to see how resilient your thesis is.
                Select scenarios below then press Run.
              </Text>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider">
                  Scenarios
                </Text>
                <View className="flex-row gap-2">
                  <Pressable onPress={selectAll} className="active:opacity-70">
                    <Text className="text-brand text-[12px] font-sansBold">All</Text>
                  </Pressable>
                  <Pressable onPress={clearAll} className="active:opacity-70">
                    <Text className="text-ink-3 text-[12px] font-sansBold">Clear</Text>
                  </Pressable>
                </View>
              </View>

              {STRESS_SCENARIOS.map((scenario) => {
                const sel = selected.has(scenario.id);
                return (
                  <Pressable
                    key={scenario.id}
                    onPress={() => toggleScenario(scenario.id)}
                    className={`border rounded-[14px] p-4 mb-2 active:opacity-70 ${
                      sel ? "border-brand bg-brand-bg/30" : "border-line bg-bg-surface"
                    }`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-ink font-sansBold text-[14px]">
                            {scenario.label}
                          </Text>
                          <View
                            className="px-2 py-0.5 rounded-[5px]"
                            style={{ backgroundColor: SEVERITY_COLOR[scenario.severity] + "1A" }}
                          >
                            <Text
                              className="text-[9px] font-sansBold uppercase"
                              style={{ color: SEVERITY_COLOR[scenario.severity] }}
                            >
                              {scenario.severity}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px]">
                          {scenario.description}
                        </Text>
                      </View>
                      <View
                        className={`h-6 w-6 rounded-full items-center justify-center border-2 ${
                          sel ? "bg-brand border-brand" : "border-line-strong"
                        }`}
                      >
                        {sel && <Icon name="check" size={14} sw={2.6} color="#FFFFFF" />}
                      </View>
                    </View>
                  </Pressable>
                );
              })}

              <View className="mt-4">
                <Button
                  label={running ? "Running…" : `Run stress test (${selected.size} scenarios)`}
                  fullWidth
                  size="lg"
                  disabled={!canRun || running}
                  onPress={handleRun}
                />
              </View>

              {running && (
                <View className="flex-row items-center justify-center mt-3 gap-2">
                  <ActivityIndicator color="#0E7A66" />
                  <Text className="text-ink-3 text-[12px] font-sansMd">
                    Analyzing scenarios…
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Post-run: results */}
          {result && (
            <>
              {/* Overall score */}
              <View
                className="rounded-[18px] p-5 mb-4 items-center"
                style={{ backgroundColor: resilienceColor + "1A", borderWidth: 1, borderColor: resilienceColor + "33" }}
              >
                <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
                  Resilience score
                </Text>
                <Text
                  className="font-monoBold text-[48px]"
                  style={{ color: resilienceColor, letterSpacing: -1 }}
                >
                  {result.overallResilience}
                </Text>
                <Text
                  className="text-[13px] font-sansBold mt-1"
                  style={{ color: resilienceColor }}
                >
                  {result.resilienceLabel}
                </Text>
                <Text className="text-ink-2 text-[12px] font-sansMd mt-2 text-center leading-[17px]">
                  {result.resilienceLabel === "Resilient"
                    ? "Your thesis holds up well across scenarios. Strong conviction."
                    : result.resilienceLabel === "Stable"
                      ? "Moderate resilience. Some scenarios expose meaningful risks."
                      : result.resilienceLabel === "Vulnerable"
                        ? "Multiple scenarios challenge your thesis. Review risks carefully."
                        : "Your thesis is fragile under stress. Consider reducing position size or adding hedges."}
                </Text>
              </View>

              {/* Per-scenario breakdown */}
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
                Scenario breakdown
              </Text>

              {result.scenarios.map((impact) => (
                <View
                  key={impact.scenario.id}
                  className="bg-bg-surface border border-line rounded-[14px] p-4 mb-2"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-ink font-sansBold text-[14px]">
                        {impact.scenario.label}
                      </Text>
                      <View
                        className="px-2 py-0.5 rounded-[5px]"
                        style={{
                          backgroundColor: SEVERITY_COLOR[impact.scenario.severity] + "1A",
                        }}
                      >
                        <Text
                          className="text-[9px] font-sansBold uppercase"
                          style={{ color: SEVERITY_COLOR[impact.scenario.severity] }}
                        >
                          {impact.scenario.severity}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-neg font-monoBold text-[14px]">
                      −{impact.convictionImpact}pts
                    </Text>
                  </View>

                  {/* Risks */}
                  <Text className="text-ink-3 text-[10px] font-sansBold uppercase mb-1.5">
                    Specific risks
                  </Text>
                  {impact.specificRisks.map((risk, i) => (
                    <Text key={i} className="text-ink-2 text-[12px] font-sansMd leading-[18px] ml-1 mb-1">
                      • {risk}
                    </Text>
                  ))}

                  {/* Mitigations */}
                  <Text className="text-ink-3 text-[10px] font-sansBold uppercase mt-2 mb-1.5">
                    How to mitigate
                  </Text>
                  {impact.mitigationIdeas.map((m, i) => (
                    <Text key={i} className="text-ink-2 text-[12px] font-sansMd leading-[18px] ml-1 mb-1">
                      • {m}
                    </Text>
                  ))}
                </View>
              ))}

              {/* Actions */}
              <View className="flex-row gap-2 mt-4">
                <View className="flex-1">
                  <Button
                    label="Run again"
                    fullWidth
                    size="md"
                    variant="secondary"
                    onPress={() => setResult(null)}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    label="Done"
                    fullWidth
                    size="md"
                    variant="primary"
                    onPress={onClose}
                  />
                </View>
              </View>

              <View className="mt-4">
                <Button
                  label={`Run full debate: ${symbol}`}
                  fullWidth
                  size="md"
                  variant="secondary"
                  onPress={() => {
                    onClose();
                    router.push({ pathname: "/debate", params: { ticker: symbol } } as never);
                  }}
                />
              </View>

              <Text className="text-ink-3 text-[10.5px] font-sansMd leading-[15px] text-center mt-3 px-4">
                Stress test results are illustrative and based on your thesis model data.
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

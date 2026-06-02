import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ForecastChart } from "@/components/charts/ForecastChart";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SliderField } from "@/components/ui/SliderField";
import { computeNetWorth } from "@/data/demo-accounts";
import {
  FORECAST_EVENT_TEMPLATES,
  FORECAST_SCENARIO_DEFAULTS,
  FORECAST_SCENARIOS,
  type ForecastScenarioValues,
} from "@/data/forecast-scenarios";
import {
  buildNetWorthForecast,
  DEFAULT_FORECAST_EVENTS,
  formatForecastUsd,
  forecastRunsOutYear,
  peakForecastPoint,
  yearsOfBurnAtRetirement,
  type ForecastLifeEvent,
} from "@/lib/forecast-model";
import { useStore, selectPlaidConnected } from "@/store";

const START_YEAR = new Date().getFullYear();

function forecastEndYear(currentAge: number, retirementAge: number) {
  const retireYear = START_YEAR + Math.max(0, retirementAge - currentAge);
  return Math.max(2050, retireYear + 15);
}

function mergeEvents(
  base: ForecastLifeEvent[],
  extra?: ForecastLifeEvent[]
): ForecastLifeEvent[] {
  if (!extra?.length) return base;
  const byYear = new Map(base.map((e) => [e.year, e]));
  for (const e of extra) byYear.set(e.year, e);
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

export default function ForecastScreen() {
  const router = useRouter();
  const connected = useStore(selectPlaidConnected);
  const accounts = useStore((s) => s.linkedAccounts);
  const profile = useStore((s) => s.profile);

  const linkedNw = connected ? computeNetWorth(accounts).netWorth : 45_000;

  const [values, setValues] = useState<ForecastScenarioValues>(() => ({
    ...FORECAST_SCENARIO_DEFAULTS,
    currentNetWorth: linkedNw,
    monthlySavings: connected ? 1200 : 800,
  }));
  const [events, setEvents] = useState<ForecastLifeEvent[]>(() => [...DEFAULT_FORECAST_EVENTS]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [eventsOpen, setEventsOpen] = useState(true);

  const currentAge = profile.age ?? 32;
  const retirementYear = START_YEAR + Math.max(0, values.retirementAge - currentAge);
  const endYear = forecastEndYear(currentAge, values.retirementAge);

  const buildProjection = (v: ForecastScenarioValues, ev: ForecastLifeEvent[]) =>
    buildNetWorthForecast({
      startYear: START_YEAR,
      endYear: forecastEndYear(currentAge, v.retirementAge),
      currentNetWorth: v.currentNetWorth,
      currentAge,
      retirementAge: v.retirementAge,
      annualReturn: v.annualReturnPct / 100,
      effectiveTaxRate: v.effectiveTaxRatePct / 100,
      monthlySavings: v.monthlySavings,
      monthlyBurn: v.monthlyBurn,
      events: ev,
    });

  const projection = useMemo(
    () => buildProjection(values, events),
    [values, events, currentAge]
  );

  const baselineValues = useMemo(
    () => ({
      ...FORECAST_SCENARIO_DEFAULTS,
      currentNetWorth: linkedNw,
      monthlySavings: connected ? 1200 : 800,
    }),
    [linkedNw, connected]
  );

  const baselineProjection = useMemo(
    () => buildProjection(baselineValues, DEFAULT_FORECAST_EVENTS),
    [baselineValues, currentAge]
  );

  const peak = useMemo(() => peakForecastPoint(projection), [projection]);
  const baselinePeak = useMemo(() => peakForecastPoint(baselineProjection), [baselineProjection]);
  const atRetirement = projection.find((p) => p.year === retirementYear);
  const end = projection[projection.length - 1];
  const runsOut = forecastRunsOutYear(projection, START_YEAR);
  const burnYears = yearsOfBurnAtRetirement(
    projection,
    retirementYear,
    values.monthlyBurn
  );

  const eventYears = [
    ...events.map((e) => e.year),
    retirementYear,
  ].filter((y, i, arr) => y <= endYear && arr.indexOf(y) === i);

  const chartRevision = `${values.retirementAge}-${values.annualReturnPct}-${values.monthlySavings}-${values.effectiveTaxRatePct}-${values.monthlyBurn}-${values.currentNetWorth}-${events.map((e) => `${e.year}${e.impactUsd}`).join(",")}-${endYear}`;

  const peakDelta = peak && baselinePeak ? peak.netWorth - baselinePeak.netWorth : 0;
  const showBaseline = activeScenarioId != null || peakDelta !== 0;

  const applyScenario = (id: string) => {
    const preset = FORECAST_SCENARIOS.find((s) => s.id === id);
    if (!preset) return;
    setActiveScenarioId(id);
    setValues(preset.apply(values));
    if (preset.events?.length) {
      setEvents((prev) => mergeEvents(prev, preset.events));
    }
  };

  const patch = (partial: Partial<ForecastScenarioValues>) => {
    setActiveScenarioId(null);
    setValues((v) => ({ ...v, ...partial }));
  };

  const addEventTemplate = (templateIndex: number) => {
    const t = FORECAST_EVENT_TEMPLATES[templateIndex];
    if (!t) return;
    const year = START_YEAR + 3 + events.length;
    setEvents((prev) => [...prev, { year, ...t }]);
    setActiveScenarioId(null);
  };

  const removeEvent = (year: number) => {
    setEvents((prev) => prev.filter((e) => e.year !== year));
    setActiveScenarioId(null);
  };

  const cfoPrompt = useMemo(() => {
    const eventSummary = events
      .slice(0, 4)
      .map((e) => `${e.year}: ${e.label}`)
      .join("; ");
    const parts = [
      `I'm ${currentAge} with ~${formatForecastUsd(values.currentNetWorth)} net worth.`,
      `Scenario: retire at ${values.retirementAge}, save $${values.monthlySavings}/mo,`,
      `${values.annualReturnPct}% pre-tax return, ${values.effectiveTaxRatePct}% effective tax drag,`,
      `$${values.monthlyBurn}/mo burn in retirement.`,
      eventSummary ? `Life events: ${eventSummary}.` : "",
      peak ? `Illustrative peak ${formatForecastUsd(peak.netWorth)} by ${peak.year}.` : "",
      runsOut ? `Projection runs out of money by ${runsOut}.` : "",
    ];
    return parts.filter(Boolean).join(" ");
  }, [currentAge, values, events, peak, runsOut]);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <Text className="text-ink font-displayX text-[24px] flex-1">Scenario planning</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 48 }}>
        <Text className="text-ink-2 text-[15px] font-sansMd leading-[22px] mt-2 mb-4">
          Model retirement, taxes, savings, burn rate, and life events. The chart updates instantly.
          Educational only, not a financial plan.
        </Text>

        <Text className="text-ink text-[15px] font-displayX mb-2">Try a question</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {FORECAST_SCENARIOS.map((s) => {
            const on = activeScenarioId === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => applyScenario(s.id)}
                className={`px-3 py-2.5 rounded-[12px] border max-w-full ${
                  on ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                }`}
              >
                <Text className={`text-[12px] font-sansSb ${on ? "text-brand" : "text-ink"}`}>
                  {s.question}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {(runsOut || burnYears != null) && (
          <Card pad={14} className="mb-4 bg-bg-surface">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
              Milestones
            </Text>
            {peak && (
              <Text className="text-ink text-[14px] font-sansSb">
                Peak net worth {formatForecastUsd(peak.netWorth)} in {peak.year}
              </Text>
            )}
            {atRetirement && (
              <Text className="text-ink-2 text-[13px] font-sansMd mt-1">
                At retirement ({values.retirementAge}): {formatForecastUsd(atRetirement.netWorth)}
                {burnYears != null ? ` · ~${burnYears} years of burn at current rate` : ""}
              </Text>
            )}
            {runsOut && (
              <Text className="text-neg text-[13px] font-sansBold mt-1">
                Runs out of money by {runsOut} under these assumptions
              </Text>
            )}
          </Card>
        )}

        <Card pad={16} className="mb-4">
          <Pressable
            onPress={() => setEventsOpen((o) => !o)}
            className="flex-row items-center justify-between mb-2"
          >
            <Text className="text-ink font-sansBold text-[15px]">Life events</Text>
            <View style={{ transform: [{ rotate: eventsOpen ? "180deg" : "0deg" }] }}>
              <Icon name="chevDown" size={16} color="#8C988F" sw={2} />
            </View>
          </Pressable>
          {eventsOpen && (
            <>
              {events.map((e) => (
                <View
                  key={e.year}
                  className="flex-row items-center justify-between py-2 border-b border-line"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-ink font-sansSb text-[13px]">
                      {e.year} · {e.label}
                    </Text>
                    <Text className="text-ink-3 text-[11px] font-sansMd">
                      {e.impactUsd >= 0 ? "+" : ""}
                      {formatForecastUsd(e.impactUsd)}
                      {e.savingsMultiplier ? ` · save ×${e.savingsMultiplier}` : ""}
                      {e.monthlySavingsOverride === 0 ? " · pause savings" : ""}
                    </Text>
                  </View>
                  <Pressable onPress={() => removeEvent(e.year)} hitSlop={8}>
                    <Icon name="close" size={14} color="#8C988F" sw={2} />
                  </Pressable>
                </View>
              ))}
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mt-3 mb-2">
                Add event
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {FORECAST_EVENT_TEMPLATES.map((t, i) => (
                  <Pressable
                    key={t.label}
                    onPress={() => addEventTemplate(i)}
                    className="px-2.5 py-1.5 rounded-full bg-bg-surface2 border border-line"
                  >
                    <Text className="text-ink-2 text-[11px] font-sansMd">{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </Card>

        <Card pad={16} className="mb-4">
          <Text className="text-ink font-sansBold text-[15px] mb-4">Assumptions</Text>

          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
            Starting net worth
          </Text>
          <SliderField
            value={Math.round(values.currentNetWorth / 1000)}
            onChange={(k) => patch({ currentNetWorth: k * 1000 })}
            min={0}
            max={500}
            step={5}
            lowLabel="$0"
            highLabel="$500k"
            formatValue={(k) => formatForecastUsd(k * 1000)}
          />

          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2 mt-5">
            Retirement age
          </Text>
          <SliderField
            value={values.retirementAge}
            onChange={(v) => patch({ retirementAge: v })}
            min={50}
            max={75}
            lowLabel="Earlier"
            highLabel="Later"
            formatValue={(v) => `Age ${v}`}
          />

          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2 mt-5">
            Expected return (before tax)
          </Text>
          <SliderField
            value={values.annualReturnPct}
            onChange={(v) => patch({ annualReturnPct: v })}
            min={3}
            max={10}
            step={1}
            lowLabel="3%"
            highLabel="10%"
            formatValue={(v) => `${v}%`}
          />

          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2 mt-5">
            Monthly savings (while working)
          </Text>
          <SliderField
            value={values.monthlySavings}
            onChange={(v) => patch({ monthlySavings: v })}
            min={0}
            max={5000}
            step={50}
            lowLabel="$0"
            highLabel="$5k"
            formatValue={(v) => `$${v.toLocaleString()}`}
          />

          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2 mt-5">
            Effective tax drag on growth
          </Text>
          <SliderField
            value={values.effectiveTaxRatePct}
            onChange={(v) => patch({ effectiveTaxRatePct: v })}
            min={0}
            max={40}
            step={1}
            lowLabel="0%"
            highLabel="40%"
            formatValue={(v) => `${v}%`}
          />

          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2 mt-5">
            Monthly burn (retirement)
          </Text>
          <SliderField
            value={values.monthlyBurn}
            onChange={(v) => patch({ monthlyBurn: v })}
            min={2000}
            max={10000}
            step={100}
            lowLabel="$2k"
            highLabel="$10k"
            formatValue={(v) => `$${v.toLocaleString()}`}
          />
        </Card>

        <Card pad={16} className="mb-4">
          <View className="flex-row flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
            {peak && (
              <Text className="text-ink font-sansBold text-[16px]">
                Peak {formatForecastUsd(peak.netWorth)}
                <Text className="text-ink-3 text-[13px] font-sansMd"> · {peak.year}</Text>
              </Text>
            )}
            {peakDelta !== 0 && (
              <Text
                className={`text-[13px] font-sansBold ${peakDelta > 0 ? "text-pos" : "text-neg"}`}
              >
                {peakDelta > 0 ? "+" : ""}
                {formatForecastUsd(peakDelta)} vs default
              </Text>
            )}
          </View>
          <ForecastChart
            points={projection}
            baselinePoints={showBaseline ? baselineProjection : undefined}
            retirementYear={retirementYear}
            eventYears={eventYears}
            revision={chartRevision}
          />
          <View className="flex-row flex-wrap gap-2 mt-3">
            {events.map((e) => (
              <View key={e.year} className="px-2 py-1 rounded-[8px] bg-bg-surface2">
                <Text className="text-ink-3 text-[10px] font-sansMd">
                  {e.year} · {e.label}
                </Text>
              </View>
            ))}
            <View className="px-2 py-1 rounded-[8px] bg-brand-bg">
              <Text className="text-brand text-[10px] font-sansMd">
                {retirementYear} · Retire
              </Text>
            </View>
          </View>
          <Text className="text-ink-3 text-[11px] font-sansMd mt-3">
            Horizon through {endYear} · age {currentAge} today
          </Text>
        </Card>

        <Button
          label="Ask CFO about this scenario"
          fullWidth
          onPress={() =>
            router.push({
              pathname: "/ask/chat",
              params: { seed: cfoPrompt },
            } as never)
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

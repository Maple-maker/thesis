import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/Icon";
import { PromptWithTermHelp, TermHelpBubble } from "@/components/education/TermHelpBubble";
import { TargetNetWorthHint } from "@/components/onboarding/TargetNetWorthHint";
import { UsStatePicker } from "@/components/onboarding/UsStatePicker";
import type { ChoiceOption } from "@/data/questionnaire";
import { SliderField } from "@/components/ui/SliderField";
import { Button } from "@/components/ui/Button";
import { IconBtn } from "@/components/ui/IconBtn";
import { Bar } from "@/components/ui/Progress";
import { Screen } from "@/components/ui/Screen";
import {
  THESIS_BUILDER_CHAPTERS,
  type BuilderQuestion,
} from "@/data/thesis-builder-chapters";
import { getProfileValue } from "@/lib/cfo-profile-path";
import { generateThemes } from "@/lib/theme-engine";
import { useStore } from "@/store";

const REQUIRED_PATHS = new Set([
  "age",
  "extended.identity.stateProvince",
  "netInvestable",
  "monthlyContribution",
  "hasEmergencyFund",
  "hasHighInterestDebt",
  "primaryGoal",
  "horizon",
  "targetReturn",
  "risk",
  "reactionToDrawdown",
  "experience",
  "incomeNeed",
]);

function isAnswered(q: BuilderQuestion, v: unknown): boolean {
  if (!REQUIRED_PATHS.has(q.path) && q.path.startsWith("extended.")) {
    if (q.kind === "text") return true;
    if (q.kind === "scale") return typeof v === "number" && !Number.isNaN(v);
    if (q.kind === "multichoice") return true;
    if (v === undefined || v === null || v === "") return true;
  }
  if (q.kind === "multichoice") {
    const min = q.min ?? 0;
    return Array.isArray(v) && v.length >= min;
  }
  if (q.kind === "number") return typeof v === "number" && !Number.isNaN(v);
  if (q.kind === "bool") return typeof v === "boolean";
  if (q.kind === "scale") return typeof v === "number" && !Number.isNaN(v);
  if (q.kind === "text") return typeof v === "string" && v.trim().length > 0;
  if (q.kind === "us-state") return typeof v === "string" && v.length === 2;
  return v !== undefined && v !== null && v !== "";
}

export default function StepScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ index: string }>();
  const idx = Math.max(
    0,
    Math.min(THESIS_BUILDER_CHAPTERS.length - 1, parseInt(params.index ?? "0", 10) || 0)
  );
  const step = THESIS_BUILDER_CHAPTERS[idx]!;

  const profile = useStore((s) => s.profile);
  const setProfilePath = useStore((s) => s.setProfilePath);
  const markChapterComplete = useStore((s) => s.markChapterComplete);
  const setThemeIds = useStore((s) => s.setThemeIds);

  const isLast = idx === THESIS_BUILDER_CHAPTERS.length - 1;

  const canContinue = useMemo(
    () => step.questions.every((q) => isAnswered(q, getProfileValue(profile, q.path))),
    [profile, step]
  );

  const onNext = () => {
    markChapterComplete(step.id, step.sectionIds);
    if (!isLast) {
      router.push(`/onboarding/step/${idx + 1}`);
      return;
    }
    const { themes } = generateThemes(profile, 5);
    setThemeIds(themes.map((t) => t.id));
    router.push("/onboarding/reveal");
  };

  return (
    <Screen padded>
      <View className="flex-row items-center justify-between pt-1 pb-4">
        <IconBtn name="back" onPress={() => router.back()} sw={2.2} />
        <Text className="text-ink-2 text-[13px] font-sansBold">
          Chapter {idx + 1} of {THESIS_BUILDER_CHAPTERS.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <Bar pct={(idx + 1) / THESIS_BUILDER_CHAPTERS.length} color="brand" height={5} />

      <View className="mt-6 mb-4">
        <Text className="text-ink text-[27px] font-displayX" style={{ letterSpacing: -0.5, lineHeight: 31 }}>
          {step.title}
        </Text>
        <Text className="text-ink-2 text-[15px] font-sansMd mt-2 leading-[22px]">{step.subtitle}</Text>
      </View>

      <View className="gap-y-6 mt-2">
        {step.questions.map((q) => (
          <QuestionView
            key={q.path}
            q={q}
            profile={profile}
            value={getProfileValue(profile, q.path)}
            onChange={(v) => {
              setProfilePath(q.path, v);
              if (q.path === "extended.identity.stateProvince" && typeof v === "string") {
                setProfilePath("extended.tax.stateTaxResidency", v);
                setProfilePath("extended.tax.countryTaxResidency", "US");
              }
              if (q.path === "risk" && typeof v === "string") {
                const presets: Record<string, { dd: number; sleep: number }> = {
                  "very-low": { dd: 10, sleep: 5 },
                  low: { dd: 20, sleep: 10 },
                  medium: { dd: 30, sleep: 20 },
                  high: { dd: 40, sleep: 30 },
                  "very-high": { dd: 50, sleep: 40 },
                };
                const preset = presets[v];
                if (preset) {
                  setProfilePath("extended.risk.maximumAcceptableDrawdown", preset.dd);
                  setProfilePath("extended.risk.sleepAtNightThreshold", preset.sleep);
                }
              }
              if (q.path === "targetReturn" && typeof v === "string") {
                const presets: Record<string, { growth: number; income: number; preservation: number; incomeNeed: string }> = {
                  conservative: { growth: 2, income: 7, preservation: 9, incomeNeed: "some" },
                  moderate: { growth: 6, income: 5, preservation: 5, incomeNeed: "some" },
                  aggressive: { growth: 9, income: 2, preservation: 2, incomeNeed: "none" },
                };
                const preset = presets[v];
                if (preset) {
                  setProfilePath("extended.construction.growthFocus", preset.growth);
                  setProfilePath("extended.construction.incomeFocus", preset.income);
                  setProfilePath("extended.construction.capitalPreservationFocus", preset.preservation);
                  setProfilePath("incomeNeed", preset.incomeNeed);
                }
              }
            }}
          />
        ))}
      </View>

      <View className="mt-10 mb-2">
        <Button
          label={isLast ? "Make Your Thesis" : "Continue"}
          fullWidth
          size="lg"
          disabled={!canContinue}
          onPress={onNext}
        />
      </View>
    </Screen>
  );
}

function QuestionView({
  q,
  profile,
  value,
  onChange,
}: {
  q: BuilderQuestion;
  profile: ReturnType<typeof useStore.getState>["profile"];
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const monthlyBurn = getProfileValue(profile, "extended.expenses.monthlyExpenses");
  return (
    <View>
      <PromptWithTermHelp prompt={q.prompt} termId={"termId" in q ? q.termId : undefined} help={q.help} />
      {q.kind === "choice" && (
        <ChoiceList options={q.options} selected={value} onSelect={onChange} multi={false} />
      )}
      {q.kind === "multichoice" && (
        <ChoiceList
          options={q.options}
          selected={value ?? []}
          onSelect={(v) => {
            const arr = Array.isArray(value) ? value : [];
            if (arr.includes(v)) onChange(arr.filter((x) => x !== v));
            else {
              if (q.max && arr.length >= q.max) return;
              onChange([...arr, v]);
            }
          }}
          multi
        />
      )}
      {q.kind === "bool" && (
        <View className="flex-row gap-x-3">
          <ChoicePill label="Yes" selected={value === true} onPress={() => onChange(true)} />
          <ChoicePill label="No" selected={value === false} onPress={() => onChange(false)} />
        </View>
      )}
      {q.kind === "number" && (
        <>
          <NumberInput
            placeholder={q.placeholder}
            value={value}
            onChange={onChange}
            min={q.min}
            max={q.max}
            integerOnly={q.path === "age" || q.path === "extended.goals.retirementAgeGoal"}
          />
          {q.path === "extended.goals.targetNetWorth" && (
            <TargetNetWorthHint
              monthlyBurn={
                typeof monthlyBurn === "number" && !Number.isNaN(monthlyBurn)
                  ? monthlyBurn
                  : undefined
              }
              currentTarget={
                typeof value === "number" && !Number.isNaN(value) ? value : undefined
              }
              onApplyTarget={onChange}
            />
          )}
        </>
      )}
      {q.kind === "us-state" && (
        <UsStatePicker
          value={typeof value === "string" ? value : undefined}
          onChange={onChange}
        />
      )}
      {q.kind === "text" && (
        <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3">
          <TextInput
            value={typeof value === "string" ? value : ""}
            onChangeText={onChange}
            placeholder={q.placeholder}
            placeholderTextColor="#8C988F"
            className="text-ink text-[15px] font-sansMd"
            multiline
          />
        </View>
      )}
      {q.kind === "scale" && (
        <SliderField
          value={
            typeof value === "number" && !Number.isNaN(value)
              ? value
              : Math.round(((q.min ?? 1) + (q.max ?? 10)) / 2)
          }
          onChange={onChange}
          min={q.min ?? 1}
          max={q.max ?? 10}
          step={1}
          lowLabel={q.lowLabel}
          highLabel={q.highLabel}
          formatValue={
            q.path.includes("Drawdown") || q.path.includes("Threshold")
              ? (v) => `-${v}%`
              : q.path.includes("savingsRate")
                ? (v) => `${v}% saved`
                : undefined
          }
        />
      )}
    </View>
  );
}

function ChoiceList({
  options,
  selected,
  onSelect,
  multi,
}: {
  options: ChoiceOption<unknown>[];
  selected: unknown;
  onSelect: (v: unknown) => void;
  multi: boolean;
}) {
  const isSelected = (v: unknown) =>
    multi ? Array.isArray(selected) && selected.includes(v) : selected === v;

  return (
    <View className="gap-y-2.5">
      {options.map((opt) => {
        const on = isSelected(opt.value);
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onSelect(opt.value)}
            className={`px-4 py-3.5 rounded-[14px] border ${
              on ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-2">
                  <Text
                    className={`text-[15px] flex-shrink ${on ? "text-ink font-sansBold" : "text-ink font-sansSb"}`}
                  >
                    {opt.label}
                  </Text>
                  <TermHelpBubble termId={opt.termId} text={opt.label} />
                </View>
                {opt.hint ? (
                  <Text className="text-ink-3 text-[12px] font-sansMd mt-1 leading-[16px]">
                    {opt.hint}
                  </Text>
                ) : null}
              </View>
              <View
                className={`h-6 w-6 rounded-full items-center justify-center border-2 ${
                  on ? "bg-brand border-brand" : "border-line-strong"
                }`}
              >
                {on ? <Icon name="check" size={14} sw={2.6} color="#FFFFFF" /> : null}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function ChoicePill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 px-4 py-4 rounded-[14px] border items-center ${
        selected ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
      }`}
    >
      <Text className={`text-[15px] ${selected ? "text-ink font-sansBold" : "text-ink font-sansSb"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  integerOnly,
}: {
  value: unknown;
  onChange: (v: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  integerOnly?: boolean;
}) {
  const displayValue =
    typeof value === "number" && !Number.isNaN(value) ? String(value) : "";

  return (
    <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3">
      <TextInput
        keyboardType="number-pad"
        value={displayValue}
        onChangeText={(t) => {
          const pattern = integerOnly ? /[^0-9]/g : /[^0-9.]/g;
          const cleaned = t.replace(pattern, "");
          if (cleaned === "") {
            onChange(NaN);
            return;
          }
          const n = parseFloat(cleaned);
          if (Number.isNaN(n)) {
            onChange(NaN);
            return;
          }
          onChange(n);
        }}
        onEndEditing={() => {
          if (typeof value === "number" && !Number.isNaN(value)) {
            let clamped = value;
            if (typeof min === "number") clamped = Math.max(min, clamped);
            if (typeof max === "number") clamped = Math.min(max, clamped);
            if (clamped !== value) onChange(clamped);
          }
        }}
        placeholder={placeholder}
        placeholderTextColor="#8C988F"
        className="text-ink text-[17px] font-sansSb"
      />
    </View>
  );
}

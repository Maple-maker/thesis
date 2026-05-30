import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { IconBtn } from "@/components/ui/IconBtn";
import { Bar } from "@/components/ui/Progress";
import { Screen } from "@/components/ui/Screen";
import { STEPS, type QuestionDef } from "@/data/questionnaire";
import { generateThemes } from "@/lib/theme-engine";
import { useStore } from "@/store";

export default function StepScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ index: string }>();
  const idx = Math.max(0, Math.min(STEPS.length - 1, parseInt(params.index ?? "0", 10) || 0));
  const step = STEPS[idx];

  const profile = useStore((s) => s.profile);
  const setProfileField = useStore((s) => s.setProfileField);
  const setThemeIds = useStore((s) => s.setThemeIds);

  const isLast = idx === STEPS.length - 1;

  const canContinue = useMemo(() => {
    return step.questions.every((q) => {
      const v = profile[q.id] as unknown;
      if (q.kind === "multichoice") {
        const min = q.min ?? 0;
        return Array.isArray(v) && v.length >= min;
      }
      if (q.kind === "number") return typeof v === "number" && !Number.isNaN(v);
      if (q.kind === "bool") return typeof v === "boolean";
      return v !== undefined && v !== null && v !== ("" as unknown);
    });
  }, [profile, step]);

  const onNext = () => {
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
      {/* top row */}
      <View className="flex-row items-center justify-between pt-1 pb-4">
        <IconBtn name="back" onPress={() => router.back()} sw={2.2} />
        <Text className="text-ink-2 text-[13px] font-sansBold">
          Step {idx + 1} of {STEPS.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <Bar pct={(idx + 1) / STEPS.length} color="brand" height={5} />

      <View className="mt-6 mb-4">
        <Text
          className="text-ink text-[27px] font-displayX"
          style={{ letterSpacing: -0.5, lineHeight: 31 }}
        >
          {step.title}
        </Text>
        <Text className="text-ink-2 text-[15px] font-sansMd mt-2 leading-[22px]">
          {step.subtitle}
        </Text>
      </View>

      <View className="gap-y-6 mt-2">
        {step.questions.map((q) => (
          <QuestionView
            key={q.id}
            q={q}
            value={profile[q.id]}
            onChange={(v) => setProfileField(q.id, v as any)}
          />
        ))}
      </View>

      <View className="mt-10 mb-2">
        <Button
          label={isLast ? "Build my themes" : "Continue"}
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
  value,
  onChange,
}: {
  q: QuestionDef;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <View>
      <Text className="text-ink text-[16px] font-sansBold mb-1">{q.prompt}</Text>
      {q.help ? (
        <Text className="text-ink-3 text-[13px] font-sansMd mb-3 leading-[18px]">
          {q.help}
        </Text>
      ) : (
        <View className="mb-3" />
      )}
      {q.kind === "choice" && (
        <ChoiceList
          options={q.options}
          selected={value}
          onSelect={onChange}
          multi={false}
        />
      )}
      {q.kind === "multichoice" && (
        <ChoiceList
          options={q.options}
          selected={value ?? []}
          onSelect={(v) => {
            const arr = Array.isArray(value) ? value : [];
            if (arr.includes(v)) {
              onChange(arr.filter((x: any) => x !== v));
            } else {
              if (q.max && arr.length >= q.max) return;
              onChange([...arr, v]);
            }
          }}
          multi
        />
      )}
      {q.kind === "bool" && (
        <View className="flex-row gap-x-3">
          <ChoicePill
            label="Yes"
            selected={value === true}
            onPress={() => onChange(true)}
          />
          <ChoicePill
            label="No"
            selected={value === false}
            onPress={() => onChange(false)}
          />
        </View>
      )}
      {q.kind === "number" && (
        <NumberInput
          placeholder={q.placeholder}
          value={value}
          onChange={onChange}
          min={q.min}
          max={q.max}
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
  options: { value: any; label: string; hint?: string }[];
  selected: any;
  onSelect: (v: any) => void;
  multi: boolean;
}) {
  const isSelected = (v: any) =>
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
            style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text
                  className={`text-[15px] ${
                    on ? "text-ink font-sansBold" : "text-ink font-sansSb"
                  }`}
                >
                  {opt.label}
                </Text>
                {opt.hint ? (
                  <Text className="text-ink-3 text-[12px] font-sansMd mt-1">
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
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <Text
        className={`text-[15px] ${selected ? "text-ink font-sansBold" : "text-ink font-sansSb"}`}
      >
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
}: {
  value: any;
  onChange: (v: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3">
      <TextInput
        keyboardType="number-pad"
        value={value !== undefined && value !== null && !Number.isNaN(value) ? String(value) : ""}
        onChangeText={(t) => {
          const cleaned = t.replace(/[^0-9.]/g, "");
          const n = cleaned === "" ? NaN : parseFloat(cleaned);
          if (Number.isNaN(n)) {
            onChange(NaN as any);
            return;
          }
          let clamped = n;
          if (typeof min === "number") clamped = Math.max(min, clamped);
          if (typeof max === "number") clamped = Math.min(max, clamped);
          onChange(clamped);
        }}
        placeholder={placeholder}
        placeholderTextColor="#8C988F"
        className="text-ink text-[17px] font-sansSb"
      />
    </View>
  );
}

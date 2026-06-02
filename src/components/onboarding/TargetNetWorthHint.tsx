import { Pressable, Text, View } from "react-native";

import {
  formatUsdWhole,
  netWorthTargetsFromMonthlyBurn,
  US_INCOME_CONTEXT,
} from "@/lib/target-net-worth-guide";

type Props = {
  monthlyBurn: number | undefined;
  currentTarget: number | undefined;
  onApplyTarget: (amount: number) => void;
};

export function TargetNetWorthHint({ monthlyBurn, currentTarget, onApplyTarget }: Props) {
  const guide =
    typeof monthlyBurn === "number" && monthlyBurn > 0
      ? netWorthTargetsFromMonthlyBurn(monthlyBurn)
      : null;

  return (
    <View className="rounded-[14px] border border-brand/25 bg-brand-bg/20 px-3.5 py-3.5 mt-2">
      <Text className="text-brand text-[10px] font-sansX uppercase tracking-wider mb-1.5">
        Education · not advice
      </Text>

      {!guide ? (
        <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
          Enter your monthly expenses (burn rate) above first, we will suggest targets based on
          4× and 25× your annual burn.
        </Text>
      ) : (
        <>
          <Text className="text-ink text-[13.5px] font-sansBold leading-[20px]">
            Burn rate = {formatUsdWhole(guide.monthlyBurn)}/mo →{" "}
            {formatUsdWhole(guide.annualBurn)}/yr to live
          </Text>
          <Text className="text-ink-2 text-[12.5px] font-sansMd mt-2 leading-[18px]">
            That is what you spend, not what you earn. Many planners compare goals to{" "}
            <Text className="font-sansBold">multiples of annual burn</Text>, not income alone.
          </Text>

          <View className="mt-3 gap-y-2">
            <SuggestionRow
              title="4× annual burn"
              amount={guide.fourTimesAnnualBurn}
              body="~4 years of lifestyle in net worth, a resilience floor, not full retirement."
              onApply={() => onApplyTarget(guide.fourTimesAnnualBurn)}
              applied={currentTarget === guide.fourTimesAnnualBurn}
            />
            <SuggestionRow
              title="25× annual burn (4% rule)"
              amount={guide.twentyFiveTimesAnnualBurn}
              body="Common long-term target: withdraw ~4% per year in retirement (25 × burn)."
              onApply={() => onApplyTarget(guide.twentyFiveTimesAnnualBurn)}
              applied={currentTarget === guide.twentyFiveTimesAnnualBurn}
              recommended
            />
          </View>
        </>
      )}

      <Text className="text-ink-3 text-[11px] font-sansMd mt-3 leading-[16px]">
        Context: median U.S. household income is about {formatUsdWhole(US_INCOME_CONTEXT.medianHouseholdIncome)}
        /yr; median worker earnings about {formatUsdWhole(US_INCOME_CONTEXT.medianPersonalEarnings)}
        /yr ({US_INCOME_CONTEXT.sourceNote})
      </Text>
    </View>
  );
}

function SuggestionRow({
  title,
  amount,
  body,
  onApply,
  applied,
  recommended,
}: {
  title: string;
  amount: number;
  body: string;
  onApply: () => void;
  applied: boolean;
  recommended?: boolean;
}) {
  return (
    <View className="bg-bg-surface border border-line rounded-[12px] px-3 py-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-ink font-sansBold text-[13px]">
          {title}
          {recommended ? (
            <Text className="text-brand text-[11px] font-sansX"> · suggested</Text>
          ) : null}
        </Text>
        <Text className="text-ink font-monoBold text-[14px]">{formatUsdWhole(amount)}</Text>
      </View>
      <Text className="text-ink-3 text-[11.5px] font-sansMd mt-1 leading-[16px]">{body}</Text>
      <Pressable onPress={onApply} className="mt-2 active:opacity-70">
        <Text className="text-brand text-[12px] font-sansBold">
          {applied ? "Using this target ✓" : `Use ${formatUsdWhole(amount)}`}
        </Text>
      </Pressable>
    </View>
  );
}

import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { AskPromptChip } from "@/lib/ask-prompts";
import { useStore, selectIsPro } from "@/store";

const FREE_DAILY_LIMIT = 5;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  prompts: AskPromptChip[];
};

export function AskThesisCard({ prompts }: Props) {
  const router = useRouter();
  const isPro = useStore(selectIsPro);
  const usageDate = useStore((s) => s.assistantUsageDate);
  const messagesToday = useStore((s) => s.assistantMessagesToday);

  const remaining = isPro ? Infinity : Math.max(0, FREE_DAILY_LIMIT - messagesToday);
  const isToday = usageDate === todayKey();
  const used = isToday ? messagesToday : 0;
  const hasFreeUses = !isPro && remaining > 0;

  // Pro user — full access
  if (isPro) {
    return (
      <Card pad={16} className="mb-4">
        <View className="flex-row items-start mb-3">
          <View className="bg-brand w-[44px] h-[44px] rounded-[14px] items-center justify-center mr-3">
            <Icon name="sparkle" size={22} color="#FFFFFF" sw={2} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-ink font-displayX text-[17px] mr-2">Ask your CFO</Text>
              <Tag label="Pro" tone="brand" />
            </View>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-1 leading-[18px]">
              Profile + linked accounts in every answer, not stock picks.
            </Text>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {prompts.slice(0, 4).map((p) => (
            <Pressable
              key={p.id}
              onPress={() =>
                router.push({
                  pathname: "/ask/chat",
                  params: { seed: p.question },
                } as never)
              }
              className="px-3 py-2 rounded-chip bg-bg-surface2 border border-line active:opacity-70"
            >
              <Text className="text-ink text-[12.5px] font-sansSb">{p.label}</Text>
            </Pressable>
          ))}
        </View>
        <Button
          label="Ask a question"
          fullWidth
          size="md"
          variant="primary"
          onPress={() => router.push("/ask/chat" as any)}
        />
      </Card>
    );
  }

  // Free user with uses remaining
  if (hasFreeUses) {
    return (
      <Card pad={16} className="mb-4 border-brand/20">
        <View className="flex-row items-start mb-2">
          <View className="bg-brand w-[44px] h-[44px] rounded-[14px] items-center justify-center mr-3">
            <Icon name="sparkle" size={22} color="#FFFFFF" sw={2} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-ink font-displayX text-[17px]">AI CFO</Text>
              <Tag label={`${remaining} free left`} tone="brand" />
            </View>
            <Text className="text-ink-2 text-[13px] font-sansMd leading-[18px]">
              {FREE_DAILY_LIMIT} free questions per day. Ask about your portfolio, risk, or retirement planning.
            </Text>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {prompts.slice(0, 4).map((p) => (
            <Pressable
              key={p.id}
              onPress={() =>
                router.push({
                  pathname: "/ask/chat",
                  params: { seed: p.question },
                } as never)
              }
              className="px-3 py-2 rounded-chip bg-bg-surface2 border border-line active:opacity-70"
            >
              <Text className="text-ink text-[12.5px] font-sansSb">{p.label}</Text>
            </Pressable>
          ))}
        </View>
        <Button
          label="Ask a question"
          fullWidth
          size="md"
          variant="primary"
          onPress={() => router.push("/ask/chat" as any)}
        />
        <View className="flex-row items-center mt-3 pt-3 border-t border-line">
          <Text className="text-ink-3 text-[11px] font-sansMd flex-1">
            {used}/{FREE_DAILY_LIMIT} used today
          </Text>
          <Text
            className="text-violet text-[11px] font-sansBold"
            onPress={() => router.push("/pro" as any)}
          >
            Go Pro →
          </Text>
        </View>
      </Card>
    );
  }

  // Free user — out of uses
  return (
    <Card pad={16} className="mb-4 border-amber/30 bg-amber-bg/10">
      <View className="flex-row items-start mb-3">
        <View className="bg-amber w-[44px] h-[44px] rounded-[14px] items-center justify-center mr-3">
          <Icon name="sparkle" size={22} color="#FFFFFF" sw={2} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-ink font-displayX text-[17px] mr-2">AI CFO</Text>
            <Tag label={`${FREE_DAILY_LIMIT}/${FREE_DAILY_LIMIT} used`} tone="amber" />
          </View>
          <Text className="text-ink-2 text-[13px] font-sansMd leading-[18px]">
            You've used all {FREE_DAILY_LIMIT} free questions today. Upgrade for unlimited AI CFO access.
          </Text>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2 mb-4 opacity-40">
        {prompts.slice(0, 3).map((p) => (
          <View key={p.id} className="px-3 py-2 rounded-chip bg-bg-surface2 border border-line">
            <Text className="text-ink-2 text-[12px] font-sansMd">{p.label}</Text>
          </View>
        ))}
      </View>
      <Button
        label="Upgrade to Thesis Pro — unlimited"
        fullWidth
        size="md"
        variant="primary"
        onPress={() => router.push("/pro" as any)}
      />
      <Text className="text-ink-3 text-[10px] font-sansMd text-center mt-2">
        Resets daily · {FREE_DAILY_LIMIT} free per day
      </Text>
    </Card>
  );
}

import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { AskPromptChip } from "@/lib/ask-prompts";
import { useStore, selectIsPro } from "@/store";

type Props = {
  prompts: AskPromptChip[];
};

export function AskThesisCard({ prompts }: Props) {
  const router = useRouter();
  const isPro = useStore(selectIsPro);

  if (!isPro) {
    return (
      <Card pad={16} className="mb-4 border-brand/20">
        <View className="flex-row items-start mb-3">
          <View className="bg-brand w-[44px] h-[44px] rounded-[14px] items-center justify-center mr-3">
            <Icon name="sparkle" size={22} color="#FFFFFF" sw={2} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-ink font-displayX text-[17px] mr-2">AI CFO</Text>
              <Tag label="Pro" tone="violet" />
            </View>
            <Text className="text-ink-2 text-[13px] font-sansMd leading-[18px]">
              Your personalized Chief Financial Officer, unlimited chat with full profile memory.
            </Text>
          </View>
        </View>
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
          Free: suggestions
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {prompts.slice(0, 3).map((p) => (
            <View
              key={p.id}
              className="px-3 py-2 rounded-chip bg-bg-surface2 border border-line"
            >
              <Text className="text-ink-2 text-[12px] font-sansMd">{p.label}</Text>
            </View>
          ))}
        </View>
        <Button
          label="Upgrade to Thesis Pro"
          fullWidth
          size="md"
          variant="primary"
          onPress={() => router.push("/pro" as any)}
        />
      </Card>
    );
  }

  return (
    <Card pad={16} className="mb-4">
      <View className="flex-row items-start mb-3">
        <View className="bg-brand w-[44px] h-[44px] rounded-[14px] items-center justify-center mr-3">
          <Icon name="sparkle" size={22} color="#FFFFFF" sw={2} />
        </View>
        <View className="flex-1">
          <Text className="text-ink font-displayX text-[17px]">Ask your CFO</Text>
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

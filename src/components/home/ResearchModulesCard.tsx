import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { ResearchModule } from "@/data/research-modules";
import {
  actionHintForModule,
  hrefForResearchModule,
  type ResearchModuleContext,
} from "@/lib/research-module-routes";
import type { ThemeId } from "@/store/types";

type Props = {
  modules: ResearchModule[];
  themeIds: ThemeId[];
  hasHoldings: boolean;
};

export function ResearchModulesCard({ modules, themeIds, hasHoldings }: Props) {
  const router = useRouter();
  const ctx: ResearchModuleContext = { themeIds, hasHoldings };

  if (!modules.length) return null;

  return (
    <View className="mb-6">
      <SectionTitle>Quick actions</SectionTitle>
      <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px] mb-3 -mt-2">
        Tap to open, each goes to a real tool in the app.
      </Text>
      <Card pad={0}>
        {modules.map((m, i) => {
          const hint = actionHintForModule(m, ctx);
          return (
            <Pressable
              key={m.id}
              onPress={() => router.push(hrefForResearchModule(m.id, ctx) as never)}
              className={`flex-row items-center px-4 py-3.5 active:opacity-70 ${
                i < modules.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <View className="flex-1 pr-2">
                <Text className="text-ink font-sansBold text-[15px]">{m.title}</Text>
                <Text className="text-ink-2 text-[13px] font-sansMd mt-0.5 leading-[18px]">
                  {m.subtitle}
                </Text>
                {hint ? (
                  <Text className="text-brand text-[11px] font-sansSb mt-1">{hint}</Text>
                ) : null}
              </View>
              <Icon name="chev" size={16} color="#8C988F" sw={2} />
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}

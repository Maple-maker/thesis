import { Alert, Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import {
  financialTermById,
  financialTermForText,
  type FinancialTermDef,
} from "@/data/financial-term-definitions";

type Props = {
  /** Explicit glossary id */
  termId?: string;
  /** Or match from label / prompt text */
  text?: string;
  size?: "sm" | "md";
};

function resolveTerm(termId?: string, text?: string): FinancialTermDef | undefined {
  if (termId) return financialTermById(termId);
  if (text) return financialTermForText(text);
  return undefined;
}

export function TermHelpBubble({ termId, text, size = "sm" }: Props) {
  const def = resolveTerm(termId, text);
  if (!def) return null;

  const dim = size === "md" ? 22 : 20;

  const onPress = () => {
    Alert.alert(
      def.term,
      [def.definition, def.example ? `\n\nExample: ${def.example}` : ""].join(""),
      [{ text: "Got it", style: "default" }]
    );
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={`What is ${def.term}?`}
      className="active:opacity-70"
    >
      <View
        className="rounded-full bg-brand-bg border border-brand/30 items-center justify-center"
        style={{ width: dim, height: dim }}
      >
        <Text className="text-brand text-[12px] font-sansBold">?</Text>
      </View>
    </Pressable>
  );
}

/** Prompt row with optional ? bubble */
export function PromptWithTermHelp({
  prompt,
  termId,
  help,
}: {
  prompt: string;
  termId?: string;
  help?: string;
}) {
  const def = resolveTerm(termId, prompt);
  return (
    <View className="mb-3">
      <View className="flex-row items-start gap-2">
        <Text className="text-ink text-[16px] font-sansBold flex-1">{prompt}</Text>
        {def ? <TermHelpBubble termId={def.id} /> : null}
      </View>
      {help ? (
        <Text className="text-ink-3 text-[13px] font-sansMd mt-1 leading-[18px]">{help}</Text>
      ) : null}
    </View>
  );
}

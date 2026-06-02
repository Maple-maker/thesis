import { Pressable, Text, View } from "react-native";

import {
  entityKindLabel,
  parseMessageSegments,
  type EntityKind,
  type MessageEntity,
} from "@/lib/message-entities";
import type { ConceptId } from "@/data/concepts";

type Props = {
  content: string;
  onConceptPress: (id: ConceptId) => void;
  onSymbolPress: (symbol: string, kind: EntityKind) => void;
};

/** CFO reply with tappable glossary terms, stocks, and ETFs. */
export function InteractiveMessageText({ content, onConceptPress, onSymbolPress }: Props) {
  const blocks = content.split(/\n\n+/);

  return (
    <View className="gap-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => !l.trim() || /^[-•]\s/.test(l.trim()));

        if (isList && lines.some((l) => /^[-•]\s/.test(l.trim()))) {
          return (
            <View key={bi} className="gap-y-1.5">
              {lines
                .filter((l) => l.trim())
                .map((line, li) => (
                  <View key={li} className="flex-row">
                    <Text className="text-[14.5px] font-sansMd leading-[21px] text-ink mr-2">•</Text>
                    <View className="flex-1">
                      <InteractiveLine
                        text={line.replace(/^[-•]\s*/, "")}
                        onConceptPress={onConceptPress}
                        onSymbolPress={onSymbolPress}
                      />
                    </View>
                  </View>
                ))}
            </View>
          );
        }

        return (
          <InteractiveLine
            key={bi}
            text={block}
            onConceptPress={onConceptPress}
            onSymbolPress={onSymbolPress}
          />
        );
      })}
      <Text className="text-ink-3 text-[10px] font-sansMd mt-1">
        Tap highlighted terms to learn · tickers to view or duel
      </Text>
    </View>
  );
}

function InteractiveLine({
  text,
  onConceptPress,
  onSymbolPress,
}: {
  text: string;
  onConceptPress: (id: ConceptId) => void;
  onSymbolPress: (symbol: string, kind: EntityKind) => void;
}) {
  const segments = parseMessageSegments(text);

  return (
    <View className="flex-row flex-wrap items-center">
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return (
            <Text
              key={i}
              className="text-[14.5px] font-sansMd leading-[21px] text-ink"
            >
              <BoldChunks text={seg.value} />
            </Text>
          );
        }
        return (
          <EntityLink
            key={`${seg.entity.start}-${i}`}
            entity={seg.entity}
            onConceptPress={onConceptPress}
            onSymbolPress={onSymbolPress}
          />
        );
      })}
    </View>
  );
}

function EntityLink({
  entity,
  onConceptPress,
  onSymbolPress,
}: {
  entity: MessageEntity;
  onConceptPress: (id: ConceptId) => void;
  onSymbolPress: (symbol: string, kind: EntityKind) => void;
}) {
  const isSymbol = entity.kind === "stock" || entity.kind === "etf";

  return (
    <Pressable
      onPress={() => {
        if (entity.kind === "concept") {
          onConceptPress(entity.key as ConceptId);
        } else {
          onSymbolPress(entity.key, entity.kind);
        }
      }}
      className="active:opacity-70"
      style={{ marginRight: 2, marginBottom: 2 }}
    >
      <Text
        className={`text-[14.5px] font-sansBold leading-[21px] ${
          isSymbol ? "text-violet" : "text-brand"
        }`}
        style={{
          textDecorationLine: "underline",
          textDecorationColor: isSymbol ? "#7C3AED" : "#0E7A66",
        }}
      >
        {entity.label}
        {isSymbol ? ` · ${entityKindLabel(entity.kind)}` : ""}
      </Text>
    </Pressable>
  );
}

function BoldChunks({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} className="font-sansBold">
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </>
  );
}

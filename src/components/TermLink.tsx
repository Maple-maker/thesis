import { type ReactNode } from "react";
import { Pressable, Text } from "react-native";

import type { ConceptId } from "@/data/concepts";
import { useExplain } from "@/hooks/use-explain";

type Props = {
  conceptId: ConceptId;
  children?: ReactNode;
  textSize?: number;
};

/**
 * Inline tappable term that opens ExplainSheet for the given concept.
 * If no children, renders concept.term. Requires ExplainProvider ancestor.
 */
export function TermLink({ conceptId, children, textSize = 14 }: Props) {
  const { openConcept } = useExplain();

  return (
    <Pressable onPress={() => openConcept(conceptId)}>
      <Text
        className="text-brand font-sansSb"
        style={{
          fontSize: textSize,
          textDecorationLine: "underline",
          textDecorationColor: "rgba(14,122,102,0.3)",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

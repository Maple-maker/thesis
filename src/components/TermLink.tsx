import { type ReactNode } from "react";
import { Text } from "react-native";

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
    <Text
      className="text-brand font-sansSb"
      onPress={() => openConcept(conceptId)}
      style={{
        fontSize: textSize,
        textDecorationLine: "underline",
        textDecorationColor: "rgba(14,122,102,0.3)",
      }}
      accessibilityRole="link"
    >
      {children}
    </Text>
  );
}

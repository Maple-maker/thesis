import { useCallback, useState } from "react";
import type { ConceptId } from "@/data/concepts";

type ExplainSheetProps = {
  conceptId: ConceptId | null;
  visible: boolean;
  onClose: () => void;
  onSelectRelated?: (id: ConceptId) => void;
};

export function useExplainSheet() {
  const [conceptId, setConceptId] = useState<ConceptId | null>(null);
  const [visible, setVisible] = useState(false);

  const openConcept = useCallback((id: ConceptId) => {
    setConceptId(id);
    setVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setVisible(false);
  }, []);

  const sheetProps: ExplainSheetProps = {
    conceptId,
    visible,
    onClose: closeSheet,
    onSelectRelated: (id) => {
      setConceptId(id);
      setVisible(true);
    },
  };

  return { openConcept, closeSheet, sheetProps };
}

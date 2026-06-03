import { createContext, useCallback, useContext, useState } from "react";

import { ExplainSheet } from "@/components/ExplainSheet";
import type { ConceptId } from "@/data/concepts";

type ExplainContextValue = {
  openConcept: (id: ConceptId) => void;
  conceptId: ConceptId | null;
  visible: boolean;
  onClose: () => void;
};

const ExplainContext = createContext<ExplainContextValue | null>(null);

export function ExplainProvider({ children }: { children: React.ReactNode }) {
  const [conceptId, setConceptId] = useState<ConceptId | null>(null);
  const [visible, setVisible] = useState(false);

  const openConcept = useCallback((id: ConceptId) => {
    setConceptId(id);
    setVisible(true);
  }, []);

  const onClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ExplainContext.Provider value={{ openConcept, conceptId, visible, onClose }}>
      {children}
      <ExplainSheet
        conceptId={conceptId}
        visible={visible}
        onClose={onClose}
        onSelectRelated={openConcept}
      />
    </ExplainContext.Provider>
  );
}

export function useExplain(): Pick<ExplainContextValue, "openConcept"> {
  const ctx = useContext(ExplainContext);
  if (!ctx) throw new Error("useExplain must be used within ExplainProvider");
  return ctx;
}

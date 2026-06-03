import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import type { ConceptId } from "@/data/concepts";
import { signalsForSymbol, SIGNAL_DISCLAIMER, type StockSignal } from "@/data/stock-signals";

const SEVERITY_CONFIG: Record<
  StockSignal["severity"],
  { icon: "info" | "bolt" | "shield"; color: string; bg: string; label: string }
> = {
  info: { icon: "info", color: "#0E7A66", bg: "#E5F5EC", label: "Note" },
  notice: { icon: "bolt", color: "#D98512", bg: "#FCF1E0", label: "Heads up" },
  caution: { icon: "shield", color: "#7C3AED", bg: "#F2ECFD", label: "Watch" },
};

function SignalRow({
  signal,
  onConceptPress,
}: {
  signal: StockSignal;
  onConceptPress?: (id: ConceptId) => void;
}) {
  const cfg = SEVERITY_CONFIG[signal.severity];

  return (
    <View className="mb-3 last:mb-0">
      <View className="flex-row items-center gap-1.5 mb-1">
        <View className="w-[20px] h-[20px] rounded-[6px] items-center justify-center" style={{ backgroundColor: cfg.bg }}>
          <Icon name={cfg.icon} size={11} color={cfg.color} sw={2.2} />
        </View>
        <Text className="text-ink text-[12px] font-sansBold flex-1">{signal.title}</Text>
        <Text className="text-ink-3 text-[9px] font-sansMd uppercase">{cfg.label}</Text>
      </View>
      <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px] ml-[26px]">
        {signal.fact}
      </Text>
      {signal.context && (
        <Text className="text-ink-3 text-[12px] font-sansMd leading-[17px] ml-[26px] mt-1">
          {signal.context}
          {signal.conceptIds?.map((c) => (
            <Text key={c}> </Text>
          ))}
        </Text>
      )}
      {signal.conceptIds && signal.conceptIds.length > 0 && onConceptPress && (
        <View className="flex-row flex-wrap gap-1.5 ml-[26px] mt-1.5">
          {signal.conceptIds.map((cid) => (
            <Pressable
              key={cid}
              onPress={() => onConceptPress(cid)}
              className="px-2 py-0.5 rounded-[6px] bg-brand-bg active:opacity-70"
            >
              <Text className="text-brand text-[10px] font-sansBold">{cid.replace("-", " ")}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function StockSignalsCard({
  symbol,
  onConceptPress,
}: {
  symbol: string;
  onConceptPress?: (id: ConceptId) => void;
}) {
  const signals = signalsForSymbol(symbol);
  if (signals.length === 0) return null;

  return (
    <Card pad={16} className="mb-4">
      <View className="flex-row items-center mb-3">
        <Icon name="bolt" size={15} color="#0E7A66" sw={2} />
        <Text className="text-ink text-[13px] font-sansX uppercase tracking-wider ml-1.5">
          Signals to know
        </Text>
      </View>
      <Text className="text-ink-2 text-[12px] font-sansMd mb-3 leading-[16px]">
        Due diligence notes for {symbol} — things a careful reader would notice.
      </Text>
      {signals.map((s) => (
        <SignalRow key={s.id} signal={s} onConceptPress={onConceptPress} />
      ))}
      <Text className="text-ink-3 text-[9.5px] font-sansMd mt-3 text-center leading-[13px]">
        {SIGNAL_DISCLAIMER}
      </Text>
    </Card>
  );
}

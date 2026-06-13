import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { financialsForSymbol } from "@/data/stock-financials";
import { STOCKS, stockBySymbol } from "@/data/stocks";
import { syncToCloud } from "@/lib/sync";
import type { ConvictionReason, Stock, ThemeId } from "@/store/types";
import { useStore } from "@/store";

const CONVICTION_REASONS: {
  id: ConvictionReason;
  label: string;
  icon: IconName;
}[] = [
  { id: "long-term-growth", label: "I believe in the long-term growth story", icon: "trend" },
  { id: "fits-my-thesis", label: "It fits my thesis theme", icon: "target" },
  { id: "valuation", label: "The valuation looks compelling", icon: "compare" },
  { id: "gut-feeling", label: "Gut feeling / momentum", icon: "flame" },
  { id: "following-someone", label: "Following someone I respect", icon: "profile" },
  { id: "income-yield", label: "I want the dividend income", icon: "piggy" },
  { id: "diversification", label: "Portfolio diversification", icon: "grid" },
];

type Props = {
  visible: boolean;
  /** Symbols to gate, one at a time — single add or a lens's model holdings. */
  symbols: string[];
  /** Investor lens id when this add came from "copy a lens". */
  sourceLens?: string;
  onClose: () => void;
  /** Fired after the last symbol in the queue is added. */
  onComplete?: () => void;
};

/**
 * The conviction gate — every portfolio add states a reason first.
 * Educational friction, not validation: the nudge shows the user what
 * they're accepting, never praises the pick.
 */
export function ConvictionGate({
  visible,
  symbols,
  sourceLens,
  onClose,
  onComplete,
}: Props) {
  const addHolding = useStore((s) => s.addHolding);
  const themeIds = useStore((s) => s.themeIds);
  const portfolio = useStore((s) => s.portfolio);

  const [queueIndex, setQueueIndex] = useState(0);
  const [reason, setReason] = useState<ConvictionReason | null>(null);
  const [note, setNote] = useState("");

  const symbol = symbols[queueIndex];
  const stock = symbol ? stockBySymbol(symbol) : undefined;

  const nudge = useMemo(
    () => (reason && stock ? nudgeFor(reason, stock, themeIds, portfolio.map((h) => h.symbol)) : null),
    [reason, stock, themeIds, portfolio]
  );

  const reset = () => {
    setQueueIndex(0);
    setReason(null);
    setNote("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onConfirm = () => {
    if (!reason || !symbol) return;
    addHolding({
      symbol,
      reason,
      note: note.trim(),
      sourceLens,
    });
    void syncToCloud();
    if (queueIndex + 1 < symbols.length) {
      setQueueIndex(queueIndex + 1);
      setReason(null);
      setNote("");
      return;
    }
    reset();
    onComplete?.();
    onClose();
  };

  if (!visible || !symbol) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(22,32,28,0.45)" }}>
        <Pressable className="flex-1" onPress={handleClose} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View
            className="bg-bg-surface rounded-t-[24px] px-5 pt-5"
            style={{ maxHeight: 640, paddingBottom: 34 }}
          >
            {/* Grab handle */}
            <View className="items-center mb-4">
              <View className="w-10 h-1 rounded-full bg-line-strong" />
            </View>

            {/* Stock header */}
            <View className="flex-row items-center mb-1">
              <View className="flex-1">
                <View className="flex-row items-center gap-x-2">
                  <Text className="text-ink font-monoBold text-[18px]">{symbol}</Text>
                  {stock && (
                    <Tag
                      label={`${stock.volatility} vol`}
                      tone={stock.volatility === "high" ? "amber" : "default"}
                    />
                  )}
                </View>
                {stock && (
                  <Text className="text-ink-2 text-[13px] font-sansMd mt-0.5">
                    {stock.name}
                  </Text>
                )}
              </View>
              {symbols.length > 1 && (
                <Text className="text-ink-3 text-[12px] font-sansBold">
                  {queueIndex + 1} of {symbols.length}
                </Text>
              )}
            </View>

            <Text
              className="text-ink font-displayX text-[22px] mt-3 mb-3"
              style={{ letterSpacing: -0.4 }}
            >
              Why are you adding {symbol}?
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="gap-y-2">
                {CONVICTION_REASONS.map((r) => {
                  const on = reason === r.id;
                  return (
                    <Pressable
                      key={r.id}
                      onPress={() => setReason(r.id)}
                      className={`flex-row items-center px-3.5 py-3 rounded-[13px] border ${
                        on ? "bg-brand-bg border-brand" : "bg-bg border-line"
                      }`}
                    >
                      <Icon
                        name={r.icon}
                        size={17}
                        color={on ? "#0E7A66" : "#8C988F"}
                        sw={2}
                      />
                      <Text
                        className={`text-[14px] ml-2.5 flex-1 ${
                          on ? "text-ink font-sansBold" : "text-ink font-sansSb"
                        }`}
                      >
                        {r.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Educational nudge — what you're accepting, not validation */}
              {nudge && (
                <View className="bg-amber-bg rounded-[13px] px-3.5 py-3 mt-3">
                  <Text className="text-amber text-[10.5px] font-sansX uppercase tracking-wider mb-1">
                    Worth knowing
                  </Text>
                  <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
                    {nudge.text}
                  </Text>
                  {nudge.learn && (
                    <View className="bg-brand-bg px-2.5 py-1 rounded-[20px] self-start mt-2 flex-row items-center gap-x-1">
                      <Icon name="book" size={12} color="#06483C" sw={2} />
                      <Text className="text-brand-deep text-[11px] font-sansX">
                        Learn: {nudge.learn}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View className="bg-bg border border-line rounded-[13px] px-3.5 py-3 mt-3">
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add your thinking… (optional)"
                  placeholderTextColor="#8C988F"
                  multiline
                  maxLength={280}
                  className="text-ink text-[14px] font-sansMd"
                  style={{ minHeight: 44, textAlignVertical: "top" }}
                />
              </View>
            </ScrollView>

            <View className="mt-4">
              <Button
                label="Add to portfolio"
                fullWidth
                size="lg"
                disabled={!reason}
                onPress={onConfirm}
              />
              <Text className="text-ink-3 text-[11px] font-sansMd text-center mt-3 leading-[16px]">
                Your reason is saved to your Conviction Journal. We'll bring it
                back when {symbol} appears in a Duel.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function nudgeFor(
  reason: ConvictionReason,
  stock: Stock,
  themeIds: ThemeId[],
  heldSymbols: string[]
): { text: string; learn?: string } | null {
  const fin = financialsForSymbol(stock.symbol);
  switch (reason) {
    case "gut-feeling": {
      const pe = stock.peRatio ? `a P/E of ${stock.peRatio}` : "no trailing earnings to anchor on";
      return {
        text: `${stock.symbol} is ${stock.volatility}-volatility with ${pe}. Momentum cuts both ways — what would tell you the story changed?`,
        learn: "Volatility",
      };
    }
    case "following-someone":
      return {
        text: "You should own your reason, not just the ticker. What specifically do you agree with in their thinking?",
      };
    case "valuation": {
      const peers = STOCKS.filter(
        (s) => s.sector === stock.sector && s.peRatio != null
      );
      const avg =
        peers.length > 0
          ? Math.round(
              peers.reduce((n, s) => n + (s.peRatio ?? 0), 0) / peers.length
            )
          : null;
      if (stock.peRatio && avg) {
        return {
          text: `${stock.symbol} trades at ${stock.peRatio}× earnings vs roughly ${avg}× for ${stock.sector} peers in our catalog. Cheap and expensive both need a "why".`,
          learn: "P/E ratio",
        };
      }
      return {
        text: "Valuation is a comparison, not a number. Cheaper than what — its history, its peers, or its growth?",
        learn: "P/E ratio",
      };
    }
    case "fits-my-thesis": {
      const overlap = stock.themes.filter((t) => themeIds.includes(t));
      if (overlap.length > 0) {
        return {
          text: `${stock.symbol} maps to your active theme${overlap.length > 1 ? "s" : ""}. The question to keep asking: is it the best expression of that thesis?`,
        };
      }
      return {
        text: `Heads up — ${stock.symbol} doesn't map to any of your current themes. That doesn't make it wrong, but it sits outside the thesis you built.`,
      };
    }
    case "long-term-growth": {
      if (fin?.revenueGrowthYoY != null) {
        const pct = Math.round(fin.revenueGrowthYoY * 100);
        return {
          text: `Revenue grew ${pct > 0 ? "+" : ""}${pct}% year over year. Growth stories live or die on whether that rate holds — what's your evidence it does?`,
          learn: "Revenue growth",
        };
      }
      return {
        text: "Long-term growth needs a mechanism — bigger market, more share, or pricing power. Which one is doing the work here?",
        learn: "Compounding",
      };
    }
    case "income-yield": {
      if (stock.divYield >= 1.5) {
        return {
          text: `${stock.symbol} yields ${stock.divYield}%. Yield is only as durable as the cash flow behind it — payout sustainability matters more than the headline number.`,
          learn: "Dividend yield",
        };
      }
      return {
        text: `${stock.symbol} yields just ${stock.divYield}% — thin for an income reason. Worth checking whether this pick is really about income.`,
        learn: "Dividend yield",
      };
    }
    case "diversification": {
      const sameSector = heldSymbols
        .map((s) => stockBySymbol(s))
        .filter((s) => s && s.sector === stock.sector).length;
      if (sameSector > 0) {
        return {
          text: `You already hold ${sameSector} ${stock.sector} name${sameSector > 1 ? "s" : ""}. Same-sector adds diversify less than they feel like they do.`,
          learn: "Diversification",
        };
      }
      return {
        text: "Diversification works when holdings respond differently to the same events. Different ticker isn't automatically different risk.",
        learn: "Diversification",
      };
    }
    default:
      return null;
  }
}

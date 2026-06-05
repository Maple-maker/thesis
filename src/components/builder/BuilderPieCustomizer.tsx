import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { Icon } from "@/components/Icon";
import { BuilderAllocationPie } from "@/components/builder/BuilderAllocationPie";
import { Button } from "@/components/ui/Button";
import { Tick } from "@/components/ui/Tick";
import { PIE_ALLOCATION_DISCLAIMER } from "@/data/educational-disclosures";
import { ETFS } from "@/data/etfs";
import { STOCKS } from "@/data/stocks";
import {
  addSleeveToPie,
  adjustSliceWeight,
  applyPiePrompt,
  finalizePieRows,
  normalizeInvestedWeights,
  parsePiePrompt,
  pieTotalPct,
  resetToThesisBaseline,
} from "@/lib/pie-customization";
import type { PieSleeveSuggestion } from "@/lib/pie-sleeve-suggestions";
import { formatSuggestionHeadline } from "@/lib/pie-sleeve-suggestions";
import {
  CASH_SLICE_SYMBOL,
  PIE_QUICK_ACTIONS,
  type PieAllocationRow,
} from "@/types/pie-customization";
import type { ThemeId, UserProfile } from "@/store/types";

type Props = {
  rows: PieAllocationRow[];
  thesisBaseline: PieAllocationRow[];
  preferenceNote: string;
  profile: UserProfile;
  themeIds: ThemeId[];
  onRowsChange: (rows: PieAllocationRow[]) => void;
  onPreferenceNoteChange: (note: string) => void;
};

export function BuilderPieCustomizer({
  rows,
  thesisBaseline,
  preferenceNote,
  profile,
  themeIds,
  onRowsChange,
  onPreferenceNoteChange,
}: Props) {
  const [prompt, setPrompt] = useState(preferenceNote);
  const [insights, setInsights] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<PieSleeveSuggestion[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string; kind: "stock" | "etf" }[]>([]);

  const handleSearch = useCallback((q: string) => {
    if (q.length < 1) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    const results: { symbol: string; name: string; kind: "stock" | "etf" }[] = [];
    for (const s of STOCKS) {
      if (s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower))
        results.push({ symbol: s.symbol, name: s.name, kind: "stock" });
    }
    for (const e of ETFS) {
      if (e.symbol.toLowerCase().includes(lower) || e.name.toLowerCase().includes(lower))
        if (!results.some((r) => r.symbol === e.symbol))
          results.push({ symbol: e.symbol, name: e.name, kind: "etf" });
    }
    setSearchResults(results.slice(0, 8));
  }, []);

  const addHolding = (symbol: string, name: string, kind: "stock" | "etf") => {
    if (rows.some((r) => r.symbol === symbol)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Add at a small default weight — user adjusts manually from here
    const addPct = 5;
    const next = finalizePieRows(
      [...rows, { symbol, name, weightPct: addPct, role: "", kind }],
      true // loose: don't force 100%, user manages allocations
    );
    onRowsChange(next);
    setInsights([`Added ${symbol} at ${addPct}% — adjust to fill your target allocation`]);
    setSearch("");
    setSearchResults([]);
  };

  const removeHolding = (symbol: string) => {
    Haptics.selectionAsync();
    const remaining = rows.filter((r) => r.symbol !== symbol);
    if (remaining.length === 0) {
      Alert.alert("Last holding", "Removing the last holding would leave an empty portfolio. Use 'Clear and rebuild' from the builder to start fresh, or add another holding first.", [{ text: "OK" }]);
      return;
    }
    // Just remove — don't redistribute. User manages their own allocations.
    onRowsChange(finalizePieRows(remaining, true));
    if (selected === symbol) setSelected(null);
    setInsights([`Removed ${symbol} — ${(100 - pieTotalPct(remaining)).toFixed(1)}% now unallocated`]);
  };

  const ctx = { profile, themeIds, thesisBaseline };

  const applyPrompt = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const result = applyPiePrompt(rows, trimmed, ctx);
      onRowsChange(finalizePieRows(result.rows));
      setInsights(result.patch.messages);
      setSuggestions(result.suggestions);
      setPrompt(trimmed);
      onPreferenceNoteChange(trimmed);
    },
    [rows, ctx, onRowsChange, onPreferenceNoteChange]
  );

  const previewSuggestions = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length < 8) {
        setSuggestions([]);
        return;
      }
      const { suggestions: next } = parsePiePrompt(trimmed, rows, ctx);
      setSuggestions(next);
    },
    [rows, ctx]
  );

  const addSuggestion = useCallback(
    (s: PieSleeveSuggestion) => {
      const next = finalizePieRows(
        addSleeveToPie(rows, {
          symbol: s.symbol,
          kind: s.kind,
          name: s.name,
          weightPct: s.suggestedWeightPct,
          role: s.reason,
        })
      );
      onRowsChange(next);
      setInsights([
        s.alreadyInPie
          ? `Boosted ${s.symbol} by ~${s.suggestedWeightPct}%`
          : `Added ${s.symbol} at ${s.suggestedWeightPct}%, ${s.intentLabel}`,
      ]);
    },
    [rows, onRowsChange]
  );

  const selectedRow = selected
    ? rows.find((r) => r.symbol === selected)
    : null;

  return (
    <View>
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
        Customize your pie
      </Text>
      <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[18px] mb-3">
        Say what you want in plain English, dividend stability, international exposure, dry
        powder, and we suggest ETFs or stocks (e.g. SCHD, VXUS) you can add to the pie.
      </Text>

      <TextInput
        className="text-ink text-[14px] font-sansMd bg-bg-subtle border border-line rounded-[12px] px-3.5 py-3 mb-2"
        placeholder='e.g. "I want dividend stability" or "more international exposure"'
        placeholderTextColor="#8C988F"
        value={prompt}
        onChangeText={(t) => {
          setPrompt(t);
          previewSuggestions(t);
        }}
        multiline
        style={{ minHeight: 52, textAlignVertical: "top" }}
      />
      <Button
        label="Apply to pie"
        fullWidth
        size="md"
        variant="primary"
        disabled={!prompt.trim()}
        onPress={() => applyPrompt(prompt)}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 mb-3"
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {PIE_QUICK_ACTIONS.map((act) => (
          <Pressable
            key={act.id}
            onPress={() => {
              let next = [...rows];
              if (act.action === "dry-powder") {
                const cashPct = act.value ?? 10;
                const scaleDown = (100 - cashPct) / 100;
                const invested = next.filter((r) => r.symbol !== CASH_SLICE_SYMBOL);
                const cashRow = next.find((r) => r.symbol === CASH_SLICE_SYMBOL);
                const scaledInvested = invested.map((r) => ({ ...r, weightPct: Math.round(r.weightPct * scaleDown * 10) / 10 }));
                const sum = scaledInvested.reduce((s, r) => s + r.weightPct, 0);
                next = [...scaledInvested, { symbol: CASH_SLICE_SYMBOL, name: "Dry powder", weightPct: Math.round((100 - sum) * 10) / 10, role: "Cash reserve", kind: "cash" as const }];
              } else if (act.action === "rebalance") {
                const cashRow = next.find((r) => r.symbol === CASH_SLICE_SYMBOL);
                const cashPct = cashRow?.weightPct ?? 0;
                const invested = next.filter((r) => r.symbol !== CASH_SLICE_SYMBOL);
                const totalInvested = invested.reduce((s, r) => s + r.weightPct, 0);
                if (totalInvested > 0) {
                  const scale = (100 - cashPct) / totalInvested;
                  const scaled = invested.map((r) => ({ ...r, weightPct: Math.round(r.weightPct * scale * 10) / 10 }));
                  next = cashRow ? [...scaled, cashRow] : scaled;
                }
              } else if (act.action === "cap") {
                const maxPct = act.value ?? 25;
                next = next.map((r) => (r.weightPct > maxPct ? { ...r, weightPct: maxPct } : r));
                const total = next.reduce((s, r) => s + r.weightPct, 0);
                if (total > 0) {
                  const scale = 100 / total;
                  next = next.map((r) => ({ ...r, weightPct: Math.round(r.weightPct * scale * 10) / 10 }));
                }
              } else if (act.action === "add-etf" && act.symbol) {
                if (next.some((r) => r.symbol === act.symbol)) return;
                const addPct = act.value ?? 10;
                const scaleDown = (100 - addPct) / 100;
                const scaled = next.map((r) => ({ ...r, weightPct: Math.round(r.weightPct * scaleDown * 10) / 10 }));
                const sum = scaled.reduce((s, r) => s + r.weightPct, 0);
                next = [...scaled, { symbol: act.symbol!, name: act.name ?? act.symbol!, weightPct: Math.round((100 - sum) * 10) / 10, role: act.name ?? "", kind: "etf" as const }];
              }
              next = finalizePieRows(next);
              onRowsChange(next);
              setInsights([`Applied: ${act.label}`]);
            }}
            className={`px-3 py-2 rounded-full border active:opacity-75 ${
              act.action === "add-etf" ? "bg-violet-bg border-violet/30" : "bg-bg-surface border-line"
            }`}
          >
            <Text className={`text-[12px] font-sansSb ${
              act.action === "add-etf" ? "text-violet" : "text-ink"
            }`}>{act.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {suggestions.length > 0 && (
        <View className="mb-4">
          <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
            Suggested for your request
          </Text>
          {suggestions.map((s) => (
            <View
              key={`${s.intentId}-${s.symbol}`}
              className="bg-bg-surface border border-brand/20 rounded-[12px] px-3 py-3 mb-2"
            >
              <Text className="text-brand font-monoBold text-[15px]">{s.symbol}</Text>
              <Text className="text-ink text-[13px] font-sansBold mt-0.5" numberOfLines={1}>
                {s.name}
              </Text>
              <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[17px]">
                {formatSuggestionHeadline(s)}
              </Text>
              <Text className="text-ink-3 text-[11px] font-sansMd mt-1">
                Thesis fit {s.fitScore}/100 · ~{s.suggestedWeightPct}% sleeve
              </Text>
              <Pressable
                onPress={() => addSuggestion(s)}
                className="mt-2.5 bg-brand rounded-[10px] py-2.5 items-center active:opacity-85"
              >
                <Text className="text-white text-[13px] font-sansBold">
                  {s.alreadyInPie ? `Boost +${s.suggestedWeightPct}%` : `Add ${s.suggestedWeightPct}%`}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Search to add holdings */}
      <View className="flex-row items-center bg-bg-surface border border-line rounded-[12px] px-3 mb-3">
        <Icon name="search" size={16} color="#8C988F" sw={2} />
        <TextInput
          value={search}
          onChangeText={(t) => { setSearch(t); handleSearch(t); }}
          placeholder="Add a holding — NVDA, VOO, SCHD…"
          placeholderTextColor="#8C988F"
          autoCapitalize="characters"
          autoCorrect={false}
          className="flex-1 py-2.5 pl-2 text-ink text-[14px] font-sansMd"
        />
        {search.length > 0 && (
          <Pressable onPress={() => { setSearch(""); setSearchResults([]); }} hitSlop={8}>
            <Icon name="close" size={14} color="#8C988F" sw={2} />
          </Pressable>
        )}
      </View>
      {searchResults.length > 0 && (
        <View className="bg-bg-surface border border-line rounded-[12px] mb-3 overflow-hidden">
          {searchResults.map((r) => (
            <Pressable
              key={r.symbol}
              onPress={() => addHolding(r.symbol, r.name, r.kind)}
              className="flex-row items-center px-3 py-2.5 active:opacity-60 border-b border-line/60 last:border-b-0"
            >
              <Tick ticker={r.symbol} size={30} />
              <View className="flex-1 ml-2.5 min-w-0">
                <Text className="text-ink font-monoBold text-[13px]">{r.symbol}</Text>
                <Text className="text-ink-2 text-[11px] font-sansMd" numberOfLines={1}>{r.name}</Text>
              </View>
              <View className={`px-1.5 py-0.5 rounded-[5px] ${r.kind === "etf" ? "bg-violet-bg" : "bg-brand-bg"}`}>
                <Text className={`text-[9px] font-sansX uppercase ${r.kind === "etf" ? "text-violet" : "text-brand"}`}>
                  {r.kind}
                </Text>
              </View>
              <View className="w-[26px] h-[26px] rounded-[7px] bg-brand-bg items-center justify-center ml-2">
                <Icon name="plus" size={13} color="#0E7A66" sw={2.5} />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Delete row — show for each holding */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider">
          Holdings ({rows.filter(r => r.symbol !== CASH_SLICE_SYMBOL).length})
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => {
              const cash = rows.find((r) => r.symbol === CASH_SLICE_SYMBOL)?.weightPct ?? 0;
              const next = resetToThesisBaseline(thesisBaseline, cash);
              onRowsChange(next);
              setInsights(["Restored original thesis weights."]);
              setSuggestions([]);
            }}
            className="bg-brand-bg border border-brand/30 rounded-full px-3 py-1.5 active:opacity-75"
          >
            <Text className="text-brand text-[11px] font-sansBold">Reset</Text>
          </Pressable>
        </View>
      </View>

      {insights.length > 0 && (
        <View className="bg-brand-bg/40 border border-brand/25 rounded-[12px] px-3 py-2.5 mb-4">
          {insights.map((line, i) => (
            <Text key={i} className="text-ink-2 text-[12px] font-sansMd leading-[17px]">
              · {line}
            </Text>
          ))}
        </View>
      )}

      <BuilderAllocationPie
        title="Target allocation"
        rows={rows}
        editable
        selectedSymbol={selected}
        onSelectSymbol={setSelected}
        onRemove={removeHolding}
        onWeightChange={(symbol, weight) => {
          onRowsChange(finalizePieRows(adjustSliceWeight(rows, symbol, weight), true));
        }}
      />

      {selectedRow && (
        <View className="mt-3 pt-3 border-t border-line">
          <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
            Adjust {selectedRow.symbol}
          </Text>

          {/* Direct % input */}
          <View className="flex-row items-center gap-2">
            <TextInput
              value={String(selectedRow.weightPct)}
              onChangeText={(t) => {
                const v = parseFloat(t);
                if (!isNaN(v)) {
                  onRowsChange(
                    finalizePieRows(adjustSliceWeight(rows, selectedRow.symbol, v), true)
                  );
                }
              }}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#8C988F"
              selectTextOnFocus
              className="bg-bg-subtle border border-line rounded-[10px] px-3 py-2 text-ink font-monoBold text-[20px] text-center"
              style={{ width: 80 }}
            />
            <Text className="text-ink-2 text-[15px] font-sansBold">%</Text>
            <Text className="text-ink-3 text-[12px] font-sansMd flex-1 leading-[16px]">
              Type a new weight, 0–100
            </Text>
          </View>
        </View>
      )}

      {/* Total + gap indicator */}
      <View className="mt-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              onRowsChange(finalizePieRows(normalizeInvestedWeights(rows, "proportional")));
              setInsights(["Normalized all slices to 100%."]);
            }}
            className="py-2 active:opacity-70"
          >
            <Text className="text-brand text-[13px] font-sansBold">Normalize to 100% →</Text>
          </Pressable>
          <Text className="text-ink-3 text-[11px] font-monoBold">{pieTotalPct(rows)}%</Text>
        </View>

        {/* Gap callout */}
        {Math.abs(pieTotalPct(rows) - 100) > 0.1 && (
          <View className="bg-amber-bg rounded-[10px] px-3 py-2.5 mt-2 flex-row items-center gap-2">
            <Icon name="info" size={14} color="#D98512" sw={2} />
            <Text className="text-amber text-[12px] font-sansMd leading-[17px] flex-1">
              {pieTotalPct(rows) < 100
                ? `${(100 - pieTotalPct(rows)).toFixed(1)}% unallocated — add a new holding or increase existing slices above.`
                : `${(pieTotalPct(rows) - 100).toFixed(1)}% over 100% — trim a slice or tap "Normalize to 100%".`}
            </Text>
          </View>
        )}
      </View>

      <Text className="text-ink-3 text-[10px] font-sansMd text-center mt-2 leading-[14px]">
        {PIE_ALLOCATION_DISCLAIMER}
      </Text>
    </View>
  );
}

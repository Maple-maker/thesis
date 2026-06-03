import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { InsightCard } from "@/components/ui/InsightCard";
import { Sparkline } from "@/components/ui/Sparkline";
import { ThesisScoreCard } from "@/components/ui/ThesisScoreCard";
import { Tick } from "@/components/ui/Tick";
import { EtfListRow } from "@/components/EtfListRow";
import { ETFS } from "@/data/etfs";
import { NotFoundState } from "@/components/NotFoundState";
import { insightForSymbol } from "@/data/context-insights";
import { youtubeForNotFound } from "@/data/youtube-resources";
import { priceHistory } from "@/data/price-data";
import { isCuratedStock, stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import { RESEARCH_LIMITATION } from "@/data/educational-disclosures";
import { BullBearCasesSection } from "@/components/BullBearCasesSection";
import { GlossaryText } from "@/components/education/GlossaryText";
import { PeerComparisonCard } from "@/components/stock/PeerComparisonCard";
import { DecisionFrameworkCard } from "@/components/ui/DecisionFrameworkCard";
import { casesFor } from "@/lib/cases";
import { financialsForSymbol } from "@/data/stock-financials";
import { stockTagLabel, stockTagTone } from "@/lib/stock-tags";
import { thesisFitForStock } from "@/lib/thesis-fit";
import { lessonHintFromBreakdown, lessonPath } from "@/lib/lesson-hints";
import { glossaryTermById } from "@/data/investing-glossary";
import { fetchMarketQuote } from "@/lib/market-api";
import {
  formatPctChange,
  formatUsdPrice,
  quoteSourceLabel,
  stockQuoteDisplay,
  stockQuoteFromMarket,
  type StockQuoteDisplay,
} from "@/lib/stock-quote-display";
import { navigateBack } from "@/lib/app-route";
import { ExplainSheet } from "@/components/ExplainSheet";
import { useExplainSheet } from "@/hooks/useExplainSheet";
import { InsightSheet } from "@/components/InsightSheet";
import { StockSignalsCard } from "@/components/StockSignalsCard";
import { useStore } from "@/store";

export default function StockDetail() {
  const params = useLocalSearchParams<{ symbol: string; returnTo?: string | string[] }>();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);
  const [tab, setTab] = useState<"overview" | "conviction">("overview");
  const [liveQuote, setLiveQuote] = useState<StockQuoteDisplay | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const { openConcept, sheetProps: explainSheetProps } = useExplainSheet();
  const [insightSheetVisible, setInsightSheetVisible] = useState(false);

  const stock = stockBySymbol(params.symbol ?? "");
  const curated = stock ? isCuratedStock(stock.symbol) : false;
  const handleBack = () => navigateBack(router, params.returnTo);

  // All hooks must be called before any conditional return
  const insight = stock ? insightForSymbol(stock.symbol) : undefined;
  const containingETFs = useMemo(
    () => stock ? ETFS.filter((e) => e.holdings.includes(stock.symbol)).slice(0, 4) : [],
    [stock?.symbol]
  );
  const fit = useMemo(
    () => (stock ? thesisFitForStock(stock, profile, themeIds) : null),
    [stock, profile, themeIds]
  );
  const lessonHint = useMemo(
    () => lessonHintFromBreakdown(fit?.breakdown),
    [fit?.breakdown]
  );
  const fallbackQuote = useMemo(
    () => (stock ? stockQuoteDisplay(stock.symbol) : null),
    [stock?.symbol]
  );

  useEffect(() => {
    if (!stock) {
      setQuoteLoading(false);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    void fetchMarketQuote(stock.symbol).then((q) => {
      if (cancelled) return;
      if (q) setLiveQuote(stockQuoteFromMarket(q));
      else setLiveQuote(null);
      setQuoteLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [stock?.symbol]);

  const quote = liveQuote ?? fallbackQuote;
  const sparkData = useMemo(() => {
    if (!stock) return undefined;
    if (quote?.sparkline && quote.sparkline.length >= 2) return quote.sparkline;
    return priceHistory(stock.symbol);
  }, [stock?.symbol, quote?.sparkline]);

  const bullBear = useMemo(() => (stock ? casesFor(stock) : null), [stock]);

  if (!stock) {
    const sym = (params.symbol ?? "").trim().toUpperCase();
    return (
      <Screen padded>
        <Header back returnTo={params.returnTo} onBack={handleBack} />
        <NotFoundState
          title="Stock not found"
          query={sym || undefined}
          message="That ticker isn't in our catalog yet. Try Search to find US stocks and ETFs, or run a market catalog refresh."
          videos={youtubeForNotFound("stock", sym)}
          primaryLabel="Browse Library"
          onPrimary={() => router.push("/(tabs)/themes")}
        />
      </Screen>
    );
  }
  const watching = watchlist.includes(stock.symbol);

  return (
    <Screen padded>
      <Header back returnTo={params.returnTo} onBack={handleBack} />

      <View className="flex-row p-1 bg-track rounded-[12px] mb-4">
        {(["overview", "conviction"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 rounded-[10px] items-center ${tab === t ? "bg-bg-surface" : ""}`}
          >
            <Text className={`text-[13px] font-sansBold ${tab === t ? "text-ink" : "text-ink-3"}`}>
              {t === "overview" ? "Overview" : "Conviction"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "conviction" ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Thesis Fit Score */}
          <Card pad={16} className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
                Thesis fit with your profile
              </Text>
            </View>
            <Text className="text-ink font-monoBold text-[28px]">{fit!.score}/100</Text>
            <Text className="text-brand font-sansBold text-[15px] mt-0.5">{fit!.label}</Text>
            {fit!.reasons.map((r, i) => (
              <Text key={i} className="text-ink-2 text-[13px] font-sansMd mt-1.5 leading-[19px]">
                · {r}
              </Text>
            ))}
            {lessonHint && (
              <Pressable onPress={() => router.push(lessonPath(lessonHint) as never)} className="mt-2 active:opacity-70">
                <Text className="text-brand text-[12px] font-sansBold">Learn: {lessonHint.title} →</Text>
              </Pressable>
            )}
          </Card>

          {/* 7-Factor Breakdown */}
          <ThesisScoreCard symbol={stock.symbol} />

          {/* Bull & Bear Cases */}
          {bullBear && (
            <BullBearCasesSection symbol={stock.symbol} bull={bullBear.bull} bear={bullBear.bear} />
          )}

          {/* Financial Health */}
          <FinancialHealthCard symbol={stock.symbol} />

          {/* Catalysts */}
          <CatalystsCard stock={stock} />

          {/* Conviction Note */}
          <ConvictionNoteCard symbol={stock.symbol} />

          {/* Dossier CTA */}
          <Card pad={14} className="mb-4 border-brand/20 bg-brand-bg/10">
            <View className="flex-row items-center mb-2">
              <Icon name="sparkle" size={16} color="#0E7A66" sw={2} />
              <Text className="text-brand text-[11px] font-sansX uppercase tracking-wider ml-1.5">
                Deep Dive Research
              </Text>
            </View>
            <Text className="text-ink font-sansBold text-[14px] leading-[20px]">
              Run a full deep dive research on {stock.symbol}
            </Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[18px]">
              Business model, moat analysis, probability-weighted scenarios, and cross-risks vs your profile. Generated research saved inside your thesis model.
            </Text>
            <Text className="text-ink-3 text-[10px] font-sansMd mt-2 leading-[15px]">
              {RESEARCH_LIMITATION}
            </Text>
            <View className="mt-3">
              <Button
                label="Run Deep Dive Research"
                variant="primary"
                fullWidth
                onPress={() =>
                  router.push({
                    pathname: "/thesis-model",
                    params: { radarSymbol: stock.symbol, radarTemplate: "conviction-dossier" },
                  } as never)
                }
              />
            </View>
          </Card>

          {/* Multi-LLM Debate CTA */}
          <Card pad={14} className="mb-4" style={{ borderColor: "rgba(124,58,237,0.2)", backgroundColor: "rgba(124,58,237,0.05)" }}>
            <View className="flex-row items-center mb-2">
              <Icon name="compare" size={16} color="#7C3AED" sw={2} />
              <Text className="text-[11px] font-sansX uppercase tracking-wider ml-1.5" style={{ color: "#7C3AED" }}>
                Thesis Research Debate
              </Text>
            </View>
            <Text className="text-ink font-sansBold text-[14px] leading-[20px]">
              4 analysts debate {stock.symbol}
            </Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[18px]">
              Value, Growth, Macro, and Bear analysts produce independent theses, then rebut each other. A committee chair synthesizes the verdict.
            </Text>
            <Text className="text-ink-3 text-[10px] font-sansMd mt-2 leading-[15px]">
              9 LLM calls · ~30 seconds · Requires API server
            </Text>
            <View className="mt-3">
              <Button
                label="Run Thesis Research Debate"
                variant="primary"
                fullWidth
                onPress={() =>
                  router.push({
                    pathname: "/debate",
                    params: { ticker: stock.symbol },
                  } as never)
                }
              />
            </View>
          </Card>

          <DecisionFrameworkCard profile={profile} />

          <Text className="text-ink-3 text-[10px] text-center font-sansMd leading-[14px] mt-2">
            Educational tool. Not investment advice. Verify fundamentals on issuer sites and SEC filings.
          </Text>
        </ScrollView>
      ) : null}

      {tab === "overview" ? (
        <>
      {/* Header, price stays in viewport (flex + shrink) */}
      <View className="flex-row items-start mt-1 mb-5 gap-3">
        <Tick ticker={stock.symbol} size={62} />
        <View className="flex-1 min-w-0">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            {stock.sector}
          </Text>
          <Text
            className="text-ink text-[28px] font-displayX mt-0.5"
            style={{ letterSpacing: -0.6, lineHeight: 31 }}
            numberOfLines={1}
          >
            {stock.symbol}
          </Text>
          <Text className="text-ink-2 text-[14.5px] font-sansSb" numberOfLines={2}>
            {stock.name}
          </Text>
          {!curated && (
            <Text className="text-ink-3 text-[11px] font-sansMd mt-1" numberOfLines={2}>
              Market catalog · live price via Polygon when API is configured
            </Text>
          )}
        </View>
        {quoteLoading && !quote ? (
          <View className="items-end flex-shrink-0 pl-1 pt-1">
            <ActivityIndicator size="small" color="#0E7A66" />
          </View>
        ) : quote ? (
          <View className="items-end flex-shrink-0 max-w-[44%] pl-1">
            <Text
              className="text-ink font-monoBold text-[22px]"
              style={{ letterSpacing: -0.4 }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {formatUsdPrice(quote.price)}
            </Text>
            <Text
              className={`font-monoSb text-[12px] mt-0.5 ${
                quote.changePctDay >= 0 ? "text-pos" : "text-neg"
              }`}
            >
              {formatPctChange(quote.changePctDay)}{" "}
              {quote.recency === "eod" ? "vs prior open" : "today"}
            </Text>
            {quote.changePct1y != null ? (
              <Text className="text-ink-3 text-[10px] font-monoSb mt-0.5">
                {formatPctChange(quote.changePct1y)} 1Y
              </Text>
            ) : null}
            <Text className="text-ink-3 text-[9px] font-sansMd mt-1 text-right">
              {quoteSourceLabel(quote)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Thesis */}
      <Card pad={16} className="mb-4">
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
          Thesis
        </Text>
        <GlossaryText content={stock.thesis} textSize={14} lineHeight={22} />
        <Text className="text-ink-3 text-[10px] font-sansMd mt-2 leading-[15px]">
          Tap highlighted terms to learn what they mean.
        </Text>
      </Card>

      {insight && (
        <View className="mb-5">
          <InsightCard
            headline={insight.headline}
            attribution={insight.kicker ?? "Thesis lens · illustrative"}
            body={insight.body}
            whyItMatters={insight.whyItMatters}
            watch={insight.watch}
            chips={insight.chips}
            onPressReadMore={() => setInsightSheetVisible(true)}
          />
          <StockSignalsCard symbol={stock.symbol} onConceptPress={openConcept} />
        </View>
      )}

      {/* Stats grid */}
      <View className="flex-row gap-x-2 mb-4">
        <Stat label="Mkt Cap" value={`$${stock.marketCap}B`} onPress={() => openConcept("market-cap")} />
        <Stat
          label="Dividend"
          value={stock.divYield > 0 ? `${stock.divYield}%` : "-"}
          onPress={() => openConcept("dividend-yield")}
        />
        <Stat label="P/E" value={stock.peRatio ? String(stock.peRatio) : "-"} onPress={() => openConcept("pe-ratio")} />
        <Stat label="Vol" value={stock.volatility} onPress={() => openConcept("volatility")} />
      </View>
      <Text className="text-ink-3 text-[10.5px] font-sansMd text-center mb-5 leading-[15px]">
        Tap a label to learn what it means.
      </Text>

      {/* Price trend sparkline */}
      {sparkData && quote && (
        <Card pad={14} className="mb-5 overflow-hidden">
          <View className="flex-row items-start justify-between gap-2 mb-2">
            <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-widest flex-1">
              1-year price trend
            </Text>
            <Text
              className="text-ink-3 text-[10px] font-monoSb text-right flex-shrink"
              numberOfLines={2}
            >
              {formatUsdPrice(quote.range1yLow)} – {formatUsdPrice(quote.range1yHigh)}
            </Text>
          </View>
          <Sparkline data={sparkData} color="#0E7A66" height={52} fill />
        </Card>
      )}

      {/* Peer companies for comparison */}
      <PeerComparisonCard ticker={stock.symbol} />

      {/* Tags */}
      <View className="mb-6">
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
          Tags
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {stock.tags.map((t) => (
            <Tag key={t} label={stockTagLabel(t)} tone={stockTagTone(t)} />
          ))}
        </View>
      </View>

      {/* Themes */}
      <SectionTitle>Themes</SectionTitle>
      <View className="gap-y-2 mb-6">
        {stock.themes.map((tid) => {
          const t = themeById(tid);
          if (!t) return null;
          return (
            <Pressable
              key={tid}
              onPress={() => router.push({ pathname: "/(tabs)/theme/[id]", params: { id: tid } })}
              className="flex-row items-center bg-bg-surface border border-line rounded-[14px] p-3"
            >
              <View
                className="items-center justify-center mr-3"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  backgroundColor: `${t.color}1F`,
                }}
              >
                <Icon name={t.glyph as IconName} size={19} color={t.color} />
              </View>
              <View className="flex-1">
                <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-wider">
                  {t.kicker}
                </Text>
                <Text
                  className="text-ink font-displayX text-[15px] mt-0.5"
                  style={{ letterSpacing: -0.2 }}
                >
                  {t.title}
                </Text>
              </View>
              <Icon name="chev" size={18} color="#8C988F" />
            </Pressable>
          );
        })}
      </View>

      {/* ETFs */}
      {containingETFs.length > 0 && (
        <>
          <SectionTitle>ETFs that hold {stock.symbol}</SectionTitle>
          <View className="gap-y-2 mb-6">
            {containingETFs.map((etf) => (
              <EtfListRow key={etf.symbol} etf={etf} />
            ))}
          </View>
        </>
      )}
        </>
      ) : null}

      <View className="mb-2">
        <Button
          label={watching ? "Remove from watchlist" : "Add to watchlist"}
          fullWidth
          size="lg"
          variant={watching ? "secondary" : "primary"}
          leftAdornment={
            <Icon
              name={watching ? "check" : "plus"}
              size={18}
              color={watching ? "#16201C" : "#FFFFFF"}
              sw={2.3}
            />
          }
          onPress={() => toggle(stock.symbol)}
        />
      </View>

      {/* E4 — ExplainSheet for stat tap */}
      <ExplainSheet {...explainSheetProps} />

      {/* U4 — InsightSheet for "Read more" */}
      {insight && (
        <InsightSheet
          insight={insight}
          visible={insightSheetVisible}
          onClose={() => setInsightSheetVisible(false)}
          onConceptPress={openConcept}
        />
      )}
    </Screen>
  );
}

function Stat({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const inner = (
    <View
      className="bg-bg-surface border border-line rounded-[12px] p-3 flex-1"
      style={{
        shadowColor: "#142F22",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-ink font-monoBold text-[13px] mt-1">{value}</Text>
    </View>
  );
  if (onPress) return <Pressable onPress={onPress} className="flex-1 active:opacity-70">{inner}</Pressable>;
  return inner;
}

// ─── Conviction Tab Components ────────────────────────────────────

const METRIC_GLOSSARY: Record<string, string> = {
  "Revenue growth": "revenue-growth",
  "Gross margin": "gross-margin",
  "Operating margin": "operating-margin",
  "Debt / equity": "debt-to-equity",
  "Earnings CAGR (3Y)": "cagr",
  "Free cash flow yield": "free-cash-flow",
};

function MetricPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "pos" | "neutral" | "neg";
}) {
  const termId = METRIC_GLOSSARY[label];
  const term = termId ? glossaryTermById(termId) : undefined;

  return (
    <Pressable
      onPress={() => {
        if (term) {
          Alert.alert(
            term.term,
            `${term.definition}${term.example ? `\n\nExample: ${term.example}` : ""}`
          );
        }
      }}
      className={`rounded-[10px] px-3 py-2 active:opacity-70 ${
        tone === "pos" ? "bg-pos-bg/40" : tone === "neg" ? "bg-neg-bg/40" : "bg-bg-surface"
      }`}
    >
      <View className="flex-row items-center gap-1">
        <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">
          {label}
        </Text>
        {term && (
          <View className="w-[12px] h-[12px] rounded-full bg-brand-bg items-center justify-center">
            <Text className="text-brand text-[7px] font-sansBold">?</Text>
          </View>
        )}
      </View>
      <Text
        className={`text-[14px] font-monoBold mt-0.5 ${
          tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-ink"
        }`}
      >
        {value}
      </Text>
    </Pressable>
  );
}

function FinancialHealthCard({ symbol }: { symbol: string }) {
  const fin = financialsForSymbol(symbol);
  if (!fin) return null;
  const metrics: { label: string; value: string; tone: "pos" | "neutral" | "neg" }[] = [];
  if (fin.revenueGrowthYoY != null) {
    const pct = Math.round(fin.revenueGrowthYoY * 100);
    metrics.push({
      label: "Revenue growth",
      value: `${pct > 0 ? "+" : ""}${pct}%`,
      tone: pct > 15 ? "pos" : pct < 0 ? "neg" : "neutral",
    });
  }
  if (fin.grossMargin != null) {
    const pct = Math.round(fin.grossMargin * 100);
    metrics.push({
      label: "Gross margin",
      value: `${pct}%`,
      tone: pct > 60 ? "pos" : pct < 30 ? "neg" : "neutral",
    });
  }
  if (fin.operatingMargin != null) {
    const pct = Math.round(fin.operatingMargin * 100);
    metrics.push({
      label: "Operating margin",
      value: `${pct > 0 ? "+" : ""}${pct}%`,
      tone: pct > 20 ? "pos" : pct < 0 ? "neg" : "neutral",
    });
  }
  if (fin.debtToEquity != null) {
    metrics.push({
      label: "Debt / equity",
      value: String(fin.debtToEquity),
      tone: fin.debtToEquity < 0.5 ? "pos" : fin.debtToEquity > 2 ? "neg" : "neutral",
    });
  }
  if (fin.earningsGrowth3yCAGR != null) {
    const pct = Math.round(fin.earningsGrowth3yCAGR * 100);
    metrics.push({
      label: "Earnings CAGR (3Y)",
      value: `${pct > 0 ? "+" : ""}${pct}%`,
      tone: pct > 15 ? "pos" : pct < 0 ? "neg" : "neutral",
    });
  }
  if (fin.fcfYield != null) {
    const pct = Math.round(fin.fcfYield * 100);
    metrics.push({
      label: "Free cash flow yield",
      value: `${pct}%`,
      tone: pct > 5 ? "pos" : pct < 0 ? "neg" : "neutral",
    });
  }
  if (metrics.length === 0) return null;
  return (
    <Card pad={14} className="mb-3">
      <View className="flex-row items-center mb-3">
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider flex-1">Financial health</Text>
        <Text className="text-ink-3 text-[9px] font-sansMd">Tap labels to learn</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {metrics.map((m) => (
          <MetricPill key={m.label} label={m.label} value={m.value} tone={m.tone} />
        ))}
      </View>
      <Text className="text-ink-3 text-[10px] font-sansMd mt-2 leading-[14px]">
        Financial data is illustrative. Verify on SEC filings and issuer investor relations.
      </Text>
    </Card>
  );
}

const CATALYST_TEMPLATES: Record<string, string[]> = {
  Technology: ["Next earnings report", "Product launch cycle (annual refresh)", "Cloud/enterprise contract announcements", "AI/ML roadmap milestones"],
  Energy: ["OPEC+ meeting / production decision", "Quarterly earnings", "Regulatory updates (EPA, drilling permits)", "Energy transition capex announcements"],
  Healthcare: ["FDA decision / PDUFA date", "Clinical trial readout", "Quarterly earnings", "Medicare/Medicaid policy changes"],
  Financials: ["Fed rate decision impact", "Quarterly earnings", "Stress test results", "M&A / consolidation news"],
  Consumer: ["Holiday quarter sales", "Consumer confidence index", "Input cost / supply chain updates", "E-commerce penetration metrics"],
  Communication: ["Subscriber/net-adds reports", "Spectrum auction results", "Content slate announcements", "Ad spending forecasts"],
  Industrials: ["Infrastructure bill spending", "PMI / industrial production data", "Quarterly earnings", "Supply chain normalization updates"],
  Materials: ["Commodity price trends", "China demand indicators", "Quarterly earnings", "Capacity expansion announcements"],
  Utilities: ["Rate case decisions", "Renewable portfolio standard updates", "Quarterly earnings", "Grid modernization investments"],
  "Real Estate": ["Interest rate / cap rate trends", "Occupancy rate reports", "Property acquisition/disposition news", "REIT earnings season"],
};

function CatalystsCard({ stock }: { stock: { sector: string; symbol: string } }) {
  const catalysts = CATALYST_TEMPLATES[stock.sector] ?? [
    "Quarterly earnings report",
    "Industry conference appearances",
    "Analyst initiations / rating changes",
    "Macro data releases relevant to sector",
  ];
  return (
    <Card pad={14} className="mb-3">
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
        Catalysts to watch
      </Text>
      <Text className="text-ink-2 text-[12px] font-sansMd mb-3 leading-[17px]">
        Key events for {stock.symbol} in the next 12 months, based on sector patterns. Not dated predictions.
      </Text>
      {catalysts.map((c, i) => (
        <View key={i} className="flex-row items-start mb-2">
          <Text className="text-brand font-monoBold text-[12px] w-[18px]">{i + 1}.</Text>
          <Text className="text-ink-2 text-[12.5px] font-sansMd flex-1 leading-[18px]">{c}</Text>
        </View>
      ))}
    </Card>
  );
}

function ConvictionNoteCard({ symbol }: { symbol: string }) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const addConvictionNote = useStore((s) => s.addConvictionNote);

  if (saved) {
    return (
      <Card pad={14} className="mb-3 border-brand/20 bg-brand-bg/10">
        <Text className="text-brand text-[11px] font-sansBold">Conviction note saved</Text>
        <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[17px]">
          Your note on {symbol} is stored. Revisit in 90 days to see if your thesis held.
        </Text>
        <Pressable onPress={() => setSaved(false)} className="mt-2 active:opacity-70">
          <Text className="text-brand text-[12px] font-sansBold">Add another →</Text>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card pad={14} className="mb-3">
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
        Your conviction
      </Text>
      <Text className="text-ink-2 text-[12px] font-sansMd mb-2 leading-[17px]">
        What would change your mind about {symbol}? Write it down — future you will thank you.
      </Text>
      <TextInput
        className="text-ink text-[13px] font-sansMd bg-bg-surface border border-line rounded-[12px] px-3.5 py-3 mb-2"
        placeholder="e.g. If revenue growth drops below 10% for two quarters…"
        placeholderTextColor="#8C988F"
        multiline
        numberOfLines={3}
        style={{ minHeight: 72, textAlignVertical: "top" }}
        value={note}
        onChangeText={setNote}
        maxLength={300}
      />
      <Button
        label="Save conviction note"
        size="md"
        fullWidth
        disabled={!note.trim()}
        onPress={() => {
          if (!note.trim()) return;
          addConvictionNote({ source: "manual", symbol, mindChange: note.trim() });
          setNote("");
          setSaved(true);
        }}
      />
    </Card>
  );
}

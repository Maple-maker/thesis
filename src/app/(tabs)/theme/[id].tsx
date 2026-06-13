import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { GlossaryText } from "@/components/education/GlossaryText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tick } from "@/components/ui/Tick";
import { EtfListRow } from "@/components/EtfListRow";
import { ETFS } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import { NotFoundState } from "@/components/NotFoundState";
import { youtubeForNotFound } from "@/data/youtube-resources";
import { themeById } from "@/data/themes";
import { rankStocksForTheme } from "@/lib/theme-engine";
import { useExplain } from "@/hooks/use-explain";
import type { ConceptId } from "@/data/concepts";
import { useStore } from "@/store";
import type { ThemeId } from "@/store/types";

export default function ThemeDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);
  const themeIds = useStore((s) => s.themeIds);
  const [expandedDrivers, setExpandedDrivers] = useState<number[]>([]);
  const { openConcept } = useExplain();

  const toggleDriver = (i: number) =>
    setExpandedDrivers((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  const theme = themeById(params.id ?? "");

  const stocks = useMemo(
    () => theme ? rankStocksForTheme(theme.id as ThemeId, profile, 10) : [],
    [theme?.id, profile]
  );

  if (!theme) {
    const query = (params.id ?? "").trim();
    return (
      <Screen padded>
        <Header back />
        <NotFoundState
          title="Theme not found"
          query={query || undefined}
          message="That thesis isn't in the library yet. Search Library for topics like AI, dividends, or global diversification."
          videos={youtubeForNotFound("theme", query)}
          primaryLabel="Search Library"
          onPrimary={() => router.push("/(tabs)/themes")}
        />
      </Screen>
    );
  }

  const etfs = ETFS.filter((e) => e.themes.includes(theme.id as ThemeId)).slice(0, 3);
  const isYours = themeIds.includes(theme.id);

  return (
    <Screen padded>
      <Header back />

      {/* Hero */}
      <View
        className="overflow-hidden mt-1 mb-4"
        style={{ borderRadius: 22 }}
      >
        <LinearGradient
          colors={[theme.color, darken(theme.color, 0.5)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22 }}
        >
          <View style={{ position: "absolute", right: -20, bottom: -25, opacity: 0.14 }}>
            <Icon name={theme.glyph as IconName} size={150} sw={1} color="#FFFFFF" />
          </View>
          <View className="relative">
            <Text className="text-white text-[11px] font-sansX uppercase tracking-widest opacity-90">
              {theme.kicker}
            </Text>
            <Text
              className="text-white text-[30px] font-displayX mt-1.5"
              style={{ letterSpacing: -0.7, lineHeight: 33 }}
            >
              {theme.title}
            </Text>
            <Text className="text-white/85 text-[13.5px] italic font-sansSb mt-0.5">
              {theme.author}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Match chip */}
      <View
        className={`flex-row items-center px-4 py-3 rounded-[14px] mb-4 ${
          isYours ? "bg-pos-bg" : "bg-brand-bg"
        }`}
      >
        <Icon
          name={isYours ? "check" : "sparkle"}
          size={18}
          color={isYours ? "#149059" : "#0E7A66"}
          sw={2.2}
        />
        <Text
          className={`ml-2.5 text-[13.5px] font-sansBold ${
            isYours ? "text-pos-ink" : "text-brand"
          }`}
        >
          {isYours
            ? "Aligned with your thesis"
            : "Could broaden your exposure"}
        </Text>
      </View>

      {/* Summary */}
      <GlossaryText
        content={theme.thesis}
        textSize={16}
        lineHeight={24}
        onTermPress={(tid) => {
          const map: Record<string, ConceptId> = {
            volatility: "volatility",
            drawdown: "drawdown",
            beta: "beta",
            "sharpe-ratio": "sharpe-ratio",
          };
          const cid = map[tid];
          if (cid) { openConcept(cid); return true; }
          return false;
        }}
      />

      {/* Drivers grid */}
      <SectionTitle>Key drivers</SectionTitle>
      <View className="flex-row flex-wrap mb-6" style={{ marginHorizontal: -5 }}>
        {theme.drivers.map((d, i) => {
          const open = expandedDrivers.includes(i);
          const note = DRIVER_EXPLAINERS[d];
          return (
            <Pressable
              key={i}
              onPress={note ? () => toggleDriver(i) : undefined}
              style={{ width: "50%", padding: 5 }}
            >
              <View
                className={`bg-bg-surface border rounded-[14px] p-3.5 ${
                  open ? "border-brand" : "border-line"
                }`}
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-brand font-monoBold text-[12px]">
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  {note && (
                    <View style={{ transform: open ? [{ rotate: "180deg" }] : undefined }}>
                      <Icon name="chevDown" size={13} color="#8C988F" sw={2.2} />
                    </View>
                  )}
                </View>
                <Text className="text-ink text-[13.5px] font-sansSb leading-[19px]">
                  {d}
                </Text>
                {open && note && (
                  <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px] mt-2 pt-2 border-t border-line">
                    {note}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Players (stocks) */}
      <SectionTitle>Key players</SectionTitle>
      <Card pad={6} className="mb-6">
        {stocks.slice(0, 6).map((s, i) => {
          const watching = watchlist.includes(s.symbol);
          return (
            <View
              key={s.symbol}
              className={`flex-row items-center px-3 py-3 ${
                i < Math.min(5, stocks.length - 1) ? "border-b border-line" : ""
              }`}
            >
              <Pressable
                onPress={() => router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: s.symbol } })}
                className="flex-row items-center flex-1"
              >
                <Tick ticker={s.symbol} size={40} />
                <View className="ml-3 flex-1">
                  <Text className="text-ink text-[15px] font-sansBold">{s.name}</Text>
                  <Text className="text-ink-3 text-[12.5px] font-sansSb mt-0.5" numberOfLines={1}>
                    {s.thesis}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => toggle(s.symbol)}
                className={`ml-2 px-2.5 py-2 rounded-[10px] items-center justify-center ${
                  watching ? "bg-brand" : "bg-brand-bg"
                }`}
              >
                <Icon
                  name={watching ? "check" : "plus"}
                  size={17}
                  sw={2.2}
                  color={watching ? "#FFFFFF" : "#0E7A66"}
                />
              </Pressable>
            </View>
          );
        })}
      </Card>

      {/* Exposure (ETFs) */}
      {etfs.length > 0 && (
        <>
          <SectionTitle>How to get exposure</SectionTitle>
          <View className="gap-y-2.5 mb-6">
            {etfs.map((etf) => (
              <EtfListRow key={etf.symbol} etf={etf} />
            ))}
          </View>
        </>
      )}

      <View className="mb-4">
        <Button
          label="Browse all picks"
          fullWidth
          size="lg"
          variant="secondary"
          onPress={() => router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: stocks[0]?.symbol ?? "" } })}
        />
        <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-4">
          Educational only · not investment advice
        </Text>
      </View>
    </Screen>
  );
}

function darken(hex: string, amount: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `#${[r, g, b]
    .map((n) => Math.round(n * (1 - amount)).toString(16).padStart(2, "0"))
    .join("")}`;
}

// Plain-English explanations for every theme driver, shown on expand.
const DRIVER_EXPLAINERS: Record<string, string> = {
  "Exponential compute demand":
    "AI training requires roughly 4x more compute every year. This drives demand for GPUs, data centers, and energy at a pace with no historical precedent.",
  "Power & grid bottlenecks":
    "AI data centers consume enormous amounts of electricity, a single training cluster can use as much power as a small city. Grid capacity is becoming a binding constraint.",
  "Capex from hyperscalers":
    "Microsoft, Amazon, and Google are spending hundreds of billions on AI infrastructure. This capital expenditure flows directly to chipmakers, data center builders, and utilities.",
  "Reshoring of fabs":
    "Semiconductor fabrication plants (fabs) are being built in the US again after decades offshore, driven by national security concerns and CHIPS Act subsidies.",
  "Durable competitive moats":
    "A moat is a company's ability to fend off competitors over long periods, through brand power, network effects, or cost advantages. Wide-moat companies tend to be more predictable investments.",
  "Pricing power":
    "A company with pricing power can raise prices without losing customers. This protects profits during inflation and is a hallmark of great businesses.",
  "Owner-minded management":
    "Management that allocates capital wisely, avoids dilution, and focuses on long-term value rather than short-term stock price.",
  "Margin of safety":
    "The gap between a stock's market price and its estimated intrinsic value. A wide margin protects you from being wrong about your assumptions.",
  "Risk parity over dollar parity":
    "Balancing portfolio risk across asset classes (stocks, bonds, commodities) rather than splitting dollar amounts equally. Aims to be equally exposed to different economic environments.",
  "Uncorrelated cash flows":
    "Cash flows that do not move in sync with the stock market. Real estate and certain business models generate steady income regardless of market conditions.",
  "Survive any environment":
    "A portfolio designed to hold up through inflation, deflation, recession, and growth, no matter what the economy does.",
  "Sleep at night":
    "Investments chosen for stability so you do not feel the need to check prices or make emotional decisions during volatility.",
  "Electrification of transport":
    "The shift from gas engines to EVs requires massive investment in battery production, charging infrastructure, and grid upgrades.",
  "Grid modernization":
    "Upgrading aging power grids to handle renewable energy, bidirectional solar flow, and surging demand from EVs and AI data centers.",
  "Battery & storage scale-up":
    "Large batteries store solar and wind power for use when weather conditions change. This is a rapidly growing industry essential for renewable energy.",
  "Critical minerals supply":
    "Copper, lithium, nickel, and rare earths are essential for EVs, batteries, and renewables. Supply constraints create both risk and opportunity.",
  "Rising 65+ population":
    "The global 65+ population is growing faster than any other demographic. This is predictable decades in advance and drives demand for healthcare, housing, and financial services.",
  "GLP-1 / obesity drugs":
    "A new class of drugs (Ozempic, Wegovy, Mounjaro) highly effective for weight loss and diabetes. One of the largest pharmaceutical market expansions in history.",
  "Medical devices growth":
    "An aging population needs more joint replacements, pacemakers, and diagnostic equipment, creating steady, predictable demand growth.",
  "Care infrastructure demand":
    "Senior housing, home health aides, telemedicine, and nursing facilities will see increased demand as the population ages.",
  "Quality dividend payers":
    "Companies with a long track record of consistently paying and growing dividends. Dividend aristocrats have raised payouts for 25+ consecutive years.",
  "Inflation-protected cash flows":
    "Businesses that can raise prices with inflation, protecting the real value of their dividend payments over time.",
  "Buybacks + distributions":
    "Companies return cash to shareholders via dividends (cash payments) and buybacks (reducing shares, increasing each share's value).",
  "Lower portfolio volatility":
    "Dividend-paying stocks tend to be less volatile than growth stocks, providing a smoother ride for income-focused investors.",
  "Cloud + SaaS attack surface":
    "As companies move data and operations to the cloud, the number of potential entry points for attackers multiplies dramatically.",
  "AI-enabled threat vectors":
    "Attackers use AI to craft more convincing phishing emails and automate hacking attempts. This increases demand for AI-powered defense tools.",
  "Zero-trust replacements":
    "The old 'trust but verify' model is being replaced by 'never trust, always verify', every access request is authenticated regardless of its origin.",
  "Regulatory teeth":
    "Governments are imposing stricter cybersecurity reporting requirements and penalties for breaches, forcing companies to spend more on security.",
  "Card-network toll-booths":
    "Visa and Mastercard charge a small fee on every transaction. As digital payments grow, these 'toll booths' generate increasingly predictable revenue.",
  "Embedded finance everywhere":
    "Financial services are being built into non-financial apps, buy now pay later at checkout, insurance when booking a flight, investing inside banking apps.",
  "Cross-border real-time rails":
    "New payment networks make international transfers instant and cheap, replacing the slow SWIFT system that still dominates cross-border payments.",
  "Cash → digital in emerging markets":
    "Many developing countries are leapfrogging credit cards entirely, moving from cash directly to mobile payments, massive growth for digital payment companies.",
  "Gene editing approvals":
    "CRISPR and other gene-editing technologies are moving from labs to approved treatments, potentially curing genetic diseases with a single treatment.",
  "GLP-1 expansion into new diseases":
    "Drugs originally developed for diabetes are showing promise for obesity, heart disease, kidney disease, and addiction, the addressable market keeps expanding.",
  "AI-accelerated drug discovery":
    "AI is dramatically speeding up how drugs are discovered, from years to months in some cases. This reduces costs and increases viable drug candidates.",
  "Personalized oncology":
    "Cancer treatments tailored to a patient's specific genetic profile, rather than one-size-fits-all chemo. More effective but requires complex diagnostics.",
  "Pricing power across cycles":
    "People keep buying toothpaste and detergent regardless of the economy. Companies that own essential brands can raise prices without losing customers.",
  "Emerging-market consumer growth":
    "As developing-country populations get wealthier, spending on branded consumer goods grows faster than in saturated developed markets.",
  "Decades-long dividend records":
    "Many consumer staples companies have paid rising dividends for 50+ years. These are among the most reliable income investments available.",
  "Defensive cash machines":
    "Consumer staples businesses generate predictable cash flow in any economy because people need their products regardless of the cycle.",
  "Mean-reversion vs US":
    "US stocks have outperformed international markets for over a decade. Historically, leadership rotates, international stocks tend to catch up eventually.",
  "Cheaper valuations abroad":
    "Many international stock markets trade at lower P/E ratios than the US, potentially offering more upside if valuations converge.",
  "Currency diversification":
    "Holding assets in different currencies protects you if the dollar weakens. A falling dollar boosts the value of your international holdings.",
  "Demographic dispersion":
    "Some countries have young, growing workforces (India, Southeast Asia) while others are aging rapidly (Japan, Europe). This creates different investment opportunities.",
  "Humanoid robotics":
    "General-purpose robots that work in human-designed environments, factories, warehouses, homes. Advances in AI are making this commercially viable.",
  "Quantum compute milestones":
    "Quantum computers that solve problems impossible for classical computers are still years away, but progress milestones drive significant investment.",
  "Autonomous mobility":
    "Self-driving cars, trucks, drones, and delivery robots are moving from pilots to commercial deployment. Regulation and safety are the main bottlenecks.",
  "Space economy scale-up":
    "Satellite internet, Earth observation, and launch services are growing from government-dominated to commercial industries. Costs are falling rapidly.",
};

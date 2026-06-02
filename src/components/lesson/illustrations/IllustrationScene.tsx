import { Image } from "expo-image";
import type { ReactElement, ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import type { LessonImageKey } from "@/data/lesson-images";

import { AnimatedLayer } from "./AnimatedLayer";
import { ILL } from "./palette";

const VB = "0 0 320 200";

type SceneProps = { width: number; height: number };

function SceneFrame({ width, height, children }: SceneProps & { children: ReactNode }) {
  return (
    <Svg width={width} height={height} viewBox={VB}>
      <Rect x={0} y={0} width={320} height={200} fill={ILL.bg} />
      {children}
    </Svg>
  );
}

function CoinsScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      <G>
        
          <Circle cx={108} cy={88} r={28} fill={ILL.amberLight} stroke={ILL.amber} strokeWidth={2} />
          <Path d="M108 72v32M96 88h24" stroke={ILL.amber} strokeWidth={2.5} strokeLinecap="round" />
        
        
          <Circle cx={160} cy={78} r={34} fill={ILL.brandLight} stroke={ILL.brand} strokeWidth={2.5} />
          <Path d="M160 58v40M146 78h28" stroke={ILL.brand} strokeWidth={3} strokeLinecap="round" />
        
        
          <Circle cx={212} cy={92} r={24} fill={ILL.posLight} stroke={ILL.pos} strokeWidth={2} />
          <Path d="M212 80v24M202 92h20" stroke={ILL.pos} strokeWidth={2} strokeLinecap="round" />
        
      </G>
      <Rect x={48} y={138} width={224} height={8} rx={4} fill={ILL.line} />
    </SceneFrame>
  );
}

function ChartScene({ width, height, up = true }: SceneProps & { up?: boolean }) {
  const d = up
    ? "M48 150 L88 128 L128 136 L168 108 L208 92 L248 72 L272 58"
    : "M48 72 L88 92 L128 84 L168 108 L208 118 L248 132 L272 142";
  return (
    <SceneFrame width={width} height={height}>
      <Rect x={40} y={48} width={240} height={112} rx={14} fill={ILL.surface} stroke={ILL.line} strokeWidth={1.5} />
      {[72, 96, 120, 144].map((y) => (
        <Line key={y} x1={52} y1={y} x2={268} y2={y} stroke={ILL.line} strokeWidth={1} />
      ))}
      
        <Path d={d} fill="none" stroke={up ? ILL.brand : ILL.neg} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={272} cy={up ? 58 : 142} r={7} fill={up ? ILL.brand : ILL.neg} />
      
    </SceneFrame>
  );
}

function CardScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Rect x={72} y={56} width={176} height={108} rx={16} fill={ILL.surface} stroke={ILL.line} strokeWidth={2} />
        <Rect x={88} y={72} width={48} height={32} rx={6} fill={ILL.violetLight} />
        <Rect x={88} y={116} width={120} height={10} rx={5} fill={ILL.brandLight} />
        <Rect x={88} y={134} width={80} height={8} rx={4} fill={ILL.line} />
      
      <Circle cx={228} cy={88} r={14} fill={ILL.amberLight} stroke={ILL.amber} strokeWidth={2} />
    </SceneFrame>
  );
}

function JarScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      <Path d="M118 52h84v12c0 0-8 8-8 16v72c0 12-28 20-34 20s-34-8-34-20V80c0-8-8-16-8-16V52z" fill={ILL.brandLight} stroke={ILL.brand} strokeWidth={2.5} />
      
        <Ellipse cx={160} cy={118} rx={38} ry={14} fill={ILL.brand} opacity={0.35} />
        <Rect x={122} y={100} width={76} height={36} rx={8} fill={ILL.brand} />
      
      <Circle cx={160} cy={64} r={6} fill={ILL.amber} />
    </SceneFrame>
  );
}

function BondsScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      {[88, 160, 232].map((x, i) => (
        <G key={x}>
          
            <Rect x={x - 36} y={64 + i * 6} width={72} height={96} rx={8} fill={ILL.surface} stroke={ILL.brand} strokeWidth={2} />
            <Line x1={x - 24} y1={88 + i * 6} x2={x + 24} y2={88 + i * 6} stroke={ILL.brandLight} strokeWidth={8} />
            <Line x1={x - 24} y1={108 + i * 6} x2={x + 24} y2={108 + i * 6} stroke={ILL.brandLight} strokeWidth={8} />
            <Circle cx={x} cy={148 + i * 6} r={6} fill={ILL.brand} />
          
        </G>
      ))}
    </SceneFrame>
  );
}

function FedScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      <Rect x={100} y={72} width={120} height={88} rx={6} fill={ILL.surface} stroke={ILL.ink2} strokeWidth={2} />
      <Path d="M100 88h120M130 72v88M190 72v88" stroke={ILL.line} strokeWidth={2} />
      
        <Circle cx={160} cy={48} r={22} fill={ILL.amberLight} stroke={ILL.amber} strokeWidth={2.5} />
        <Path d="M160 38v20M150 48h20" stroke={ILL.amber} strokeWidth={2.5} strokeLinecap="round" />
      
      <Path d="M56 160 Q160 130 264 160" fill="none" stroke={ILL.brand} strokeWidth={3} strokeDasharray="8 6" />
    </SceneFrame>
  );
}

function BitcoinScene({ width, height }: SceneProps) {
  const size = Math.round(Math.min(width, height) * 0.65);
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: ILL.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../../../../assets/images/bitcoin-logo.png")}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityLabel="Bitcoin logo"
      />
    </View>
  );
}

function GlobeScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Circle cx={160} cy={100} r={56} fill={ILL.brandLight} stroke={ILL.brand} strokeWidth={2.5} />
        <Ellipse cx={160} cy={100} rx={56} ry={18} fill="none" stroke={ILL.brand} strokeWidth={1.5} opacity={0.5} />
        <Ellipse cx={160} cy={100} rx={18} ry={56} fill="none" stroke={ILL.brand} strokeWidth={1.5} opacity={0.5} />
        <Line x1={104} y1={100} x2={216} y2={100} stroke={ILL.brand} strokeWidth={1.5} opacity={0.4} />
      
      
        <Rect x={228} y={68} width={44} height={28} rx={8} fill={ILL.posLight} stroke={ILL.pos} strokeWidth={2} />
        <Path d="M236 88 L248 76 L260 92" fill="none" stroke={ILL.pos} strokeWidth={2.5} strokeLinecap="round" />
      
    </SceneFrame>
  );
}

function PieScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Circle cx={160} cy={104} r={54} fill={ILL.surface} stroke={ILL.line} strokeWidth={2} />
        <Path d="M160 50 A54 54 0 0 1 214 104 L160 104 Z" fill={ILL.brand} />
        <Path d="M160 104 L214 104 A54 54 0 0 1 160 158 Z" fill={ILL.pos} />
        <Path d="M160 158 A54 54 0 0 1 106 104 L160 104 Z" fill={ILL.amber} />
        <Path d="M160 104 L106 104 A54 54 0 0 1 160 50 Z" fill={ILL.violetLight} stroke={ILL.violet} strokeWidth={1} />
        <Circle cx={160} cy={104} r={18} fill={ILL.bg} />
      
    </SceneFrame>
  );
}

function TaxScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Rect x={96} y={52} width={128} height={116} rx={10} fill={ILL.surface} stroke={ILL.line} strokeWidth={2} />
        {[76, 96, 116, 136].map((y) => (
          <Rect key={y} x={112} y={y} width={96} height={8} rx={4} fill={ILL.brandLight} />
        ))}
      
      
        <Circle cx={232} cy={72} r={20} fill={ILL.amberLight} stroke={ILL.amber} strokeWidth={2} />
        <Path d="M224 72h16M232 64v16" stroke={ILL.amber} strokeWidth={2} strokeLinecap="round" />
      
    </SceneFrame>
  );
}

function BrainScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Path
          d="M160 48c-28 0-48 20-48 44 0 18 10 32 24 38-4 8-2 18 8 24 12 8 28 2 32-12 20-6 36-24 36-50 0-24-20-44-52-44z"
          fill={ILL.violetLight}
          stroke={ILL.violet}
          strokeWidth={2.5}
        />
        <Path d="M140 88c8-12 20-12 28 0M152 108c6-8 14-8 20 0" fill="none" stroke={ILL.violet} strokeWidth={2} strokeLinecap="round" />
      
      
        <Rect x={56} y={132} width={56} height={36} rx={10} fill={ILL.negLight} stroke={ILL.neg} strokeWidth={2} />
        <Path d="M72 148h24" stroke={ILL.neg} strokeWidth={3} strokeLinecap="round" />
      
      
        <Rect x={208} y={128} width={56} height={40} rx={10} fill={ILL.posLight} stroke={ILL.pos} strokeWidth={2} />
        <Path d="M224 144 L236 132 L248 152" fill="none" stroke={ILL.pos} strokeWidth={2.5} strokeLinecap="round" />
      
    </SceneFrame>
  );
}

function DividendScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      <Rect x={40} y={48} width={240} height={112} rx={14} fill={ILL.surface} stroke={ILL.line} strokeWidth={1.5} />
      <Path d="M56 140 L120 108 L180 118 L264 76" fill="none" stroke={ILL.brand} strokeWidth={3} strokeLinecap="round" />
      {[120, 180, 240].map((x, i) => (
        <G key={x}>
          <Circle cx={x} cy={56 + i * 8} r={10} fill={ILL.amberLight} stroke={ILL.amber} strokeWidth={2} />
          <Path d={`M${x - 4} ${56 + i * 8}h8`} stroke={ILL.amber} strokeWidth={2} strokeLinecap="round" />
        </G>
      ))}
    </SceneFrame>
  );
}

function UmbrellaScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Path d="M96 108c0-36 28-56 64-56s64 20 64 56H96z" fill={ILL.brandLight} stroke={ILL.brand} strokeWidth={2.5} />
        <Line x1={160} y1={108} x2={160} y2={168} stroke={ILL.ink2} strokeWidth={3} strokeLinecap="round" />
        <Line x1={132} y1={168} x2={188} y2={168} stroke={ILL.ink2} strokeWidth={3} strokeLinecap="round" />
      
      <Path d="M48 168h224" stroke={ILL.neg} strokeWidth={4} strokeLinecap="round" opacity={0.35} />
      
        <Rect x={200} y={120} width={72} height={48} rx={10} fill={ILL.posLight} stroke={ILL.pos} strokeWidth={2} />
        <Path d="M216 144h40M236 128v32" stroke={ILL.pos} strokeWidth={2} strokeLinecap="round" />
      
    </SceneFrame>
  );
}

function QuizScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Circle cx={160} cy={96} r={44} fill={ILL.posLight} stroke={ILL.pos} strokeWidth={3} />
        <Path d="M142 96 L154 108 L180 82" fill="none" stroke={ILL.pos} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      
      <Rect x={72} y={152} width={176} height={10} rx={5} fill={ILL.line} />
      <Rect x={96} y={168} width={128} height={8} rx={4} fill={ILL.brandLight} />
    </SceneFrame>
  );
}

function DuelScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Rect x={48} y={72} width={96} height={72} rx={14} fill={ILL.brandLight} stroke={ILL.brand} strokeWidth={2} />
        <Path d="M72 108h48" stroke={ILL.brand} strokeWidth={3} strokeLinecap="round" />
      
      <VsBadge x={160} />
      
        <Rect x={176} y={72} width={96} height={72} rx={14} fill={ILL.violetLight} stroke={ILL.violet} strokeWidth={2} />
        <Path d="M200 108h48" stroke={ILL.violet} strokeWidth={3} strokeLinecap="round" />
      
    </SceneFrame>
  );
}

function VsBadge({ x }: { x: number }) {
  return (
    <G>
      <Circle cx={x} cy={108} r={18} fill={ILL.surface} stroke={ILL.line} strokeWidth={2} />
      <Path d={`M${x - 7} 102 L${x - 3} 114 L${x - 5} 114 L${x - 9} 102 Z`} fill={ILL.ink2} />
      <Path d={`M${x + 3} 102 L${x + 7} 114 L${x + 5} 114 L${x + 1} 102 Z`} fill={ILL.ink2} />
    </G>
  );
}

function CalendarScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      <Rect x={88} y={56} width={144} height={112} rx={12} fill={ILL.surface} stroke={ILL.line} strokeWidth={2} />
      <Rect x={88} y={56} width={144} height={28} rx={12} fill={ILL.brand} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        
          <Circle cx={108 + (i % 3) * 40} cy={108 + Math.floor(i / 3) * 36} r={10} fill={i === 2 ? ILL.brand : ILL.brandLight} />
        
      ))}
    </SceneFrame>
  );
}

function BrokerScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      <Rect x={64} y={64} width={192} height={104} rx={14} fill={ILL.surface} stroke={ILL.line} strokeWidth={2} />
      
        <Rect x={80} y={80} width={160} height={72} rx={8} fill={ILL.bg} />
        <Path d="M92 132 L132 108 L168 116 L228 84" fill="none" stroke={ILL.brand} strokeWidth={3} strokeLinecap="round" />
      
      <Circle cx={232} cy={76} r={8} fill={ILL.pos} />
    </SceneFrame>
  );
}

function RetirementScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Path d="M120 140c0-40 16-64 40-64s40 24 40 64H120z" fill={ILL.violetLight} stroke={ILL.violet} strokeWidth={2} />
        <Circle cx={160} cy={72} r={28} fill={ILL.brandLight} stroke={ILL.brand} strokeWidth={2} />
        <Path d="M148 140h24v24h-24z" fill={ILL.surface} stroke={ILL.line} strokeWidth={2} />
      
      
        <Circle cx={228} cy={56} r={16} fill={ILL.amberLight} stroke={ILL.amber} strokeWidth={2} />
      
    </SceneFrame>
  );
}

function DebtScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      <Rect x={72} y={140} width={176} height={12} rx={6} fill={ILL.line} />
      
        <Rect x={100} y={48} width={56} height={92} rx={8} fill={ILL.negLight} stroke={ILL.neg} strokeWidth={2} />
        <Path d="M116 72h24M116 92h24" stroke={ILL.neg} strokeWidth={2} strokeLinecap="round" />
      
      
        <Rect x={164} y={64} width={56} height={76} rx={8} fill={ILL.posLight} stroke={ILL.pos} strokeWidth={2} />
        <Path d="M180 88h24" stroke={ILL.pos} strokeWidth={3} strokeLinecap="round" />
      
    </SceneFrame>
  );
}

function InflationScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Rect x={88} y={100} width={48} height={56} rx={6} fill={ILL.amberLight} stroke={ILL.amber} strokeWidth={2} />
        <Rect x={144} y={80} width={48} height={76} rx={6} fill={ILL.amber} stroke={ILL.amber} strokeWidth={2} />
        <Rect x={200} y={60} width={48} height={96} rx={6} fill={ILL.negLight} stroke={ILL.neg} strokeWidth={2} />
      
      <Path d="M72 168h176" stroke={ILL.line} strokeWidth={2} />
      
        <Path d="M232 48 L248 32 L264 48" fill="none" stroke={ILL.neg} strokeWidth={3} strokeLinecap="round" />
      
    </SceneFrame>
  );
}

function TimeScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      
        <Circle cx={160} cy={104} r={48} fill={ILL.surface} stroke={ILL.brand} strokeWidth={2.5} />
        <Line x1={160} y1={104} x2={160} y2={72} stroke={ILL.brand} strokeWidth={3} strokeLinecap="round" />
        <Line x1={160} y1={104} x2={188} y2={116} stroke={ILL.amber} strokeWidth={2.5} strokeLinecap="round" />
      
      <Path d="M56 168 Q160 140 264 168" fill="none" stroke={ILL.pos} strokeWidth={3} strokeLinecap="round" />
    </SceneFrame>
  );
}

function VolatilityScene({ width, height }: SceneProps) {
  return (
    <SceneFrame width={width} height={height}>
      <Rect x={48} y={56} width={224} height={112} rx={14} fill={ILL.surface} stroke={ILL.line} strokeWidth={1.5} />
      
        <Path
          d="M64 120 Q96 60 128 120 T192 80 T256 110"
          fill="none"
          stroke={ILL.violet}
          strokeWidth={4}
          strokeLinecap="round"
        />
      
      <Path d="M64 148h192" stroke={ILL.line} strokeWidth={2} strokeDasharray="6 4" />
    </SceneFrame>
  );
}

const SCENE_MAP: Record<LessonImageKey, (p: SceneProps) => ReactElement> = {
  "money-coins": CoinsScene,
  "compound-chart": (p) => <ChartScene {...p} up />,
  "inflation-prices": InflationScene,
  "time-horizon": TimeScene,
  "credit-card": CardScene,
  "credit-score": CardScene,
  "debt-balance": DebtScene,
  "savings-jar": JarScene,
  retirement: RetirementScene,
  "tax-forms": TaxScene,
  brokerage: BrokerScene,
  "roth-ira": RetirementScene,
  "dca-calendar": CalendarScene,
  "stocks-chart": (p) => <ChartScene {...p} up />,
  "etf-diversify": PieScene,
  "risk-volatility": VolatilityScene,
  "themes-map": GlobeScene,
  "duel-compare": DuelScene,
  "quiz-check": QuizScene,
  "default-foundations": CoinsScene,
  "default-credit": CardScene,
  "default-retirement": RetirementScene,
  "default-investing": (p) => <ChartScene {...p} up />,
  "bonds-stack": BondsScene,
  "fed-building": FedScene,
  "bitcoin-coin": BitcoinScene,
  "global-markets": GlobeScene,
  "diversify-pie": PieScene,
  "tax-receipt": TaxScene,
  "behavior-brain": BrainScene,
  "dividend-coins": DividendScene,
  "recession-umbrella": UmbrellaScene,
};

type Props = SceneProps & { variant: LessonImageKey };

export function IllustrationScene({ variant, width, height, animate = true }: Props & { animate?: boolean }) {
  const Scene = SCENE_MAP[variant] ?? CoinsScene;
  const w = Math.max(width, 1);
  const h = Math.max(height, 1);

  const svg = <Scene width={w} height={h} />;

  if (!animate) {
    return <View style={{ width: w, height: h }}>{svg}</View>;
  }

  return (
    <AnimatedLayer bob={5} pulse={0.018} durationMs={2600}>
      <View style={{ width: w, height: h }}>{svg}</View>
    </AnimatedLayer>
  );
}

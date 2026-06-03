import { Text, View } from "react-native";

const TICKER_COLORS: Record<string, string> = {
  AAPL: "#555555",
  NVDA: "#76B900",
  MSFT: "#00A4EF",
  AMZN: "#FF9900",
  GOOGL: "#4285F4",
  META: "#1877F2",
  TSLA: "#E82127",
  BRK_B: "#2C3E50",
  JPM: "#0072CE",
  V: "#1A1F71",
  UNH: "#005CAB",
  WMT: "#0071DC",
  JNJ: "#D90000",
  PG: "#003DA5",
  XOM: "#DA291C",
  CVX: "#004B87",
  HD: "#F96302",
  MA: "#EB001B",
  BAC: "#012169",
  DIS: "#113CCF",
  NFLX: "#E50914",
  ADBE: "#FF0000",
  CRM: "#00A1E0",
  INTC: "#0071C5",
  AMD: "#ED1C24",
  QCOM: "#3253DC",
  PYPL: "#0070BA",
  COIN: "#0052FF",
  SCHD: "#1B4F93",
  VOO: "#1B4F93",
  QQQ: "#00A4EF",
  SPY: "#005596",
  IWM: "#005596",
  VTI: "#1B4F93",
  ARKK: "#FF5722",
};

type Props = {
  ticker: string;
  size?: number;
  color?: string; // brand-color override (e.g. AMZN orange)
};

export function Tick({ ticker, size = 40, color }: Props) {
  const trimmed = ticker.replace(/[.\-]/g, "").slice(0, 4);
  const radius = size * 0.28;
  const fontSize = size * 0.3;
  const resolvedColor = color ?? TICKER_COLORS[ticker.toUpperCase()];

  if (resolvedColor) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: resolvedColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          className="font-monoBold text-white"
          style={{ fontSize, letterSpacing: -0.4 }}
        >
          {trimmed}
        </Text>
      </View>
    );
  }
  return (
    <View
      className="bg-brand-bg items-center justify-center"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Text
        className="font-monoBold text-brand"
        style={{ fontSize, letterSpacing: -0.4 }}
      >
        {trimmed}
      </Text>
    </View>
  );
}

import { Text, View } from "react-native";

type Props = {
  ticker: string;
  size?: number;
  color?: string; // brand-color override (e.g. AMZN orange)
};

export function Tick({ ticker, size = 40, color }: Props) {
  const trimmed = ticker.replace(/[.\-]/g, "").slice(0, 4);
  const radius = size * 0.28;
  const fontSize = size * 0.3;

  if (color) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color,
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

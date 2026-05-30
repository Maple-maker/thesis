import { Text } from "react-native";

type Props = {
  value: number;
  size?: number;
  abs?: boolean;
};

export function Delta({ value, size = 13.5, abs = false }: Props) {
  if (value === 0) {
    return (
      <Text className="font-monoBold text-ink-3" style={{ fontSize: size }}>
        —
      </Text>
    );
  }
  const pos = value >= 0;
  return (
    <Text
      className={`font-monoBold ${pos ? "text-pos" : "text-neg"}`}
      style={{ fontSize: size }}
    >
      {pos ? "▲" : "▼"} {Math.abs(value).toFixed(abs ? 0 : 1)}
      {abs ? "" : "%"}
    </Text>
  );
}

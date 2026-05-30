import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable, View, ViewStyle } from "react-native";

type Props = {
  color: string; // primary accent color (start of gradient)
  endColor?: string; // optional end color
  onPress?: () => void;
  children: ReactNode;
  style?: ViewStyle;
};

/** Linear-gradient hero card used for featured narratives and theme detail hero. */
export function FeaturedCard({ color, endColor, onPress, children, style }: Props) {
  const end = endColor ?? darken(color, 0.45);
  const Wrap = onPress ? Pressable : View;

  return (
    <Wrap
      onPress={onPress as any}
      style={{
        borderRadius: 22,
        overflow: "hidden",
        shadowColor: color,
        shadowOpacity: 0.25,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 14 },
        elevation: 6,
        ...style,
      }}
    >
      <LinearGradient
        colors={[color, end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        {children}
      </LinearGradient>
    </Wrap>
  );
}

function darken(hex: string, amount: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${[dr, dg, db].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

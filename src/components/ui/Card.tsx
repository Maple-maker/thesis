import { ReactNode } from "react";
import { Pressable, View, ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  pad?: number;
  className?: string;
  style?: ViewStyle;
};

const baseShadow: ViewStyle = {
  shadowColor: "#142F22",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export function Card({ children, onPress, pad = 16, className = "", style }: Props) {
  const composed: ViewStyle = { padding: pad, ...baseShadow, ...style };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`bg-bg-surface border border-line rounded-card ${className}`}
        style={({ pressed }) => [composed, { opacity: pressed ? 0.92 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View
      className={`bg-bg-surface border border-line rounded-card ${className}`}
      style={composed}
    >
      {children}
    </View>
  );
}

import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  children: ReactNode;
  action?: string;
  onAction?: () => void;
};

export function SectionTitle({ children, action, onAction }: Props) {
  return (
    <View className="flex-row items-baseline justify-between mb-3">
      <Text
        className="font-displayX text-ink text-[19px]"
        style={{ letterSpacing: -0.2 }}
      >
        {children}
      </Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text className="text-brand text-[14px] font-sansBold">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-[1.5px] mb-1.5">
      {children}
    </Text>
  );
}

import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Text, View } from "react-native";

import { Icon } from "../Icon";

type Props = {
  label?: string;
  children: ReactNode;
};

/** Gradient-bordered "thesis recommendation" card */
export function ThesisBadge({ label = "Thesis recommendation", children }: Props) {
  return (
    <LinearGradient
      colors={["#0E7A66", "#D98512"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 1.5 }}
    >
      <View
        className="bg-bg-surface rounded-[18px] p-4"
        style={{ paddingTop: 16, paddingBottom: 17 }}
      >
        <View className="flex-row items-center mb-3">
          <View className="bg-brand-bg rounded-[9px] flex-row items-center px-2.5 py-1.5">
            <Icon name="sparkle" size={14} sw={2} color="#0E7A66" />
            <Text className="text-brand text-[11px] font-sansX uppercase ml-1.5 tracking-wider">
              {label}
            </Text>
          </View>
        </View>
        {children}
      </View>
    </LinearGradient>
  );
}

import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";

type Props = {
  totalScreens: number;
  screenIndex: number;
  estimatedMin?: number;
  showTimePill?: boolean;
  visual: ReactNode;
  onClose: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  children: ReactNode;
};

export function LessonPlayerLayout({
  totalScreens,
  screenIndex,
  estimatedMin,
  showTimePill,
  visual,
  onClose,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  children,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      {/* Segmented progress */}
      <View className="flex-row gap-x-1 px-4 pt-2 pb-3">
        {Array.from({ length: totalScreens }).map((_, i) => (
          <View
            key={i}
            className={`flex-1 h-[3px] rounded-full ${i <= screenIndex ? "bg-brand" : "bg-track"}`}
          />
        ))}
      </View>

      <View className="flex-row items-center justify-between px-4 mb-2">
        {showTimePill && estimatedMin != null ? (
          <View className="flex-row items-center px-2.5 py-1 rounded-full bg-bg-surface border border-line">
            <Icon name="cap" size={12} color="#5C6B62" sw={2} />
            <Text className="text-ink-2 text-[11px] font-sansMd ml-1.5">{estimatedMin} min</Text>
          </View>
        ) : (
          <View />
        )}
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="w-[36px] h-[36px] rounded-full bg-bg-surface border border-line items-center justify-center active:opacity-70"
        >
          <Icon name="close" size={16} color="#16201C" sw={2} />
        </Pressable>
      </View>

      {/* Illustration panel */}
      <View
        className="mx-4 mb-4 rounded-[16px] overflow-hidden border border-line bg-bg-surface2"
        style={{ height: 200 }}
      >
        {visual ?? (
          <View className="flex-1 items-center justify-center bg-bg-surface2">
            <Text className="text-ink-3 text-[12px] font-sansMd">Loading illustration…</Text>
          </View>
        )}
      </View>

      {/* Text panel */}
      <View className="flex-1 bg-bg-surface rounded-t-[22px] border-t border-line px-5 pt-5">
        <View className="flex-1">{children}</View>
        <View className="pb-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <Button
            label={continueLabel}
            onPress={onContinue}
            fullWidth
            disabled={continueDisabled}
          />
        </View>
      </View>
    </View>
  );
}

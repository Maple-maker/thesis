import * as Haptics from "expo-haptics";
import { ReactNode } from "react";
import { Pressable, Text, View, ViewStyle } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "pill" | "outline";
type Size = "sm" | "md" | "lg";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
};

const shadow: ViewStyle = {
  shadowColor: "#142F22",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  leftAdornment,
  rightAdornment,
}: Props) {
  const { container, text } = stylesFor(variant, size, disabled);

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.selectionAsync();
        onPress?.();
      }}
      disabled={disabled}
      className={`${container} ${fullWidth ? "w-full" : ""}`}
      style={({ pressed }) => [
        variant === "primary" ? shadow : undefined,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View className="flex-row items-center justify-center">
        {leftAdornment ? <View className="mr-2">{leftAdornment}</View> : null}
        <Text className={text}>{label}</Text>
        {rightAdornment ? <View className="ml-2">{rightAdornment}</View> : null}
      </View>
    </Pressable>
  );
}

function stylesFor(variant: Variant, size: Size, disabled: boolean) {
  const padding =
    size === "sm" ? "px-4 py-2.5" : size === "md" ? "px-5 py-3.5" : "px-6 py-4";
  const radius =
    size === "sm" ? "rounded-[12px]" : size === "md" ? "rounded-[14px]" : "rounded-[16px]";
  const textSize =
    size === "sm" ? "text-[13.5px]" : size === "md" ? "text-[15px]" : "text-base";

  if (variant === "primary") {
    return {
      container: `${padding} ${radius} ${disabled ? "bg-brand-deep opacity-50" : "bg-brand"} items-center`,
      text: `${textSize} font-sansX text-white`,
    };
  }
  if (variant === "secondary") {
    return {
      container: `${padding} ${radius} bg-bg-surface border border-line items-center`,
      text: `${textSize} font-sansBold text-ink`,
    };
  }
  if (variant === "outline") {
    return {
      container: `${padding} ${radius} bg-transparent border border-brand items-center`,
      text: `${textSize} font-sansBold text-brand`,
    };
  }
  if (variant === "pill") {
    return {
      container: `px-4 py-2.5 rounded-[12px] bg-brand items-center`,
      text: `text-[13.5px] font-sansBold text-white`,
    };
  }
  return {
    container: `${padding} ${radius} bg-transparent items-center`,
    text: `${textSize} font-sansSb text-ink-2`,
  };
}

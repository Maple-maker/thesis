import { Pressable, Text } from "react-native";

import { Icon, type IconName } from "@/components/Icon";

type Props = {
  label: string;
  icon?: IconName;
  /** Amber styling for stress-test style prompts. */
  tone?: "default" | "amber";
  onPress: () => void;
};

/** Pre-fill suggestion pill for the advisor input, derived from the profile. */
export function PromptChip({ label, icon, tone = "default", onPress }: Props) {
  const amber = tone === "amber";
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-3 py-2 rounded-[20px] border active:opacity-70 ${
        amber ? "bg-amber-bg border-amber/30" : "bg-bg-surface border-line"
      }`}
    >
      {icon ? (
        <Icon
          name={icon}
          size={13}
          color={amber ? "#D98512" : "#0E7A66"}
          sw={2}
        />
      ) : null}
      <Text
        className={`text-[12.5px] font-sansSb ${icon ? "ml-1.5" : ""} ${
          amber ? "text-amber" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

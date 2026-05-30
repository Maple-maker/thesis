import { Pressable, View } from "react-native";

import { Icon, type IconName } from "../Icon";

type Props = {
  name: IconName;
  onPress?: () => void;
  size?: "sm" | "md";
  tone?: "default" | "brand" | "ghost";
  iconSize?: number;
  sw?: number;
};

export function IconBtn({ name, onPress, size = "md", tone = "default", iconSize, sw = 1.8 }: Props) {
  const dim = size === "md" ? 40 : 32;
  const radius = size === "md" ? 13 : 10;
  const iSize = iconSize ?? (size === "md" ? 21 : 17);

  let containerClass = "";
  let color = "#4D5A54";
  if (tone === "default") {
    containerClass = "bg-bg-surface border border-line";
    color = "#4D5A54";
  } else if (tone === "brand") {
    containerClass = "bg-brand-bg";
    color = "#0E7A66";
  } else {
    containerClass = "bg-white/16";
    color = "#FFFFFF";
  }

  return (
    <Pressable
      onPress={onPress}
      className={`items-center justify-center ${containerClass}`}
      style={({ pressed }) => [
        { width: dim, height: dim, borderRadius: radius, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Icon name={name} size={iSize} sw={sw} color={color} />
    </Pressable>
  );
}

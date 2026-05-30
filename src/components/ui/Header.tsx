import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { Text, View } from "react-native";

import { IconBtn } from "./IconBtn";

type Props = {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
};

export function Header({ title, subtitle, back, right }: Props) {
  const router = useRouter();
  return (
    <View className="pb-3 pt-1">
      <View className="flex-row items-center justify-between">
        {back ? (
          <IconBtn name="back" onPress={() => router.back()} sw={2.2} />
        ) : (
          <View style={{ width: 40, height: 40 }} />
        )}
        <View className="flex-1" />
        <View>{right ?? null}</View>
      </View>
      {title ? (
        <Text
          className="text-ink text-[28px] font-displayX mt-3"
          style={{ letterSpacing: -0.6, lineHeight: 32 }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text className="text-ink-2 text-[14.5px] font-sansMd mt-1 leading-[20px]">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

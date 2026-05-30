import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  bg?: "default" | "surface" | "subtle";
};

const bgClass: Record<NonNullable<Props["bg"]>, string> = {
  default: "bg-bg",
  surface: "bg-bg-surface",
  subtle: "bg-bg-surface2",
};

export function Screen({ children, scroll = true, padded = true, bg = "default" }: Props) {
  const Wrapper = scroll ? ScrollView : View;
  return (
    <SafeAreaView className={`flex-1 ${bgClass[bg]}`} edges={["top", "left", "right"]}>
      <Wrapper
        className={`flex-1 ${padded ? "px-[17px]" : ""}`}
        contentContainerStyle={
          scroll ? { paddingBottom: 110, paddingTop: 12 } : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}

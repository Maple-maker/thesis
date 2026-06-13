import { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  role: "ai" | "user";
  children: string;
  /** Rendered below the text inside the bubble (e.g. Learn pills). */
  footer?: ReactNode;
};

/**
 * Advisor chat bubbles per the design spec:
 * AI — bg token (#F3F5F1), radius 4/14/14/14, left-aligned.
 * User — brand (#0E7A66), radius 14/4/14/14, right-aligned.
 */
export function ChatBubble({ role, children, footer }: Props) {
  if (role === "user") {
    return (
      <View
        className="bg-brand self-end px-3 py-2.5"
        style={{
          maxWidth: "85%",
          borderTopLeftRadius: 14,
          borderTopRightRadius: 4,
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
        }}
      >
        <Text className="text-white text-[14.5px] font-sansMd leading-[21px]">
          {children}
        </Text>
      </View>
    );
  }
  return (
    <View
      className="bg-bg self-start px-3 py-2.5"
      style={{
        maxWidth: "90%",
        borderTopLeftRadius: 4,
        borderTopRightRadius: 14,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
      }}
    >
      <Text className="text-ink text-[14.5px] font-sansMd leading-[21px]">
        {children}
      </Text>
      {footer}
    </View>
  );
}

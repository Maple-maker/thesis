import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { GlossaryText } from "@/components/education/GlossaryText";

export function BullBearCaseCard({
  type,
  ticker,
  items,
  defaultOpen = true,
}: {
  type: "bull" | "bear";
  ticker: string;
  items: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bull = type === "bull";
  return (
    <View
      className="bg-bg-surface overflow-hidden"
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: bull ? "#BDE6CE" : "#F2C9BE",
      }}
    >
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center px-3.5 py-3"
        style={{ backgroundColor: bull ? "#E5F5EC" : "#FBEAE5" }}
      >
        <View
          className="items-center justify-center mr-2.5"
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            backgroundColor: bull ? "#149059" : "#D8472C",
          }}
        >
          <Icon name={bull ? "trend" : "shield"} size={16} color="#FFFFFF" sw={2} />
        </View>
        <Text
          className="flex-1 font-displayX text-[15.5px]"
          style={{
            color: bull ? "#0C5836" : "#8F2A18",
            letterSpacing: -0.2,
          }}
        >
          {bull ? "Bull case" : "Bear case"} for {ticker}
        </Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <Icon
            name="chevDown"
            size={18}
            color={bull ? "#149059" : "#D8472C"}
            sw={2}
          />
        </View>
      </Pressable>
      {open && (
        <View className="px-4 py-3.5 gap-y-2.5">
          {items.map((item, i) => (
            <View key={i} className="flex-row items-start">
              <Text
                className="font-sansX text-[16px] mr-2.5"
                style={{ color: bull ? "#149059" : "#D8472C", marginTop: -1 }}
              >
                {bull ? "+" : "–"}
              </Text>
              <View className="flex-1">
                <GlossaryText content={item} textSize={13.5} lineHeight={20} />
              </View>
            </View>
          ))}
          <Text className="text-ink-3 text-[10px] font-sansMd mt-1">
            Tap highlighted terms to learn · educational, not a buy/sell call
          </Text>
        </View>
      )}
    </View>
  );
}

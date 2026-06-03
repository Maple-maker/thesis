import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";

type Props = {
  onDismiss: () => void;
};

export function NavigationTutorial({ onDismiss }: Props) {
  return (
    <Pressable
      onPress={onDismiss}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(10, 10, 11, 0.75)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        paddingHorizontal: 24,
        paddingBottom: 100,
      }}
    >
      {/* Card */}
      <View
        className="bg-bg-surface rounded-[24px] p-6 w-full"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        <View className="items-center mb-5">
          <View className="bg-brand-bg w-[56px] h-[56px] rounded-[18px] items-center justify-center mb-3">
            <Icon name="sparkle" size={28} color="#0E7A66" />
          </View>
          <Text className="text-ink font-displayX text-[22px] text-center" style={{ letterSpacing: -0.4 }}>
            Welcome to Thesis
          </Text>
          <Text className="text-ink-2 text-[14px] font-sansMd text-center mt-2 leading-[20px]">
            Here's a quick tour of the app. Tap anywhere to dismiss.
          </Text>
        </View>

        <View className="gap-y-4 mb-5">
          <TutorialStep
            icon="home"
            label="Home"
            description="Your thesis feed, market insights, and daily briefs — everything starts here."
          />
          <TutorialStep
            icon="cap"
            label="Education"
            description="Learn investing fundamentals with structured courses and a glossary of concepts."
          />
          <TutorialStep
            icon="sparkle"
            label="Builder"
            description="The center tab. Build your model portfolio, explore investor lenses, and customize your thesis."
          />
          <TutorialStep
            icon="piggy"
            label="Accounts"
            description="Link accounts to get a real portfolio X-Ray, or use demo data to explore."
          />
          <TutorialStep
            icon="flag"
            label="Watchlist"
            description="Track stocks and ETFs, run head-to-head duels, and build conviction over time."
          />
        </View>

        <View className="bg-brand-bg rounded-[14px] px-4 py-3.5">
          <Text className="text-brand-deep text-[13px] font-sansSb leading-[18px]">
            Tip: Tap the bell in the top-right corner any time to open Settings, or long-press "Investor" on the Home screen for a quick reset.
          </Text>
        </View>

        <View className="mt-5">
          <View className="bg-brand rounded-[14px] py-3.5 items-center active:opacity-80">
            <Text className="text-white font-sansBold text-[15px]">Got it — let's go</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function TutorialStep({
  icon,
  label,
  description,
}: {
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start">
      <View className="bg-bg-surface2 w-[36px] h-[36px] rounded-[10px] items-center justify-center mr-3 mt-0.5">
        <Icon name={icon as any} size={18} color="#16201C" sw={2} />
      </View>
      <View className="flex-1">
        <Text className="text-ink font-displayX text-[14px]" style={{ letterSpacing: -0.2 }}>
          {label}
        </Text>
        <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px] mt-0.5">
          {description}
        </Text>
      </View>
    </View>
  );
}

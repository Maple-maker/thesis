import { Tabs } from "expo-router";
import { Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";

function TabItem({
  icon,
  label,
  focused,
}: {
  icon: IconName;
  label: string;
  focused: boolean;
}) {
  const color = focused ? "#0E7A66" : "#8C988F";
  return (
    <View className="items-center" style={{ minWidth: 56, paddingTop: 4 }}>
      <Icon name={icon} size={23} sw={focused ? 2.1 : 1.8} color={color} />
      <Text
        className={`text-[10.5px] mt-1 ${focused ? "font-sansX" : "font-sansSb"}`}
        style={{ color }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Center tab, portfolio builder is the hero action */
function BuilderTabItem({ focused }: { focused: boolean }) {
  return (
    <View className="items-center" style={{ marginTop: -18 }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: focused ? "#0E7A66" : "#16201C",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#0E7A66",
          shadowOpacity: focused ? 0.35 : 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Icon name="sparkle" size={26} sw={2.2} color="#FFFFFF" />
      </View>
      <Text
        numberOfLines={1}
        className={`text-[10px] mt-1.5 ${focused ? "font-sansX" : "font-sansSb"}`}
        style={{ color: focused ? "#0E7A66" : "#8C988F", minWidth: 48, textAlign: "center" }}
      >
        Build
      </Text>
    </View>
  );
}

/** Expo Router: hide from tab bar, do not combine with tabBarButton */
const HIDDEN_TAB = { href: null } as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EAEDE8",
          borderTopWidth: 1,
          height: 84,
          paddingTop: 9,
          paddingBottom: 24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="cap" label="Education" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: "Builder",
          tabBarIcon: ({ focused }) => <BuilderTabItem focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="piggy" label="Accounts" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="flag" label="Watchlist" focused={focused} />
          ),
        }}
      />
      {/* Hidden, nested stacks, library, legacy routes */}
      <Tabs.Screen name="themes" options={HIDDEN_TAB} />
      <Tabs.Screen name="journal" options={HIDDEN_TAB} />
      <Tabs.Screen name="learn" options={HIDDEN_TAB} />
      <Tabs.Screen name="theme" options={HIDDEN_TAB} />
      <Tabs.Screen name="stock" options={HIDDEN_TAB} />
      <Tabs.Screen name="etf" options={HIDDEN_TAB} />
    </Tabs>
  );
}

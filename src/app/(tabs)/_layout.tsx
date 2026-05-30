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
    <View className="items-center" style={{ minWidth: 60, paddingTop: 4 }}>
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
        name="themes"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="discover" label="Themes" focused={focused} />
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
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="book" label="Journal" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="compass" label="Builder" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

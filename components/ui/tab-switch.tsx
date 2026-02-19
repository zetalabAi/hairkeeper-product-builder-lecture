import { Pressable, Text, View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface Tab {
  key: string;
  label: string;
}

interface TabSwitchProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TabSwitch({ tabs, activeTab, onTabChange }: TabSwitchProps) {
  const handlePress = (key: string) => {
    if (key === activeTab) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabChange(key);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#F5F5F5",
        borderRadius: 100,
        padding: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => handlePress(tab.key)}
            style={{ flex: 1, borderRadius: 100, overflow: "hidden" }}
          >
            {isActive ? (
              <LinearGradient
                colors={["#A855F7", "#EC4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 10,
                  alignItems: "center",
                  borderRadius: 100,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>
                  {tab.label}
                </Text>
              </LinearGradient>
            ) : (
              <View style={{ paddingVertical: 10, alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: "#6B6B6B" }}>
                  {tab.label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

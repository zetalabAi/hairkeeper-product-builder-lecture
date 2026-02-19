import { View, Text, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLOR_PRIMARY } from "@/constants/colors";

interface SubScreenHeaderProps {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
}

export function SubScreenHeader({
  title,
  showBack = true,
  showHome = true,
  onBack,
}: SubScreenHeaderProps) {
  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/(tabs)" as any);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
      }}
    >
      {showBack ? (
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            opacity: pressed ? 0.85 : 1,
            transform: [{ translateY: pressed ? 1 : 0 }],
          })}
        >
          <Ionicons name="chevron-back" size={22} color={COLOR_PRIMARY} />
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}

      <Text style={{ fontSize: 18, fontWeight: "600", color: "#1A1A1A" }}>
        {title}
      </Text>

      {showHome ? (
        <Pressable
          onPress={handleHome}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            opacity: pressed ? 0.85 : 1,
            transform: [{ translateY: pressed ? 1 : 0 }],
          })}
        >
          <Ionicons name="home-outline" size={22} color={COLOR_PRIMARY} />
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}

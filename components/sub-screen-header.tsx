import { View, Text, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface SubScreenHeaderProps {
  title: string;
  /**
   * Show back button (default: true)
   */
  showBack?: boolean;
  /**
   * Show home button (default: true)
   */
  showHome?: boolean;
  /**
   * Custom back handler
   */
  onBack?: () => void;
}

/**
 * 서브 화면 헤더 컴포넌트
 * - 좌측: 뒤로가기 버튼
 * - 중앙: 제목
 * - 우측: 홈 버튼
 */
export function SubScreenHeader({
  title,
  showBack = true,
  showHome = true,
  onBack,
}: SubScreenHeaderProps) {
  const colors = useColors();

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
      {/* Left: Back Button */}
      {showBack ? (
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
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
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}

      {/* Center: Title */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.foreground,
        }}
      >
        {title}
      </Text>

      {/* Right: Home Button */}
      {showHome ? (
        <Pressable
          onPress={handleHome}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
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
          <Ionicons name="home-outline" size={22} color={colors.primary} />
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}

import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const colors = useColors();

  const handleLogin = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // TODO: 로그인 처리
    console.log("Login pressed");
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-foreground">프로필</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center mb-8">
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="person" size={48} color={colors.muted} />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              로그인이 필요합니다
            </Text>
            <Text className="text-sm text-muted text-center">
              로그인하고 더 많은 기능을 이용하세요
            </Text>
          </View>

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
                backgroundColor: colors.primary,
                width: "100%",
                maxWidth: 300,
              },
            ]}
            className="py-4 rounded-full items-center"
          >
            <Text className="text-white text-base font-semibold">로그인</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

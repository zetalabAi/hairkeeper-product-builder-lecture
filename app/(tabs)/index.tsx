import { View, Text, Pressable, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/hooks/use-auth";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const { user, isAuthenticated, loading } = useAuth();
  const colors = useColors();

  const handlePhotoSelect = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/photo-select" as any);
  };

  const handleSettings = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // TODO: 설정 화면으로 이동
    console.log("Settings");
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">로딩 중...</Text>
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center px-8">
        <Text className="text-2xl font-bold text-foreground mb-4">
          로그인이 필요합니다
        </Text>
        <Pressable
          onPress={() => router.push("/login" as any)}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          className="bg-primary px-8 py-4 rounded-full"
        >
          <Text className="text-white text-base font-semibold">로그인하기</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-2xl font-bold text-foreground">머리보존 AI</Text>
        <Pressable
          onPress={handleSettings}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-8">
          {/* Main Action Button */}
          <View className="items-center mb-12">
            <Pressable
              onPress={handlePhotoSelect}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 8,
                },
              ]}
            >
              <Text style={{ fontSize: 64, marginBottom: 8 }}>📸</Text>
              <Text className="text-white text-lg font-semibold">사진 선택</Text>
            </Pressable>
          </View>

          {/* Instructions */}
          <View className="items-center mb-8">
            <Text className="text-base text-muted text-center leading-relaxed">
              고객의 헤어 스타일 사진을 선택하여{"\n"}
              얼굴만 안전하게 교체하세요
            </Text>
          </View>

          {/* Recent Projects Section */}
          <View className="w-full">
            <Text className="text-lg font-semibold text-foreground mb-4">
              최근 작업
            </Text>
            <View className="bg-surface rounded-2xl p-6 items-center">
              <Text className="text-muted text-center">
                아직 작업 내역이 없습니다
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

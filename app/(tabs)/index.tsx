import { View, Text, Pressable, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
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

  // 테스트용: 로그인 체크 제거

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-2xl font-bold text-foreground">머리보존</Text>
        <Pressable
          onPress={handleSettings}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Ionicons name="add" size={64} color="white" />
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
                  width: 160,
                  height: 160,
                  borderRadius: 32,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 24,
                },
              ]}
            >
              <Text style={{ fontSize: 64, color: "white" }}>+</Text>
            </Pressable>

            <Text className="text-xl font-semibold text-foreground mb-2">
              새 프로젝트 시작
            </Text>
            <Text className="text-sm text-muted text-center">
              사진을 선택하여{"\n"}얼굴 교체 작업을 시작하세요
            </Text>
          </View>

          {/* Recent Projects Section */}
          <View className="w-full">
            <Text className="text-lg font-semibold text-foreground mb-4">
              최근 작업물
            </Text>
            <View className="bg-surface rounded-2xl p-8 items-center">
              <Text className="text-muted text-center text-base">
                아직 작업물이 없습니다{"\n"}새 프로젝트를 시작해보세요
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

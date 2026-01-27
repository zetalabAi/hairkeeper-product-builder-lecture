import { ScrollView, Text, View, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const colors = useColors();

  const handlePhotoSelect = () => {
    router.push("/photo-select" as any);
  };

  const handleProfile = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/profile" as any);
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View style={{ width: 40 }} />
        <Pressable
          onPress={handleProfile}
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
          <Ionicons name="person-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          {/* Hero Section */}
          <View className="items-center mb-12">
            <Text className="text-3xl font-bold text-foreground mb-3 text-center">
              머리보존 AI
            </Text>
            <Text className="text-base text-muted text-center">
              사진을 선택하여{"\n"}
              얼굴 교체 작업을 시작하세요
            </Text>
          </View>

          {/* Main Action */}
          <View className="items-center mb-8">
            <Button
              label="새 프로젝트 시작"
              variant="primary"
              size="large"
              icon="add"
              iconPosition="left"
              onPress={handlePhotoSelect}
              fullWidth
            />
          </View>

          {/* Recent Projects Section */}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-foreground mb-4">
              최근 작업물
            </Text>
            <View
              className="bg-surface rounded-3xl p-8 items-center"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text className="text-sm text-muted text-center">
                아직 작업 기록이 없습니다.{"\n"}
                첫 프로젝트를 시작해보세요!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

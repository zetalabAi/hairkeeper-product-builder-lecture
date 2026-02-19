import { ScrollView, Text, View, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const colors = useColors();

  const handlePhotoSelect = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
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
      {/* Gradient Header */}
      <LinearGradient
        colors={["#A855F7", "#EC4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.5 }}>
              HairKeeper
            </Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
              내 작품, 얼굴만 바꿔
            </Text>
          </View>
          <Pressable
            onPress={handleProfile}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.25)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Ionicons name="person-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-8">
          {/* Main Action */}
          <Button
            label="+ 사진 선택"
            variant="primary"
            size="large"
            fullWidth
            onPress={handlePhotoSelect}
          />

          {/* Recent Projects Section */}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-foreground mb-4">
              최근 작업물
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Ionicons name="images-outline" size={36} color={colors.muted} />
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 12, textAlign: "center" }}>
                아직 작업 기록이 없습니다.{"\n"}첫 프로젝트를 시작해보세요!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

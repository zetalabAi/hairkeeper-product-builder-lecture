import { ScrollView, Text, View, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GRADIENT_PRIMARY, BG_PINK, COLOR_PRIMARY, COLOR_PRIMARY_LIGHT, COLOR_PRIMARY_BORDER } from "@/constants/colors";

const ACTION_BUTTONS = [
  { icon: "camera", label: "사진 선택", route: "/photo-select" },
  { icon: "images", label: "갤러리", route: "/photo-select" },
  { icon: "star", label: "즐겨찾기", route: "/history" },
  { icon: "bar-chart", label: "통계", route: "/history" },
] as const;

export default function HomeScreen() {
  const colors = useColors();

  const handleNav = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <ScreenContainer style={{ backgroundColor: BG_PINK }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 56,
            paddingBottom: 8,
          }}
        >
          <Pressable
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="menu" size={22} color={COLOR_PRIMARY} />
          </Pressable>

          <Pressable
            onPress={() => handleNav("/profile")}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: COLOR_PRIMARY,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A" }}>
            안녕하세요 디자이너님! 👋
          </Text>
          <Text style={{ fontSize: 15, color: "#4A4A4A", marginTop: 4 }}>
            오늘도 멋진 작업 하세요
          </Text>
        </View>

        {/* Promo Banner */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <LinearGradient
            colors={GRADIENT_PRIMARY}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 20,
              padding: 24,
              shadowColor: COLOR_PRIMARY,
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
              HairKeeper AI
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 }}>
              AI로 5분만에 완성
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>
              머리는 보존, 얼굴만 교체
            </Text>
            <Pressable
              onPress={() => handleNav("/photo-select")}
              style={({ pressed }) => ({
                backgroundColor: "rgba(255,255,255,0.25)",
                borderRadius: 20,
                paddingVertical: 10,
                paddingHorizontal: 20,
                alignSelf: "flex-start",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                지금 시작하기 →
              </Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Action Grid */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#1A1A1A", marginBottom: 16 }}>
            작업 시작하기
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {ACTION_BUTTONS.map((btn) => (
              <Pressable
                key={btn.label}
                onPress={() => handleNav(btn.route)}
                style={({ pressed }) => ({
                  width: "47%",
                  aspectRatio: 1,
                  backgroundColor: pressed ? COLOR_PRIMARY_LIGHT : "#FFFFFF",
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: COLOR_PRIMARY_BORDER,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: COLOR_PRIMARY,
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 4,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: COLOR_PRIMARY_LIGHT,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Ionicons name={btn.icon as any} size={26} color={COLOR_PRIMARY} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>
                  {btn.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Work */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#1A1A1A" }}>
              최근 작업
            </Text>
            <Pressable onPress={() => handleNav("/history")}>
              <Text style={{ fontSize: 14, color: COLOR_PRIMARY, fontWeight: "600" }}>더보기</Text>
            </Pressable>
          </View>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 28,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: COLOR_PRIMARY_BORDER,
            }}
          >
            <Ionicons name="images-outline" size={36} color={colors.muted} />
            <Text style={{ fontSize: 14, color: "#4A4A4A", marginTop: 10, textAlign: "center" }}>
              아직 작업 기록이 없습니다.{"\n"}첫 프로젝트를 시작해보세요!
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

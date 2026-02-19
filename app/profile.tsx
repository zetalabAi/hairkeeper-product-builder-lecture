import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDemoAuth } from "@/lib/demo-auth-context";
import {
  BG_PINK,
  COLOR_PRIMARY,
  COLOR_PRIMARY_LIGHT,
  COLOR_PRIMARY_BORDER,
  COLOR_SECONDARY,
} from "@/constants/colors";

type ProfileItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  badge?: string;
};

export default function ProfileScreen() {
  const { user, isLoggedIn, login, logout } = useDemoAuth();

  const handleLogin = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await login();
  };

  const handlePress = async (item: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (item === "logout") {
      await logout();
      return;
    }

    // TODO: 각 프로필 항목 처리
    console.log(`Pressed: ${item}`);
  };

  const profileItems: ProfileItem[] = [
    {
      id: "subscription",
      label: "구독 관리",
      icon: "card-outline",
      subtitle: user?.subscription === "premium" ? "프리미엄 플랜" : "무료 플랜",
      badge: user?.subscription === "premium" ? "Premium" : undefined,
    },
    {
      id: "payment",
      label: "결제 관리",
      icon: "wallet-outline",
      subtitle: "결제 수단 및 결제 내역",
    },
    {
      id: "usage",
      label: "사용 통계",
      icon: "stats-chart-outline",
      subtitle: "이번 달 12회 사용",
    },
    {
      id: "account",
      label: "계정 설정",
      icon: "settings-outline",
      subtitle: "이메일, 비밀번호 변경",
    },
    {
      id: "logout",
      label: "로그아웃",
      icon: "log-out-outline",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BG_PINK }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <SubScreenHeader title="프로필" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            borderWidth: 1.5,
            borderColor: COLOR_PRIMARY_BORDER,
            shadowColor: COLOR_PRIMARY,
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLOR_PRIMARY_LIGHT,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="person" size={36} color={COLOR_PRIMARY} />
            </View>

            <View style={{ flex: 1 }}>
              {isLoggedIn && user ? (
                <>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 }}>
                    {user.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6B6B6B" }}>{user.email}</Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "600", color: "#1A1A1A", marginBottom: 4 }}>
                    로그인이 필요합니다
                  </Text>
                  <Text style={{ fontSize: 13, color: "#6B6B6B" }}>
                    로그인하고 더 많은 기능을 이용하세요
                  </Text>
                </>
              )}
            </View>
          </View>

          {!isLoggedIn && (
            <View style={{ marginTop: 20 }}>
              <Button
                label="로그인 (데모)"
                variant="primary"
                size="medium"
                fullWidth
                icon="log-in-outline"
                iconPosition="left"
                onPress={handleLogin}
              />
            </View>
          )}
        </View>

        {isLoggedIn && (
          <View>
            {profileItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handlePress(item.id)}
                style={({ pressed }) => ({
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: item.id === "logout" ? "#FCE4EC" : COLOR_PRIMARY_BORDER,
                  shadowColor: item.id === "logout" ? COLOR_SECONDARY : COLOR_PRIMARY,
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ translateY: pressed ? 1 : 0 }],
                })}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: item.id === "logout" ? "#FCE4EC" : COLOR_PRIMARY_LIGHT,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Ionicons name={item.icon} size={24} color={item.id === "logout" ? COLOR_SECONDARY : COLOR_PRIMARY} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: item.subtitle ? 4 : 0 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: item.id === "logout" ? COLOR_SECONDARY : "#1A1A1A",
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.badge && (
                      <View
                        style={{
                          backgroundColor: COLOR_PRIMARY,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 8,
                          marginLeft: 8,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#FFFFFF" }}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  {item.subtitle && <Text style={{ fontSize: 13, color: "#6B6B6B" }}>{item.subtitle}</Text>}
                </View>

                {item.id !== "logout" && <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

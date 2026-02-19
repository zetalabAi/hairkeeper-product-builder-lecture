import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { Button } from "@/components/ui/button";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDemoAuth } from "@/lib/demo-auth-context";

type ProfileItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  badge?: string;
};

export default function ProfileScreen() {
  const colors = useColors();
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
    <ScreenContainer className="bg-background">
      <SubScreenHeader title="프로필" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            shadowColor: "#000",
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
                borderRadius: 20,
                backgroundColor: colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="person" size={36} color={colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              {isLoggedIn && user ? (
                <>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, marginBottom: 4 }}>
                    {user.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.muted }}>{user.email}</Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                    로그인이 필요합니다
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>
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
                  backgroundColor: colors.surface,
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
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
                    borderRadius: 14,
                    backgroundColor: item.id === "logout" ? colors.error + "20" : colors.primary + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Ionicons name={item.icon} size={24} color={item.id === "logout" ? colors.error : colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: item.subtitle ? 4 : 0 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: item.id === "logout" ? colors.error : colors.foreground,
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.badge && (
                      <View
                        style={{
                          backgroundColor: colors.primary,
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
                  {item.subtitle && <Text style={{ fontSize: 13, color: colors.muted }}>{item.subtitle}</Text>}
                </View>

                {item.id !== "logout" && <Ionicons name="chevron-forward" size={20} color={colors.muted} />}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

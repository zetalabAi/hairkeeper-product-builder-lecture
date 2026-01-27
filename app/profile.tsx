import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { Button } from "@/components/ui/button";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type ProfileItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  badge?: string;
};

export default function ProfileScreen() {
  const colors = useColors();

  const handleLogin = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/login" as any);
  };

  const handlePress = (item: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // TODO: 각 프로필 항목 처리
    console.log(`Pressed: ${item}`);
  };

  // 로그인 상태 (테스트용 false)
  const isLoggedIn = false;

  const profileItems: ProfileItem[] = [
    {
      id: "subscription",
      label: "구독 관리",
      icon: "card-outline",
      subtitle: "프리미엄 플랜",
      badge: "Premium",
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
      {/* Header */}
      <SubScreenHeader title="프로필" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8 }}>
        {/* Profile Card */}
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
            {/* Avatar */}
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

            {/* User Info */}
            <View style={{ flex: 1 }}>
              {isLoggedIn ? (
                <>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: colors.foreground,
                      marginBottom: 4,
                    }}
                  >
                    사용자 이름
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.muted,
                    }}
                  >
                    user@example.com
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: colors.foreground,
                      marginBottom: 4,
                    }}
                  >
                    로그인이 필요합니다
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.muted,
                    }}
                  >
                    로그인하고 더 많은 기능을 이용하세요
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Login Button */}
          {!isLoggedIn && (
            <View style={{ marginTop: 20 }}>
              <Button
                label="로그인"
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

        {/* Profile Items (only show when logged in) */}
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
                {/* Icon Container */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor:
                      item.id === "logout"
                        ? colors.error + "20"
                        : colors.primary + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={item.id === "logout" ? colors.error : colors.primary}
                  />
                </View>

                {/* Text Content */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: item.subtitle ? 4 : 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color:
                          item.id === "logout" ? colors.error : colors.foreground,
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
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: "#FFFFFF",
                          }}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  {item.subtitle && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.muted,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  )}
                </View>

                {/* Chevron (except logout) */}
                {item.id !== "logout" && (
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

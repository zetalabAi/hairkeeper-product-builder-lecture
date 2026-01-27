import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type SettingItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
};

export default function SettingsScreen() {
  const colors = useColors();

  const handlePress = (item: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // TODO: 각 설정 항목 처리
    console.log(`Pressed: ${item}`);
  };

  const settingsItems: SettingItem[] = [
    { 
      id: "subscription", 
      label: "구독 관리", 
      icon: "card-outline",
      subtitle: "프리미엄 플랜 및 결제 관리"
    },
    { 
      id: "notifications", 
      label: "알림 설정", 
      icon: "notifications-outline",
      subtitle: "푸시 알림 및 이메일 설정"
    },
    { 
      id: "language", 
      label: "언어 설정", 
      icon: "language-outline",
      subtitle: "한국어"
    },
    { 
      id: "privacy", 
      label: "개인정보 처리방침", 
      icon: "shield-checkmark-outline"
    },
    { 
      id: "terms", 
      label: "이용약관", 
      icon: "document-text-outline"
    },
    { 
      id: "version", 
      label: "버전 정보", 
      icon: "information-circle-outline",
      subtitle: "1.0.0"
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <SubScreenHeader title="설정" />

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8 }}>
        {settingsItems.map((item, index) => (
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
                backgroundColor: colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name={item.icon} size={24} color={colors.primary} />
            </View>

            {/* Text Content */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: item.subtitle ? 4 : 0,
                }}
              >
                {item.label}
              </Text>
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

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

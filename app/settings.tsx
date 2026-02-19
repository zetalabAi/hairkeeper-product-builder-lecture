import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  BG_PINK,
  COLOR_PRIMARY,
  COLOR_PRIMARY_LIGHT,
  COLOR_PRIMARY_BORDER,
} from "@/constants/colors";

type SettingItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
};

export default function SettingsScreen() {
  const handlePress = (item: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`Pressed: ${item}`);
  };

  const settingsItems: SettingItem[] = [
    { id: "subscription", label: "구독 관리", icon: "card-outline", subtitle: "프리미엄 플랜 및 결제 관리" },
    { id: "notifications", label: "알림 설정", icon: "notifications-outline", subtitle: "푸시 알림 및 이메일 설정" },
    { id: "language", label: "언어 설정", icon: "language-outline", subtitle: "한국어" },
    { id: "privacy", label: "개인정보 처리방침", icon: "shield-checkmark-outline" },
    { id: "terms", label: "이용약관", icon: "document-text-outline" },
    { id: "version", label: "버전 정보", icon: "information-circle-outline", subtitle: "1.0.0" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BG_PINK }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <SubScreenHeader title="설정" />

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8 }}>
          {settingsItems.map((item) => (
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
                borderColor: COLOR_PRIMARY_BORDER,
                shadowColor: COLOR_PRIMARY,
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
                  backgroundColor: COLOR_PRIMARY_LIGHT,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Ionicons name={item.icon} size={24} color={COLOR_PRIMARY} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: item.subtitle ? 4 : 0 }}>
                  {item.label}
                </Text>
                {item.subtitle && (
                  <Text style={{ fontSize: 13, color: "#6B6B6B" }}>{item.subtitle}</Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

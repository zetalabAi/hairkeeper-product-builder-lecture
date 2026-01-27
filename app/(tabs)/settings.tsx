import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const colors = useColors();

  const handlePress = (item: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // TODO: 각 설정 항목 처리
    console.log(`Pressed: ${item}`);
  };

  const settingsItems = [
    { id: "subscription", label: "구독 관리", icon: "card" },
    { id: "notifications", label: "알림 설정", icon: "notifications" },
    { id: "language", label: "언어 설정", icon: "language" },
    { id: "privacy", label: "개인정보 처리방침", icon: "shield-checkmark" },
    { id: "terms", label: "이용약관", icon: "document-text" },
    { id: "version", label: "버전 정보", icon: "information-circle" },
  ];

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-foreground">설정</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-4">
          {settingsItems.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handlePress(item.id)}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.6 : 1,
                  backgroundColor: colors.surface,
                  marginBottom: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              className="flex-row items-center px-4 py-4"
            >
              <Ionicons name={item.icon as any} size={24} color={colors.foreground} />
              <Text className="text-base text-foreground ml-4 flex-1">{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

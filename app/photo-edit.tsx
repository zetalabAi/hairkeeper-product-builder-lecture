import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import { useState } from "react";

type Nationality = "korean";
type Gender = "male" | "female";

const NATIONALITIES: { value: Nationality; label: string }[] = [
  { value: "korean", label: "한국인" },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

export default function PhotoEditScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const colors = useColors();

  const [nationality, setNationality] = useState<Nationality | null>("korean");
  const [gender, setGender] = useState<Gender | null>(null);

  const handleNext = () => {
    if (!nationality || !gender) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    router.push({
      pathname: "/face-select" as any,
      params: {
        imageUri,
        nationality,
        gender,
        style: "default", // 기본 스타일 사용
      },
    });
  };

  const handleSelectNationality = (value: Nationality) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNationality(value);
  };

  const handleSelectGender = (value: Gender) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setGender(value);
  };

  const isComplete = nationality && gender;

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <SubScreenHeader title="스타일 선택" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-4">
          {/* Info */}
          <Text className="text-sm text-muted text-center mb-8">
            성별을 선택하세요
          </Text>

          {/* Nationality Selection - Hidden (Korean only) */}

          {/* Gender Selection */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-foreground mb-3">
              성별
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 4,
                flexDirection: "row",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              {GENDERS.map((item) => {
                const isSelected = gender === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => handleSelectGender(item.value)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 16,
                      backgroundColor: isSelected ? colors.primary : "transparent",
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ translateY: pressed ? 1 : 0 }],
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: isSelected ? "#FFFFFF" : colors.foreground,
                        textAlign: "center",
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View
        style={{
          padding: 24,
          paddingBottom: Platform.OS === "ios" ? 34 : 24,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button
          label="다음"
          variant="primary"
          size="large"
          fullWidth
          disabled={!isComplete}
          onPress={handleNext}
          icon="arrow-forward"
          iconPosition="right"
        />
      </View>
    </ScreenContainer>
  );
}

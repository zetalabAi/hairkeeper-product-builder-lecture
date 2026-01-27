import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import { useState } from "react";

type Nationality = "korean" | "western" | "southeast_asian";
type Gender = "male" | "female";

const NATIONALITIES: { value: Nationality; label: string }[] = [
  { value: "korean", label: "한국인" },
  { value: "western", label: "서양인" },
  { value: "southeast_asian", label: "동남아시아인" },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

const MALE_STYLES = [
  "자연스러운",
  "단정한",
  "세련된",
  "카리스마",
  "부드러운",
  "지적인",
];

const FEMALE_STYLES = [
  "자연스러운",
  "우아한",
  "발랄한",
  "시크한",
  "부드러운",
  "세련된",
];

export default function PhotoEditScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const colors = useColors();

  const [nationality, setNationality] = useState<Nationality | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [style, setStyle] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (!nationality || !gender || !style) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    router.push({
      pathname: "/face-select" as any,
      params: {
        imageUri,
        nationality,
        gender,
        style,
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
    setStyle(null); // Reset style when gender changes
  };

  const handleSelectStyle = (value: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStyle(value);
  };

  const isComplete = nationality && gender && style;
  const availableStyles = gender === "female" ? FEMALE_STYLES : MALE_STYLES;

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            marginRight: 16,
          })}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">스타일 선택</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-4">
          {/* Info */}
          <Text className="text-sm text-muted text-center mb-8">
            원하는 얼굴 스타일을 선택하세요
          </Text>

          {/* Nationality Selection */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-foreground mb-3">
              국적
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
              {NATIONALITIES.map((item) => {
                const isSelected = nationality === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => handleSelectNationality(item.value)}
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

          {/* Style Selection */}
          {gender && (
            <View className="mb-8">
              <Text className="text-base font-semibold text-foreground mb-3">
                스타일
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {availableStyles.map((item) => {
                  const isSelected = style === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => handleSelectStyle(item)}
                      style={({ pressed }) => ({
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 16,
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surface,
                        shadowColor: "#000",
                        shadowOpacity: isSelected ? 0.12 : 0.05,
                        shadowRadius: isSelected ? 10 : 6,
                        shadowOffset: { width: 0, height: isSelected ? 3 : 2 },
                        elevation: isSelected ? 3 : 1,
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ translateY: pressed ? 1 : 0 }],
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: isSelected ? "#FFFFFF" : colors.foreground,
                        }}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
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

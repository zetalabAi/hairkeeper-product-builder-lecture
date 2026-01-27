import { useState } from "react";
import { View, Text, Pressable, Platform, ScrollView, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

type Nationality = "korea" | "japan";
type Gender = "female" | "male";

const FEMALE_STYLES = [
  { id: "청순", label: "청순", icon: "🌸" },
  { id: "귀여움", label: "귀여움", icon: "🐰" },
  { id: "아름다움", label: "아름다움", icon: "✨" },
  { id: "도도", label: "도도", icon: "👑" },
  { id: "섹시", label: "섹시", icon: "💋" },
];

const MALE_STYLES = [
  { id: "늠름", label: "늠름", icon: "🦁" },
  { id: "섹시", label: "섹시", icon: "🔥" },
  { id: "남성적", label: "남성적", icon: "💪" },
  { id: "강한 인상", label: "강한 인상", icon: "⚡" },
];

export default function PhotoEditScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const colors = useColors();

  const [nationality, setNationality] = useState<Nationality | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [style, setStyle] = useState<string | null>(null);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (!nationality || !gender || !style) return;

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
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
              marginRight: 16,
            },
          ]}
        >
          <Text className="text-base text-primary">{"<>"}</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">스타일 선택</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-4">
          {/* Info */}
          <Text className="text-sm text-muted text-center mb-8">
            원하는 얼굴 스타일을 선택하세요
          </Text>

          {/* Preview Image */}
          <View className="items-center mb-8">
            <View className="w-32 h-32 rounded-2xl overflow-hidden bg-surface">
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-muted">이미지 없음</Text>
                </View>
              )}
            </View>
          </View>

          {/* Step 1: Nationality */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-foreground mb-4">
              1. 국적 선택
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => handleSelectNationality("korea")}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    opacity: pressed ? 0.7 : 1,
                    borderWidth: 2,
                    borderColor:
                      nationality === "korea" ? colors.primary : colors.border,
                    backgroundColor:
                      nationality === "korea" ? `${colors.primary}30` : colors.surface,
                  },
                ]}
                className="py-4 rounded-xl items-center"
              >
                <Text
                  className={`text-base font-semibold ${
                    nationality === "korea" ? "text-primary" : "text-foreground"
                  }`}
                >
                  한국
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectNationality("japan")}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    opacity: pressed ? 0.7 : 1,
                    borderWidth: 2,
                    borderColor:
                      nationality === "japan" ? colors.primary : colors.border,
                    backgroundColor:
                      nationality === "japan" ? `${colors.primary}30` : colors.surface,
                  },
                ]}
                className="py-4 rounded-xl items-center"
              >
                <Text
                  className={`text-base font-semibold ${
                    nationality === "japan" ? "text-primary" : "text-foreground"
                  }`}
                >
                  일본
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Step 2: Gender */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-foreground mb-4">
              2. 성별 선택
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => handleSelectGender("female")}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    opacity: pressed ? 0.7 : 1,
                    borderWidth: 2,
                    borderColor: gender === "female" ? colors.primary : colors.border,
                    backgroundColor:
                      gender === "female" ? `${colors.primary}30` : colors.surface,
                  },
                ]}
                className="py-4 rounded-xl items-center"
              >
                <Text
                  className={`text-base font-semibold ${
                    gender === "female" ? "text-primary" : "text-foreground"
                  }`}
                >
                  여성
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectGender("male")}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    opacity: pressed ? 0.7 : 1,
                    borderWidth: 2,
                    borderColor: gender === "male" ? colors.primary : colors.border,
                    backgroundColor:
                      gender === "male" ? `${colors.primary}30` : colors.surface,
                  },
                ]}
                className="py-4 rounded-xl items-center"
              >
                <Text
                  className={`text-base font-semibold ${
                    gender === "male" ? "text-primary" : "text-foreground"
                  }`}
                >
                  남성
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Step 3: Style Grid */}
          {gender && (
            <View className="mb-8">
              <Text className="text-base font-semibold text-foreground mb-4">
                3. 스타일 선택
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {availableStyles.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => handleSelectStyle(s.id)}
                    style={({ pressed }) => [
                      {
                        width: "48%",
                        opacity: pressed ? 0.7 : 1,
                        borderWidth: 2,
                        borderColor: style === s.id ? colors.primary : colors.border,
                        backgroundColor:
                          style === s.id ? `${colors.primary}30` : colors.surface,
                      },
                    ]}
                    className="py-6 rounded-xl items-center"
                  >
                    <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-3">
                      <Text style={{ fontSize: 32 }}>{s.icon}</Text>
                    </View>
                    <Text
                      className={`text-base font-semibold ${
                        style === s.id ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {s.label}
                    </Text>
                    {style === s.id && (
                      <View className="absolute top-2 right-2">
                        <Text style={{ fontSize: 16 }}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Bottom Info */}
          {gender && (
            <Text className="text-xs text-muted text-center mb-4">
              선택한 스타일에 맞는 얼굴 풀에서 추천됩니다
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleNext}
          disabled={!isComplete}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed && isComplete ? 0.97 : 1 }],
              opacity: !isComplete ? 0.5 : pressed ? 0.9 : 1,
              backgroundColor: colors.primary,
            },
          ]}
          className="py-4 rounded-full items-center"
        >
          <Text className="text-white text-lg font-semibold">
            {isComplete ? "얼굴 추천받기" : "모든 옵션을 선택하세요"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

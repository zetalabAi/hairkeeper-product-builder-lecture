import { useState } from "react";
import { View, Text, Pressable, Platform, ScrollView, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

type Nationality = "korea" | "japan";
type Gender = "male" | "female";

const FEMALE_STYLES = ["청순", "귀여움", "아름다움", "도도", "섹시"];
const MALE_STYLES = ["늠름", "섹시", "남성적", "강한 인상"];

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Text className="text-base text-primary">취소</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">옵션 선택</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-4">
          {/* Preview Image */}
          <View className="items-center mb-8">
            <View className="w-full aspect-square rounded-2xl overflow-hidden bg-surface">
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
            <Text className="text-lg font-semibold text-foreground mb-4">
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
                      nationality === "korea" ? `${colors.primary}20` : colors.surface,
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
                      nationality === "japan" ? `${colors.primary}20` : colors.surface,
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
            <Text className="text-lg font-semibold text-foreground mb-4">
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
                      gender === "female" ? `${colors.primary}20` : colors.surface,
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
                      gender === "male" ? `${colors.primary}20` : colors.surface,
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

          {/* Step 3: Style */}
          {gender && (
            <View className="mb-8">
              <Text className="text-lg font-semibold text-foreground mb-4">
                3. 스타일 선택
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {availableStyles.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => handleSelectStyle(s)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                        borderWidth: 2,
                        borderColor: style === s ? colors.primary : colors.border,
                        backgroundColor:
                          style === s ? `${colors.primary}20` : colors.surface,
                        minWidth: 100,
                      },
                    ]}
                    className="px-6 py-3 rounded-xl items-center"
                  >
                    <Text
                      className={`text-base font-semibold ${
                        style === s ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
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
          <Text className="text-white text-lg font-semibold">다음</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

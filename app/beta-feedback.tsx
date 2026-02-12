/**
 * Beta Feedback Screen
 *
 * Collects user feedback during beta testing phase
 */

import { View, Text, TextInput, Pressable, ScrollView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

// Rating labels
const RATINGS = {
  swapAccuracy: "얼굴 스왑 정확도",
  processingSpeed: "처리 속도",
  facePoolDiversity: "얼굴 풀 다양성",
  batchProcessingValue: "배치 처리 유용성",
  overallSatisfaction: "전체 만족도",
  subscriptionIntent: "구독 의향",
};

const TEXT_FIELDS = {
  bestFeature: "가장 좋았던 기능",
  worstFeature: "가장 아쉬운 점",
  suggestions: "개선 제안 사항",
};

interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function RatingInput({ label, value, onChange }: RatingInputProps) {
  const colors = useColors();

  const handlePress = (rating: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(rating);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 12,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {[1, 2, 3, 4, 5].map((rating) => (
          <Pressable
            key={rating}
            onPress={() => handlePress(rating)}
            style={({ pressed }) => ({
              flex: 1,
              aspectRatio: 1,
              borderRadius: 999,
              backgroundColor: value === rating ? colors.primary : colors.surface,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: value === rating ? colors.primary : colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: value === rating ? "#FFFFFF" : colors.muted,
              }}
            >
              {rating}
            </Text>
          </Pressable>
        ))}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <Text style={{ fontSize: 12, color: colors.muted }}>매우 나쁨</Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>매우 좋음</Text>
      </View>
    </View>
  );
}

export default function BetaFeedbackScreen() {
  const colors = useColors();

  // Quantitative ratings (1-5)
  const [ratings, setRatings] = useState({
    swapAccuracy: 0,
    processingSpeed: 0,
    facePoolDiversity: 0,
    batchProcessingValue: 0,
    overallSatisfaction: 0,
    subscriptionIntent: 0,
  });

  // Qualitative text feedback
  const [text, setText] = useState({
    bestFeature: "",
    worstFeature: "",
    suggestions: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedbackMutation = trpc.beta.submitFeedback.useMutation();

  const handleRatingChange = (key: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleTextChange = (key: keyof typeof text, value: string) => {
    setText((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Validation: All ratings must be filled
    const missingRatings = Object.entries(ratings).filter(([_, value]) => value === 0);
    if (missingRatings.length > 0) {
      Alert.alert("입력 확인", "모든 평가 항목을 선택해주세요.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsSubmitting(true);

    try {
      await submitFeedbackMutation.mutateAsync({
        ...ratings,
        ...text,
      });

      Alert.alert("피드백 제출 완료!", "소중한 의견 감사합니다 🎉", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);
      Alert.alert("제출 실패", error?.message || "피드백 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = Object.values(ratings).every((r) => r > 0);

  return (
    <ScreenContainer className="bg-background">
      <SubScreenHeader title="베타 피드백" />

      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info */}
        <Text
          style={{
            fontSize: 14,
            color: colors.muted,
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          베타 테스트에 참여해주셔서 감사합니다!{"\n"}
          여러분의 피드백이 더 나은 서비스를 만듭니다.
        </Text>

        {/* Quantitative Ratings */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 20,
            }}
          >
            정량 평가
          </Text>

          {Object.entries(RATINGS).map(([key, label]) => (
            <RatingInput
              key={key}
              label={label}
              value={ratings[key as keyof typeof ratings]}
              onChange={(value) => handleRatingChange(key as keyof typeof ratings, value)}
            />
          ))}
        </View>

        {/* Qualitative Text Feedback */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 20,
            }}
          >
            정성 평가
          </Text>

          {Object.entries(TEXT_FIELDS).map(([key, label]) => (
            <View key={key} style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                {label}
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 14,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                multiline
                numberOfLines={4}
                placeholder={`${label}을 입력해주세요 (선택사항)`}
                placeholderTextColor={colors.muted}
                value={text[key as keyof typeof text]}
                onChangeText={(value) => handleTextChange(key as keyof typeof text, value)}
              />
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <Button
          label={isSubmitting ? "제출 중..." : "피드백 제출"}
          variant="primary"
          size="large"
          fullWidth
          disabled={!isComplete || isSubmitting}
          onPress={handleSubmit}
          icon="checkmark-circle"
          iconPosition="right"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

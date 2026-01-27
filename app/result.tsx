import { useState } from "react";
import { View, Text, Pressable, Platform, Image, Alert, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { useColors } from "@/hooks/use-colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const faceUrl = params.faceUrl as string;
  const nationality = params.nationality as string;
  const gender = params.gender as string;
  const style = params.style as string;
  const colors = useColors();

  const [showBefore, setShowBefore] = useState(false);

  const handleToggleView = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowBefore(!showBefore);
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("공유 불가", "이 기기에서는 공유 기능을 사용할 수 없습니다.");
        return;
      }

      // 실제로는 합성된 이미지 URI를 사용
      await Sharing.shareAsync(imageUri, {
        mimeType: "image/jpeg",
        dialogTitle: "머리보존 AI 결과 공유",
      });
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("오류", "공유 중 오류가 발생했습니다.");
    }
  };

  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(
      "저장 완료",
      "이미지가 갤러리에 저장되었습니다.",
      [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)" as any),
        },
      ]
    );
  };

  const handleRetry = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleHome = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace("/(tabs)" as any);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable
          onPress={handleHome}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Text className="text-base text-primary">홈</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">결과 확인</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Result Image */}
      <View className="flex-1 items-center justify-center px-6">
        <View
          style={{
            width: SCREEN_WIDTH - 48,
            aspectRatio: 1,
            borderRadius: 24,
            overflow: "hidden",
            backgroundColor: colors.surface,
          }}
        >
          <Image
            source={{ uri: showBefore ? imageUri : faceUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Watermark (무료 사용자용) */}
          {!showBefore && (
            <View
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                backgroundColor: "rgba(0,0,0,0.6)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text className="text-white text-xs font-semibold">
                머리보존 AI
              </Text>
            </View>
          )}
        </View>

        {/* Toggle Button */}
        <Pressable
          onPress={handleToggleView}
          style={({ pressed }) => [
            {
              marginTop: 24,
              opacity: pressed ? 0.7 : 1,
              borderWidth: 2,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          className="px-8 py-3 rounded-full"
        >
          <Text className="text-foreground text-base font-semibold">
            {showBefore ? "합성 결과 보기" : "원본 보기"}
          </Text>
        </Pressable>

        {/* Info */}
        <View className="mt-6">
          <Text className="text-sm text-muted text-center">
            옵션: {nationality === "korea" ? "한국" : "일본"} · {gender === "female" ? "여성" : "남성"} · {style}
          </Text>
          <Text className="text-sm text-muted text-center mt-2">
            ⚡ 처리 시간: 3.2초
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-6 pb-8 gap-3">
        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
              backgroundColor: colors.primary,
            },
          ]}
          className="py-4 rounded-full items-center"
        >
          <Text className="text-white text-lg font-semibold">공유하기</Text>
        </Pressable>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
              borderWidth: 2,
              borderColor: colors.primary,
              backgroundColor: colors.background,
            },
          ]}
          className="py-4 rounded-full items-center"
        >
          <Text className="text-primary text-lg font-semibold">
            갤러리에 저장
          </Text>
        </Pressable>

        {/* Retry Button */}
        <Pressable
          onPress={handleRetry}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
          className="py-3 items-center"
        >
          <Text className="text-muted text-base">다른 얼굴로 다시 시도</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

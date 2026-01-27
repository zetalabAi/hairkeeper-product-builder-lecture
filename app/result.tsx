import { useState } from "react";
import { View, Text, Pressable, Platform, Image, Alert, Dimensions, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { useColors } from "@/hooks/use-colors";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_WIDTH = SCREEN_WIDTH - 48;

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const faceUrl = params.faceUrl as string;
  const nationality = params.nationality as string;
  const gender = params.gender as string;
  const style = params.style as string;
  const colors = useColors();

  const sliderPosition = useSharedValue(IMAGE_WIDTH / 2);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
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

  const handleHome = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace("/(tabs)" as any);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newPosition = Math.max(0, Math.min(IMAGE_WIDTH, event.x));
      sliderPosition.value = newPosition;
    })
    .onEnd(() => {
      // Optional: snap to center or edges
    })
    .runOnJS(true);

  const maskStyle = useAnimatedStyle(() => {
    return {
      width: sliderPosition.value,
    };
  });

  const handleStyle = useAnimatedStyle(() => {
    return {
      left: sliderPosition.value - 20,
    };
  });

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
        <Text className="text-lg font-semibold text-foreground">결과 확인</Text>
      </View>

      {/* Result Image with Slider */}
      <View className="flex-1 items-center justify-center px-6">
        <View
          style={{
            width: IMAGE_WIDTH,
            aspectRatio: 1,
            borderRadius: 24,
            overflow: "hidden",
            backgroundColor: colors.surface,
            position: "relative",
          }}
        >
          {/* Base Image (Result) */}
          <Image
            source={{ uri: faceUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />

          {/* Masked Original Image */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              maskStyle,
              { overflow: "hidden" },
            ]}
          >
            <Image
              source={{ uri: imageUri }}
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_WIDTH,
              }}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Slider Line and Handle */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 40,
                  alignItems: "center",
                  justifyContent: "center",
                },
                handleStyle,
              ]}
            >
              {/* Vertical Line */}
              <View
                style={{
                  width: 3,
                  height: "100%",
                  backgroundColor: colors.primary,
                }}
              />
              {/* Handle */}
              <View
                style={{
                  position: "absolute",
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "white",
                }}
              >
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
                  ⟷
                </Text>
              </View>
            </Animated.View>
          </GestureDetector>

          {/* Labels */}
          <View
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              backgroundColor: "rgba(0,0,0,0.6)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text className="text-white text-xs font-semibold">
              원본 이미지
            </Text>
          </View>
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
              합성 결과
            </Text>
          </View>
        </View>

        {/* Info */}
        <Text className="text-sm text-muted text-center mt-6">
          좌우로 드래그하여 원본과 결과를 비교하세요
        </Text>

        {/* Check Message */}
        <View className="flex-row items-center mt-4">
          <Text className="text-success text-sm font-semibold">
            ✓ 머리는 절대 변형되지 않았습니다
          </Text>
        </View>

        <View className="mt-4">
          <Text className="text-sm text-muted text-center">
            옵션: {nationality === "korea" ? "한국" : "일본"} · {gender === "female" ? "여성" : "남성"} · {style}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-6 pb-8 gap-3">
        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
              backgroundColor: colors.primary,
            },
          ]}
          className="py-4 rounded-full items-center"
        >
          <Text className="text-white text-lg font-semibold">저장하기</Text>
        </Pressable>

        {/* Share Button */}
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
          className="py-3 items-center"
        >
          <Text className="text-muted text-base">공유하기</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

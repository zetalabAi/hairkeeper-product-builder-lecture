import { View, Text, Pressable, Platform, Animated } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { useState, useRef } from "react";

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const faceUrl = params.faceUrl as string;
  const colors = useColors();

  const [showBefore, setShowBefore] = useState(false);
  const sliderPosition = useRef(new Animated.Value(0)).current;

  const handleBack = () => {
    router.back();
  };

  const handleToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newValue = showBefore ? 0 : 1;
    setShowBefore(!showBefore);

    Animated.timing(sliderPosition, {
      toValue: newValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSave = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    alert("결과 이미지가 갤러리에 저장되었습니다!");
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(faceUrl);
    } else {
      alert("공유 기능을 사용할 수 없습니다.");
    }
  };

  const handleNewProject = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/(tabs)" as any);
  };

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
        <Text className="text-lg font-semibold text-foreground">결과 확인</Text>
      </View>

      {/* Content */}
      <View className="flex-1 justify-center px-6">
        {/* Image Preview */}
        <View
          style={{
            aspectRatio: 3 / 4,
            borderRadius: 24,
            backgroundColor: colors.surface,
            marginBottom: 24,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.muted + "30",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="image" size={64} color={colors.muted} />
          </View>
        </View>

        {/* Toggle Button */}
        <Pressable
          onPress={handleToggle}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 20,
            backgroundColor: colors.surface,
            marginBottom: 24,
            alignSelf: "center",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            opacity: pressed ? 0.85 : 1,
            transform: [{ translateY: pressed ? 1 : 0 }],
          })}
        >
          <Ionicons
            name="swap-horizontal"
            size={20}
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
            {showBefore ? "After 보기" : "Before 보기"}
          </Text>
        </Pressable>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <Button
            label="갤러리에 저장"
            variant="primary"
            size="large"
            fullWidth
            icon="download"
            iconPosition="left"
            onPress={handleSave}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="공유하기"
                variant="secondary"
                size="medium"
                fullWidth
                icon="share-social"
                iconPosition="left"
                onPress={handleShare}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="새 프로젝트"
                variant="secondary"
                size="medium"
                fullWidth
                icon="add"
                iconPosition="left"
                onPress={handleNewProject}
              />
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

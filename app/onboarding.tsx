import { useState, useRef } from "react";
import { View, Text, ScrollView, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ONBOARDING_SLIDES = [
  {
    title: "실제 시술, 안전한 공유",
    description: "고객의 헤어 스타일은 그대로,\n얼굴만 안전하게 교체합니다",
    icon: "cut" as const,
  },
  {
    title: "얼굴만 바꿔요",
    description: "AI가 자연스러운 얼굴로 교체하여\n초상권 걱정 없이 포트폴리오를 만듭니다",
    icon: "people" as const,
  },
  {
    title: "3초 만에 완성",
    description: "간단한 선택만으로\nSNS 홍보용 이미지를 빠르게 생성합니다",
    icon: "flash" as const,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colors = useColors();

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await handleComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem("onboarding_completed", "true");
    // 테스트용: 로그인 우회, 바로 홈으로 이동
    router.replace("/(tabs)" as any);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      {/* Skip Button */}
      {currentIndex < ONBOARDING_SLIDES.length - 1 && (
        <Button
          label="건너뛰기"
          variant="tertiary"
          size="small"
          onPress={handleSkip}
          style={{
            position: "absolute",
            top: 60,
            right: 20,
            zIndex: 10,
          }}
        />
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <View
            key={index}
            style={{
              width: SCREEN_WIDTH,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 40,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.surface,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 40,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name={slide.icon} size={56} color={colors.primary} />
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.foreground,
                textAlign: "center",
                marginBottom: 16,
                lineHeight: 36,
              }}
            >
              {slide.title}
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 16,
                color: colors.muted,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            style={{
              width: currentIndex === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentIndex === index ? colors.primary : colors.border,
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>

      {/* Next Button */}
      <View style={{ paddingHorizontal: 40, paddingBottom: 40 }}>
        <Button
          label={currentIndex < ONBOARDING_SLIDES.length - 1 ? "다음" : "시작하기"}
          variant="primary"
          size="large"
          fullWidth
          onPress={handleNext}
        />
      </View>
    </ScreenContainer>
  );
}

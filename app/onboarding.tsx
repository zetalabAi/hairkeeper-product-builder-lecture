import { useState, useRef } from "react";
import { View, Text, ScrollView, Dimensions, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
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
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [
            {
              position: "absolute",
              top: 60,
              right: 20,
              zIndex: 10,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Text className="text-muted text-base">건너뛰기</Text>
        </Pressable>
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
            style={{ width: SCREEN_WIDTH }}
            className="flex-1 items-center justify-center px-8"
          >
            <View style={{ marginBottom: 40 }}>
              <Ionicons name={slide.icon} size={120} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-foreground text-center mb-4">
              {slide.title}
            </Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Indicators */}
      <View className="flex-row items-center justify-center mb-8">
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-border"
            }`}
          />
        ))}
      </View>

      {/* Next/Start Button */}
      <View className="px-8 pb-8">
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          className="bg-primary py-4 rounded-full items-center"
        >
          <Text className="text-white text-lg font-semibold">
            {currentIndex === ONBOARDING_SLIDES.length - 1 ? "시작하기" : "다음"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

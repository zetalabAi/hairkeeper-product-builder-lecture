import { View, Text, Pressable, Platform, Image } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { startOAuthLogin } from "@/constants/oauth";

export default function LoginScreen() {
  const handleSocialLogin = async (provider: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await startOAuthLogin();
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <View className="items-center mb-12">
          <View className="w-32 h-32 rounded-3xl bg-surface items-center justify-center mb-6 overflow-hidden">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 128, height: 128 }}
              resizeMode="cover"
            />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">머리보존 AI</Text>
          <Text className="text-base text-muted text-center">
            AI지만, 머리는 진짜.
          </Text>
        </View>

        {/* Social Login Buttons */}
        <View className="w-full max-w-sm gap-4">
          {/* Google Login */}
          <Pressable
            onPress={() => handleSocialLogin("google")}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            className="flex-row items-center justify-center bg-white border border-border py-4 rounded-full"
          >
            <Text className="text-foreground text-base font-semibold">
              Google로 계속하기
            </Text>
          </Pressable>

          {/* Naver Login */}
          <Pressable
            onPress={() => handleSocialLogin("naver")}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
                backgroundColor: "#03C75A",
              },
            ]}
            className="flex-row items-center justify-center py-4 rounded-full"
          >
            <Text className="text-white text-base font-semibold">
              Naver로 계속하기
            </Text>
          </Pressable>

          {/* Kakao Login */}
          <Pressable
            onPress={() => handleSocialLogin("kakao")}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
                backgroundColor: "#FEE500",
              },
            ]}
            className="flex-row items-center justify-center py-4 rounded-full"
          >
            <Text className="text-foreground text-base font-semibold">
              Kakao로 계속하기
            </Text>
          </Pressable>
        </View>

        {/* Terms */}
        <View className="mt-8">
          <Text className="text-xs text-muted text-center">
            로그인하면 이용약관 및 개인정보처리방침에{"\n"}동의하는 것으로 간주됩니다
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

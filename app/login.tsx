import { View, Text, Pressable, Platform, Image, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth-provider";

export default function LoginScreen() {
  const { signInWithGoogle, signInWithApple, loading, error } = useAuth();

  const handleGoogleLogin = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await signInWithGoogle();
      // 로그인 성공시 자동으로 메인 화면으로 이동 (AuthProvider의 onAuthStateChanged에서 처리)
    } catch (error: any) {
      console.error("[Login] Google 로그인 실패:", error);
      Alert.alert(
        "로그인 실패",
        error.message || "Google 로그인에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await signInWithApple();
      // 로그인 성공시 자동으로 메인 화면으로 이동
    } catch (error: any) {
      console.error("[Login] Apple 로그인 실패:", error);
      Alert.alert(
        "로그인 실패",
        error.message || "Apple 로그인에 실패했습니다. 다시 시도해주세요."
      );
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

        {/* Error Message */}
        {error && (
          <View className="w-full max-w-sm mb-4 p-4 bg-destructive/10 rounded-lg">
            <Text className="text-destructive text-sm text-center">{error}</Text>
          </View>
        )}

        {/* Social Login Buttons */}
        <View className="w-full max-w-sm gap-4">
          {/* Google Login */}
          <Pressable
            onPress={handleGoogleLogin}
            disabled={loading}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed || loading ? 0.7 : 1,
              },
            ]}
            className="flex-row items-center justify-center bg-white border border-border py-4 rounded-full"
          >
            <Text className="text-foreground text-base font-semibold">
              {loading ? "로그인 중..." : "Google로 계속하기"}
            </Text>
          </Pressable>

          {/* Apple Login (iOS only) */}
          {Platform.OS === "ios" && (
            <Pressable
              onPress={handleAppleLogin}
              disabled={loading}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed || loading ? 0.7 : 1,
                  backgroundColor: "#000000",
                },
              ]}
              className="flex-row items-center justify-center py-4 rounded-full"
            >
              <Text className="text-white text-base font-semibold">
                {loading ? "로그인 중..." : "Apple로 계속하기"}
              </Text>
            </Pressable>
          )}

          {/* 이메일 로그인 (향후 추가 예정) */}
          {/* <Pressable
            onPress={() => router.push("/login-email")}
            disabled={loading}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed || loading ? 0.7 : 1,
              },
            ]}
            className="flex-row items-center justify-center bg-surface border border-border py-4 rounded-full"
          >
            <Text className="text-foreground text-base font-semibold">
              이메일로 계속하기
            </Text>
          </Pressable> */}
        </View>

        {/* Terms */}
        <View className="mt-8">
          <Text className="text-xs text-muted text-center">
            로그인하면 이용약관 및 개인정보처리방침에{"\n"}동의하는 것으로 간주됩니다
          </Text>
        </View>

        {/* Dev Note */}
        {__DEV__ && (
          <View className="mt-4">
            <Text className="text-xs text-muted text-center">
              🔧 개발 모드: Google/Apple Sign-In 네이티브 설정 필요
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

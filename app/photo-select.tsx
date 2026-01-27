import { useState } from "react";
import { View, Text, Pressable, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";

export default function PhotoSelectScreen() {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async (type: "camera" | "library") => {
    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "권한 필요",
          "카메라 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요."
        );
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "권한 필요",
          "사진 라이브러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요."
        );
        return false;
      }
    }
    return true;
  };

  const handleCamera = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const hasPermission = await requestPermissions("camera");
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images" as any,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        router.push({
          pathname: "/photo-edit" as any,
          params: { imageUri },
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("오류", "사진 촬영 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLibrary = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const hasPermission = await requestPermissions("library");
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        router.push({
          pathname: "/photo-edit" as any,
          params: { imageUri },
        });
      }
    } catch (error) {
      console.error("Library error:", error);
      Alert.alert("오류", "사진 선택 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text className="text-base text-primary ml-2">취소</Text>
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-2xl font-bold text-foreground mb-12 text-center">
          사진을 선택하세요
        </Text>

        {/* Camera Button */}
        <Pressable
          onPress={handleCamera}
          disabled={isLoading}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed || isLoading ? 0.9 : 1,
              width: 280,
              backgroundColor: colors.primary,
              marginBottom: 16,
            },
          ]}
          className="py-6 rounded-2xl items-center"
        >
          <Ionicons name="camera" size={48} color="white" style={{ marginBottom: 8 }} />
          <Text className="text-white text-lg font-semibold">카메라로 촬영</Text>
        </Pressable>

        {/* Library Button */}
        <Pressable
          onPress={handleLibrary}
          disabled={isLoading}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed || isLoading ? 0.9 : 1,
              width: 280,
              backgroundColor: colors.surface,
              borderWidth: 2,
              borderColor: colors.border,
            },
          ]}
          className="py-6 rounded-2xl items-center"
        >
          <Ionicons name="images" size={48} color={colors.foreground} style={{ marginBottom: 8 }} />
          <Text className="text-foreground text-lg font-semibold">
            앨범에서 선택
          </Text>
        </Pressable>

        {isLoading && (
          <Text className="text-muted mt-8">사진을 불러오는 중...</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

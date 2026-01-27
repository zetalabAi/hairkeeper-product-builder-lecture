import { View, Text, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

export default function PhotoSelectScreen() {
  const colors = useColors();

  const handleSelectFromCamera = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("카메라 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: "/photo-edit" as any,
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  const handleSelectFromGallery = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("갤러리 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: "/photo-edit" as any,
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <SubScreenHeader title="사진 선택" />

      {/* Content */}
      <View className="flex-1 justify-center px-6">
        {/* Info */}
        <Text className="text-sm text-muted text-center mb-12">
          고객의 시술 사진을 선택하세요{"\n"}
          얼굴만 AI로 비식별 처리됩니다
        </Text>

        {/* Card Buttons */}
        <View className="gap-4">
          {/* Camera Card */}
          <Pressable
            onPress={handleSelectFromCamera}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 24,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
                opacity: pressed ? 0.85 : 1,
                transform: [{ translateY: pressed ? 1 : 0 }],
              },
            ]}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="camera" size={28} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground mb-1">
                카메라로 촬영
              </Text>
              <Text className="text-sm text-muted">
                지금 바로 사진을 촬영하세요
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>

          {/* Gallery Card */}
          <Pressable
            onPress={handleSelectFromGallery}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 24,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
                opacity: pressed ? 0.85 : 1,
                transform: [{ translateY: pressed ? 1 : 0 }],
              },
            ]}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="images" size={28} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground mb-1">
                갤러리에서 선택
              </Text>
              <Text className="text-sm text-muted">
                저장된 사진을 불러오세요
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

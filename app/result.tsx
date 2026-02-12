import { View, Text, Pressable, Platform, Animated, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { useState, useRef } from "react";
import { downloadResultsAsZip } from "@/lib/download-zip";

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const originalImageUri = params.originalImageUri as string;
  const resultImageUri = params.resultImageUri as string;
  const resultImageUrlsParam = params.resultImageUrls as string | undefined;
  const projectIdParam = params.projectId as string | undefined;
  const description = params.description as string;
  const colors = useColors();

  const [showBefore, setShowBefore] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const sliderPosition = useRef(new Animated.Value(0)).current;
  const resultImageUrls = (() => {
    if (!resultImageUrlsParam) {
      return resultImageUri ? [resultImageUri] : [];
    }
    try {
      const parsed = JSON.parse(resultImageUrlsParam);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const projectId = projectIdParam || "batch";

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
    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("갤러리 접근 권한이 필요합니다.");
        return;
      }

      // Download image to local file system
      const filename = `hairkeeper_${Date.now()}.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      const downloadResult = await FileSystem.downloadAsync(
        resultImageUri,
        fileUri
      );

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync("머리보존 AI", asset, false);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      alert("결과 이미지가 갤러리에 저장되었습니다!");
    } catch (error) {
      console.error("Save error:", error);
      alert("이미지 저장에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(resultImageUri);
    } else {
      alert("공유 기능을 사용할 수 없습니다.");
    }
  };

  const handleDownloadZip = async () => {
    if (isDownloading || resultImageUrls.length <= 1) return;

    setIsDownloading(true);
    try {
      await downloadResultsAsZip(resultImageUrls, projectId);
      alert("ZIP 다운로드가 완료되었습니다.");
    } catch (error) {
      console.error("ZIP download error:", error);
      alert("ZIP 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
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
      <SubScreenHeader title="결과 확인" />

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
          <Image
            source={{ uri: showBefore ? originalImageUri : resultImageUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            onLoad={() => setImageError(null)}
            onError={(event) => {
              const errorMessage =
                event?.nativeEvent?.error || "이미지 로드 실패";
              console.error("[Result] Image load error:", errorMessage);
              console.error("[Result] Result image URL:", resultImageUri);
              setImageError(errorMessage);
            }}
          />
          {imageError && !showBefore && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 24,
                backgroundColor: colors.surface,
              }}
            >
              <Text
                style={{
                  color: colors.muted,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                결과 이미지를 불러오지 못했습니다.
              </Text>
            </View>
          )}
          {/* Label Badge */}
          <View
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              backgroundColor: showBefore ? colors.muted : colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              {showBefore ? "Before" : "After"}
            </Text>
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
          {resultImageUrls.length > 1 && (
            <Button
              label={isDownloading ? "다운로드 중..." : "ZIP 다운로드"}
              variant="secondary"
              size="large"
              fullWidth
              icon="archive"
              iconPosition="left"
              disabled={isDownloading}
              onPress={handleDownloadZip}
            />
          )}
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

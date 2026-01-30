import { View, Text, FlatList, Image, Pressable, Platform, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { KOREAN_FACE_URLS } from "@/shared/face-urls";
import { prepareImageForUpload } from "@/lib/upload-image";

// AI 생성 한국인 얼굴 이미지 (로컬 assets + S3 URL)
const KOREAN_FACES = {
  male: KOREAN_FACE_URLS.male,
  female: KOREAN_FACE_URLS.female,
};

export default function FaceSelectScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const nationality = params.nationality as string;
  const gender = params.gender as string;
  const style = params.style as string;
  const colors = useColors();

  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const synthesizeMutation = trpc.ai.synthesizeFace.useMutation();
  const uploadImageMutation = trpc.ai.uploadImage.useMutation();

  // 선택된 성별에 맞는 한국인 얼굴 목록
  const faces = gender === "male" ? KOREAN_FACES.male : KOREAN_FACES.female;

  const handleSelectFace = (faceId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFaceId(faceId);
  };

  const handleNext = async () => {
    if (!selectedFaceId || !imageUri) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage("이미지 업로드 준비 중...");

    try {
      // Get selected face image with S3 URL
      const selectedFace = faces.find((f) => f.id === selectedFaceId);
      if (!selectedFace) return;

      // Use actual S3 URL for Replicate API
      const selectedFaceUrl = selectedFace.url;

      // Upload original image to S3 if it's a local file
      console.log("Starting image upload...");
      console.log("Original imageUri:", imageUri);
      setProgress(10);
      setProgressMessage("이미지 업로드 중...");
      
      let originalImageUrl = imageUri;
      if (!imageUri.startsWith("http")) {
        console.log("Uploading local image to S3...");
        const imageData = await prepareImageForUpload(imageUri);
        console.log("Image data prepared, filename:", imageData.filename);
        setProgress(20);
        const uploadResult = await uploadImageMutation.mutateAsync(imageData);
        originalImageUrl = uploadResult.url;
        console.log("Image uploaded successfully:", originalImageUrl);
        setProgress(30);
        setProgressMessage("업로드 완료! AI 합성 시작...");
      } else {
        console.log("Image is already a URL, skipping upload");
        setProgress(30);
        setProgressMessage("AI 합성 시작...");
      }

      // Call AI synthesis API with selected face
      console.log("Calling Face Swap API with params:", {
        originalImageUrl,
        selectedFaceUrl,
        nationality: "한국인",
        gender,
        style,
      });
      setProgress(40);
      setProgressMessage("얼굴 합성 중... (약 30초 소요)");
      
      const result = await synthesizeMutation.mutateAsync({
        originalImageUrl,
        selectedFaceUrl, // 선택한 한국인 얼굴 이미지 URL
        nationality: "한국인", // 한국인으로 고정
        gender,
        style,
        userId: 1, // TODO: Replace with actual user ID from auth context
      });
      console.log("Face Swap API result:", result);
      setProgress(100);
      setProgressMessage("합성 완료!");

      // Navigate to result screen with synthesized image
      router.push({
        pathname: "/result" as any,
        params: {
          originalImageUri: imageUri,
          resultImageUri: result.resultImageUrl,
          description: result.description,
          nationality: "한국인",
          gender,
          style,
        },
      });
    } catch (error: any) {
      console.error("\n========== CLIENT FACE SYNTHESIS ERROR ==========");
      console.error("Error:", error);
      console.error("Error message:", error?.message);
      console.error("Error name:", error?.name);
      console.error("Error data:", error?.data);
      console.error("Full error:", JSON.stringify(error, null, 2));
      console.error("=================================================\n");
      alert(`얼굴 합성에 실패했습니다.\n오류: ${error?.message || '알 수 없는 오류'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading overlay
  if (isProcessing) {
    return (
      <ScreenContainer className="bg-background">
        <SubScreenHeader title="얼굴 합성 중" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          {/* Loading Animation */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>

          {/* Loading Text */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            AI가 얼굴을 합성하는 중...
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: colors.muted,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {progressMessage}
          </Text>

          {/* Progress Indicator */}
          <View
            style={{
              marginTop: 40,
              width: "100%",
              maxWidth: 280,
            }}
          >
            <View
              style={{
                height: 4,
                backgroundColor: colors.surface,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 2,
                }}
              />
            </View>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <SubScreenHeader title="얼굴 선택" />

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
        {/* Info Card */}
        <View
          style={{
            backgroundColor: colors.primary + "15",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 14,
              color: colors.foreground,
              lineHeight: 20,
            }}
          >
            한국인 {gender === "male" ? "남성" : "여성"} - {style} 스타일
          </Text>
        </View>

        {/* Face Grid */}
        <FlatList
          data={faces}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isSelected = selectedFaceId === item.id;
            return (
              <Pressable
                onPress={() => handleSelectFace(item.id)}
                style={({ pressed }) => ({
                  flex: 1,
                  aspectRatio: 0.75,
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Image source={item.localSource} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                {isSelected && (
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>

      {/* Bottom Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: 24,
          paddingTop: 16,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border + "40",
        }}
      >
        <Button
          label="합성 시작"
          variant="primary"
          size="large"
          fullWidth
          disabled={!selectedFaceId || isProcessing}
          icon="arrow-forward"
          iconPosition="right"
          onPress={handleNext}
        />
      </View>
    </ScreenContainer>
  );
}

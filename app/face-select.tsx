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
import { prepareImageForUpload } from "@/lib/upload-image";

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

  // Firebase에서 얼굴 풀 가져오기
  const { data: facePoolData, isLoading: isFacePoolLoading, error: facePoolError } = trpc.ai.getFacePool.useQuery({
    nationality: "korea",
    gender: gender as "male" | "female",
    style: style || "default",
    limit: 20, // 최대 20개까지 가져오기
  });

  const faces = facePoolData || [];

  // 디버깅 로그
  console.log('[Face Select] Gender:', gender);
  console.log('[Face Select] Style:', style);
  console.log('[Face Select] Loading:', isFacePoolLoading);
  console.log('[Face Select] Error:', facePoolError);
  console.log('[Face Select] Faces count:', faces.length);
  console.log('[Face Select] Faces data:', faces);

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
    setProgressMessage("이미지 준비 중...");

    try {
      // Get selected face image with GCS URL
      const selectedFace = faces.find((f) => f.id === selectedFaceId);
      if (!selectedFace) return;

      // Use actual GCS URL for Dzine AI API
      const selectedFaceUrl = selectedFace.imageUrl;

      // Prepare original image as Base64
      console.log("Starting image preparation...");
      console.log("Original imageUri:", imageUri);
      setProgress(10);
      setProgressMessage("이미지 인코딩 중...");
      
      const imageData = await prepareImageForUpload(imageUri);
      console.log("Image data prepared, filename:", imageData.filename);
      setProgress(30);
      setProgressMessage("AI 합성 시작...");

      // Call AI synthesis API with selected face
      console.log("Calling Face Swap API with Base64 image");
      setProgress(40);
      setProgressMessage("얼굴 합성 중... (약 30초 소요)");
      
      const result = await synthesizeMutation.mutateAsync({
        originalImageBase64: imageData.base64Data,
        selectedFaceUrl,
        nationality: "한국인",
        gender,
        style,
        userId: 1,
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
        {isFacePoolLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 16, color: colors.muted }}>얼굴 이미지 불러오는 중...</Text>
          </View>
        ) : faces.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="images-outline" size={48} color={colors.muted} />
            <Text style={{ marginTop: 16, color: colors.muted }}>사용 가능한 얼굴이 없습니다</Text>
          </View>
        ) : (
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
                  <Image source={{ uri: item.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
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
        )}
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

import { View, Text, FlatList, Platform, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { TabSwitch } from "@/components/ui/tab-switch";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FaceGridItem } from "@/components/ui/face-grid-item";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/upload-image";
import { optimizeImage } from "@/lib/image-optimizer";
import { usePreloadImages } from "@/lib/use-preload-images";

const GENDER_TABS = [
  { key: "male", label: "남성" },
  { key: "female", label: "여성" },
];

export default function FaceSelectScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const nationality = params.nationality as string;
  const style = params.style as string;
  const colors = useColors();

  const [activeGender, setActiveGender] = useState<string>(
    (params.gender as string) || "male"
  );
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const synthesizeMutation = trpc.ai.synthesizeFace.useMutation();

  const { data: facePoolData, isLoading: isFacePoolLoading, error: facePoolError } =
    trpc.ai.getFacePool.useQuery({
      nationality: "korea",
      gender: activeGender as "male" | "female",
      style: style || "default",
      limit: 20,
    });

  const faces = facePoolData || [];
  const imageUrls = faces.map((f) => f.imageUrl);
  const { loaded: imagesLoaded, progress: preloadProgress } = usePreloadImages(imageUrls);

  const handleGenderChange = (key: string) => {
    setActiveGender(key);
    setSelectedFaceId(null);
  };

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
      const selectedFace = faces.find((f) => f.id === selectedFaceId);
      if (!selectedFace) return;

      const selectedFaceUrl = selectedFace.imageUrl;

      setProgress(5);
      setProgressMessage("이미지 최적화 중...");
      const optimizedUri = await optimizeImage(imageUri, { maxWidth: 1080, quality: 0.85 });

      setProgress(10);
      setProgressMessage("이미지 인코딩 중...");
      const imageData = await prepareImageForUpload(optimizedUri);

      setProgress(30);
      setProgressMessage("AI 합성 시작...");
      setProgress(40);
      setProgressMessage("얼굴 합성 중... (약 30초 소요)");

      const isPremiumUser = false;

      const result = await synthesizeMutation.mutateAsync({
        originalImageBase64: imageData.base64Data,
        selectedFaceUrl,
        nationality: "한국인",
        gender: activeGender,
        style,
        userId: 1,
        quality: isPremiumUser ? "high" : "balanced",
        priority: isPremiumUser,
      });

      setProgress(100);
      setProgressMessage("합성 완료!");

      router.push({
        pathname: "/result" as any,
        params: {
          originalImageUri: imageUri,
          resultImageUri: result.resultImageUrl,
          description: result.description,
          nationality: "한국인",
          gender: activeGender,
          style,
        },
      });
    } catch (error: any) {
      console.error("[Face Select] Error:", error?.message);
      alert(`얼굴 합성에 실패했습니다.\n오류: ${error?.message || "알 수 없는 오류"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Processing overlay
  if (isProcessing) {
    return (
      <ScreenContainer className="bg-background">
        <SubScreenHeader title="얼굴 합성 중" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text
            style={{
              fontSize: 52,
              fontWeight: "800",
              color: "#9C27B0",
              marginBottom: 8,
            }}
          >
            {Math.round(progress)}%
          </Text>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 8, textAlign: "center" }}
          >
            AI가 얼굴을 합성 중...
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 32, textAlign: "center" }}>
            {progressMessage}
          </Text>
          <View style={{ width: "100%" }}>
            <ProgressBar progress={progress} />
          </View>

          {/* Tip Card */}
          <View
            style={{
              marginTop: 40,
              backgroundColor: "#9C27B020",
              borderWidth: 1,
              borderColor: "#9C27B040",
              borderRadius: 16,
              padding: 16,
              width: "100%",
            }}
          >
            <Text style={{ fontSize: 13, color: "#9C27B0", fontWeight: "600", marginBottom: 4 }}>
              💡 Tip
            </Text>
            <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
              매일 5장씩 작업하면 포트폴리오가 빠르게 쌓여요!
            </Text>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Loading face pool
  if (isFacePoolLoading || !imagesLoaded) {
    return (
      <ScreenContainer className="bg-background">
        <SubScreenHeader title="얼굴 선택" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#9C27B020",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <ActivityIndicator size="large" color="#9C27B0" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>
            {isFacePoolLoading ? "얼굴 풀 로딩 중..." : "이미지 준비 중..."}
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            {Math.round(preloadProgress * 100)}%
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <SubScreenHeader title="얼굴 선택" />

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
        {/* Step indicator */}
        <Text style={{ fontSize: 13, color: colors.muted, textAlign: "right", marginBottom: 12 }}>
          2 / 3 단계
        </Text>

        {/* Gender Tab */}
        <View style={{ marginBottom: 20 }}>
          <TabSwitch
            tabs={GENDER_TABS}
            activeTab={activeGender}
            onTabChange={handleGenderChange}
          />
        </View>

        {/* Face Grid */}
        {facePoolError ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={{ marginTop: 12, color: colors.muted, textAlign: "center" }}>
              얼굴 이미지를 불러오지 못했습니다
            </Text>
          </View>
        ) : faces.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="images-outline" size={48} color={colors.muted} />
            <Text style={{ marginTop: 12, color: colors.muted }}>사용 가능한 얼굴이 없습니다</Text>
          </View>
        ) : (
          <FlatList
            data={faces}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <FaceGridItem
                imageUrl={item.imageUrl}
                selected={selectedFaceId === item.id}
                onPress={() => handleSelectFace(item.id)}
              />
            )}
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
          label="얼굴 스왑 시작 ✨"
          variant="primary"
          size="large"
          fullWidth
          disabled={!selectedFaceId || isProcessing}
          onPress={handleNext}
        />
      </View>
    </ScreenContainer>
  );
}

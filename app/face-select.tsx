import { View, Text, FlatList, Platform, ActivityIndicator, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { TabSwitch } from "@/components/ui/tab-switch";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FaceGridItem } from "@/components/ui/face-grid-item";
import * as Haptics from "expo-haptics";
import { BG_PINK, COLOR_PRIMARY, COLOR_PRIMARY_LIGHT } from "@/constants/colors";
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
      <ScreenContainer style={{ backgroundColor: BG_PINK }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 8 }}>⏳</Text>
          <Text style={{ fontSize: 56, fontWeight: "800", color: COLOR_PRIMARY, marginBottom: 4 }}>
            {Math.round(progress)}%
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 6, textAlign: "center" }}>
            AI가 얼굴을 합성 중...
          </Text>
          <Text style={{ fontSize: 14, color: "#4A4A4A", marginBottom: 28, textAlign: "center" }}>
            {progressMessage}
          </Text>
          <View style={{ width: "100%", marginBottom: 12 }}>
            <ProgressBar progress={progress} />
          </View>
          <Text style={{ fontSize: 13, color: "#4A4A4A", marginBottom: 32 }}>예상 시간: 약 20초</Text>

          {/* Tip Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderLeftWidth: 4,
              borderLeftColor: COLOR_PRIMARY,
              borderRadius: 16,
              padding: 16,
              width: "100%",
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 13, color: COLOR_PRIMARY, fontWeight: "700", marginBottom: 6 }}>
              💡 알고 계셨나요?
            </Text>
            <Text style={{ fontSize: 13, color: "#1A1A1A", lineHeight: 20 }}>
              HairKeeper는 머리카락을 100% 보존합니다.{"\n"}얼굴만 교체하여 자연스러운 결과를 제공해요!
            </Text>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Loading face pool
  if (isFacePoolLoading || !imagesLoaded) {
    return (
      <ScreenContainer style={{ backgroundColor: BG_PINK }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLOR_PRIMARY_LIGHT,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <ActivityIndicator size="large" color={COLOR_PRIMARY} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: colors.foreground, marginBottom: 6 }}>
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
    <ScreenContainer style={{ backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: COLOR_PRIMARY_LIGHT, alignItems: "center", justifyContent: "center",
                marginRight: 12, opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="arrow-back" size={20} color={COLOR_PRIMARY} />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A" }}>얼굴 선택</Text>
          </View>
          <View style={{ backgroundColor: COLOR_PRIMARY_LIGHT, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: COLOR_PRIMARY }}>2 / 3</Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, color: "#4A4A4A", marginLeft: 52 }}>원하는 얼굴을 골라주세요</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        {/* Gender Tab */}
        <View style={{ marginBottom: 20 }}>
          <TabSwitch tabs={GENDER_TABS} activeTab={activeGender} onTabChange={handleGenderChange} />
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
            contentContainerStyle={{ gap: 12, paddingBottom: 110 }}
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

      {/* Bottom CTA */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: 28,
          paddingTop: 16,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3E5F5",
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

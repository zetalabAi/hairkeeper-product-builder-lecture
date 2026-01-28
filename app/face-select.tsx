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

// Dummy face data
const DUMMY_FACES = Array.from({ length: 12 }, (_, i) => ({
  id: `face-${i + 1}`,
  url: `https://i.pravatar.cc/300?img=${i + 10}`,
}));

export default function FaceSelectScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const nationality = params.nationality as string;
  const gender = params.gender as string;
  const style = params.style as string;
  const colors = useColors();

  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const synthesizeMutation = trpc.ai.synthesizeFace.useMutation();

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

    try {
      // Call AI synthesis API
      const result = await synthesizeMutation.mutateAsync({
        originalImageUrl: imageUri,
        nationality,
        gender,
        style,
      });

      // Navigate to result screen with synthesized image
      router.push({
        pathname: "/result" as any,
        params: {
          originalImageUri: imageUri,
          resultImageUri: result.resultImageUrl,
          description: result.description,
          nationality,
          gender,
          style,
        },
      });
    } catch (error) {
      console.error("Face synthesis failed:", error);
      alert("얼굴 합성에 실패했습니다. 다시 시도해주세요.");
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
            머리카락과 배경은 그대로 유지하면서{"\n"}
            얼굴만 자연스럽게 변경하고 있습니다
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
                  width: "70%",
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
            선택한 스타일: {nationality} {gender} - {style}
          </Text>
        </View>

        {/* Face Grid */}
        <FlatList
          data={DUMMY_FACES}
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
                  aspectRatio: 1,
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Image source={{ uri: item.url }} style={{ width: "100%", height: "100%" }} />
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

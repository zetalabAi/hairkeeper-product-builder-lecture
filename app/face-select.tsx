import { useState } from "react";
import { View, Text, Pressable, Platform, ScrollView, Image, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

// 테스트용 더미 얼굴 데이터 (실제로는 서버에서 가져옴)
const DUMMY_FACES = Array.from({ length: 12 }, (_, i) => ({
  id: `face-${i + 1}`,
  url: `https://i.pravatar.cc/300?img=${i + 1}`,
  similarity: Math.floor(Math.random() * 30) + 70, // 70-100% 유사도
}));

export default function FaceSelectScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const nationality = params.nationality as string;
  const gender = params.gender as string;
  const style = params.style as string;
  const colors = useColors();

  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleSelectFace = (faceId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFaceId(faceId);
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!selectedFaceId) return;

    const selectedFace = DUMMY_FACES.find((f) => f.id === selectedFaceId);

    router.push({
      pathname: "/result" as any,
      params: {
        imageUri,
        faceUrl: selectedFace?.url || "",
        nationality,
        gender,
        style,
      },
    });
  };

  const renderFaceItem = ({ item }: { item: typeof DUMMY_FACES[0] }) => {
    const isSelected = selectedFaceId === item.id;

    return (
      <Pressable
        onPress={() => handleSelectFace(item.id)}
        style={({ pressed }) => [
          {
            width: "48%",
            aspectRatio: 1,
            marginBottom: 12,
            opacity: pressed ? 0.7 : 1,
            borderWidth: 3,
            borderColor: isSelected ? colors.primary : "transparent",
            borderRadius: 16,
            overflow: "hidden",
          },
        ]}
      >
        <Image
          source={{ uri: item.url }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        {/* Similarity Badge */}
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0,0,0,0.7)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text className="text-white text-xs font-semibold">
            {item.similarity}%
          </Text>
        </View>
        {/* Selection Indicator */}
        {isSelected && (
          <View
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>✓</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Text className="text-base text-primary">취소</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">얼굴 선택</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info */}
      <View className="px-6 pb-4">
        <Text className="text-sm text-muted text-center">
          선택한 옵션: {nationality === "korea" ? "한국" : "일본"} · {gender === "female" ? "여성" : "남성"} · {style}
        </Text>
        <Text className="text-sm text-muted text-center mt-2">
          AI가 추천하는 얼굴을 선택하세요 (유사도 순)
        </Text>
      </View>

      {/* Face Grid */}
      <View className="flex-1 px-6">
        <FlatList
          data={DUMMY_FACES}
          renderItem={renderFaceItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {/* Bottom Button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleNext}
          disabled={!selectedFaceId}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed && selectedFaceId ? 0.97 : 1 }],
              opacity: !selectedFaceId ? 0.5 : pressed ? 0.9 : 1,
              backgroundColor: colors.primary,
            },
          ]}
          className="py-4 rounded-full items-center"
        >
          <Text className="text-white text-lg font-semibold">
            {selectedFaceId ? "합성하기" : "얼굴을 선택하세요"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

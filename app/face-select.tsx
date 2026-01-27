import { View, Text, FlatList, Pressable, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import { useState } from "react";

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

  const handleSelectFace = (faceId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFaceId(faceId);
  };

  const handleNext = () => {
    if (!selectedFaceId) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

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
        style={({ pressed }) => ({
          width: "48%",
          aspectRatio: 1,
          marginBottom: 12,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: colors.surface,
          shadowColor: "#000",
          shadowOpacity: isSelected ? 0.15 : 0.08,
          shadowRadius: isSelected ? 12 : 8,
          shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
          elevation: isSelected ? 4 : 2,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: isSelected ? 1.02 : 1 }, { translateY: pressed ? 1 : 0 }],
        })}
      >
        <View style={{ flex: 1, backgroundColor: colors.muted + "30" }} />
        {isSelected && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <SubScreenHeader title="얼굴 선택" />

      {/* Info */}
      <View className="px-6 mb-4">
        <Text className="text-sm text-muted text-center">
          {nationality} · {gender} · {style}
        </Text>
      </View>

      {/* Face Grid */}
      <FlatList
        data={DUMMY_FACES}
        renderItem={renderFaceItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 24,
        }}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 24,
        }}
      />

      {/* CTA Button */}
      <View
        style={{
          padding: 24,
          paddingBottom: Platform.OS === "ios" ? 34 : 24,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button
          label="얼굴 합성하기"
          variant="primary"
          size="large"
          fullWidth
          disabled={!selectedFaceId}
          onPress={handleNext}
          icon="flash"
          iconPosition="left"
        />
      </View>
    </ScreenContainer>
  );
}

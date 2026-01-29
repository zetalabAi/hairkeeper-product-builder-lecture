import { View, Text, FlatList, Image, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

// 더미 히스토리 데이터 (실제로는 데이터베이스에서 가져와야 함)
const HISTORY_DATA = [
  {
    id: "1",
    originalImage: "https://via.placeholder.com/300x400",
    resultImage: "https://via.placeholder.com/300x400",
    date: "2026-01-29",
    gender: "여성",
    style: "자연스러운",
  },
  {
    id: "2",
    originalImage: "https://via.placeholder.com/300x400",
    resultImage: "https://via.placeholder.com/300x400",
    date: "2026-01-28",
    gender: "남성",
    style: "세련된",
  },
  {
    id: "3",
    originalImage: "https://via.placeholder.com/300x400",
    resultImage: "https://via.placeholder.com/300x400",
    date: "2026-01-27",
    gender: "여성",
    style: "화려한",
  },
];

export default function HistoryScreen() {
  const colors = useColors();

  const handleItemPress = (item: typeof HISTORY_DATA[0]) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Navigate to result screen with history item
    router.push({
      pathname: "/result" as any,
      params: {
        originalImageUri: item.originalImage,
        resultImageUri: item.resultImage,
      },
    });
  };

  const renderItem = ({ item }: { item: typeof HISTORY_DATA[0] }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item)}
      style={{
        width: "48%",
        marginBottom: 16,
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      activeOpacity={0.7}
    >
      {/* Result Image */}
      <Image
        source={{ uri: item.resultImage }}
        style={{
          width: "100%",
          aspectRatio: 3 / 4,
          backgroundColor: colors.border,
        }}
        resizeMode="cover"
      />

      {/* Info */}
      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.foreground,
            marginBottom: 4,
          }}
        >
          {item.gender} - {item.style}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.muted,
          }}
        >
          {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <SubScreenHeader title="히스토리" />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {HISTORY_DATA.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 32,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.muted,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              아직 작업 기록이 없습니다.{"\n"}
              첫 번째 얼굴 합성을 시작해보세요!
            </Text>
          </View>
        ) : (
          <FlatList
            data={HISTORY_DATA}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

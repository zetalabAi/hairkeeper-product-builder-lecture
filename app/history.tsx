import { View, Text, FlatList, Image, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SubScreenHeader } from "@/components/sub-screen-header";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { BG_PINK, COLOR_PRIMARY, COLOR_PRIMARY_LIGHT, COLOR_PRIMARY_BORDER } from "@/constants/colors";

export default function HistoryScreen() {

  // Fetch history from database
  const { data: projects, isLoading, error } = trpc.ai.getHistory.useQuery({});

  const handleItemPress = (item: any) => {
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item)}
      style={{
        width: "48%",
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: COLOR_PRIMARY_BORDER,
        elevation: 2,
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.resultImageUrl || item.originalImageUrl }}
        style={{ width: "100%", aspectRatio: 3 / 4, backgroundColor: COLOR_PRIMARY_LIGHT }}
        resizeMode="cover"
      />
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A", marginBottom: 4 }}>
          {item.gender === "male" ? "남성" : "여성"} - {item.style}
        </Text>
        <Text style={{ fontSize: 12, color: "#6B6B6B" }}>
          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG_PINK }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <SubScreenHeader title="히스토리" />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: "#6B6B6B" }}>
              로딩 중...
            </Text>
          </View>
        ) : error ? (
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
                color: "#F44336",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              히스토리를 불러오는 데 실패했습니다.
            </Text>
          </View>
        ) : !projects || projects.length === 0 ? (
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
                color: "#6B6B6B",
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
            data={projects}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
      </SafeAreaView>
    </View>
  );
}

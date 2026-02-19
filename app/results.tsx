import { View, Text, FlatList, Image, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  BG_PINK,
  COLOR_PRIMARY,
  COLOR_PRIMARY_LIGHT,
  COLOR_PRIMARY_BORDER,
  COLOR_SECONDARY,
} from "@/constants/colors";

export default function ResultsScreen() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { data: projects, isLoading, error } = trpc.ai.getHistory.useQuery({});

  const toggleFavorite = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleItemPress = (item: any) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/result" as any,
      params: {
        originalImageUri: item.originalImage,
        resultImageUri: item.resultImage,
      },
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFav = favorites.has(item.id?.toString());
    return (
      <Pressable
        onPress={() => handleItemPress(item)}
        style={({ pressed }) => ({
          width: "48%",
          marginBottom: 16,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          borderWidth: 1.5,
          borderColor: COLOR_PRIMARY_BORDER,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        {/* 이미지 */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: item.resultImageUrl || item.originalImageUrl }}
            style={{ width: "100%", aspectRatio: 3 / 4, backgroundColor: COLOR_PRIMARY_LIGHT }}
            resizeMode="cover"
          />
          {/* 즐겨찾기 하트 */}
          <Pressable
            onPress={() => toggleFavorite(item.id?.toString())}
            style={({ pressed }) => ({
              position: "absolute",
              top: 8,
              right: 8,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.9)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={18}
              color={isFav ? COLOR_SECONDARY : "#999"}
            />
          </Pressable>
        </View>

        {/* 정보 */}
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1A1A", marginBottom: 2 }}>
            {item.gender === "male" ? "남성" : "여성"} · {item.style}
          </Text>
          <Text style={{ fontSize: 11, color: "#6B6B6B" }}>
            {new Date(item.createdAt).toLocaleDateString("ko-KR")}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG_PINK }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <SubScreenHeader title="결과물" />

        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 15, color: "#6B6B6B" }}>로딩 중...</Text>
          </View>
        ) : error || !projects || projects.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLOR_PRIMARY_LIGHT, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="images-outline" size={36} color={COLOR_PRIMARY} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 }}>
              아직 결과물이 없어요
            </Text>
            <Text style={{ fontSize: 14, color: "#6B6B6B", textAlign: "center", marginBottom: 24 }}>
              첫 번째 얼굴 합성을 시작해보세요!
            </Text>
            <Pressable
              onPress={() => router.push("/photo-select" as any)}
              style={({ pressed }) => ({
                backgroundColor: COLOR_PRIMARY,
                borderRadius: 24,
                paddingVertical: 12,
                paddingHorizontal: 28,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
                사진 선택하기 →
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={projects}
            renderItem={renderItem}
            keyExtractor={(item) => item.id?.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

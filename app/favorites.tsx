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

export default function FavoritesScreen() {
  // TODO: Firestore에서 isFavorite=true 데이터 fetch
  // 현재는 로컬 상태로 관리
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { data: projects } = trpc.ai.getHistory.useQuery({});

  // favorites Set에 있는 항목만 필터링
  const favoriteProjects = (projects || []).filter((p: any) =>
    favorites.has(p.id?.toString())
  );

  const removeFavorite = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
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

  const renderItem = ({ item }: { item: any }) => (
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
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: item.resultImageUrl || item.originalImageUrl }}
          style={{ width: "100%", aspectRatio: 3 / 4, backgroundColor: COLOR_PRIMARY_LIGHT }}
          resizeMode="cover"
        />
        {/* 하트 (꽉 찬 상태) */}
        <Pressable
          onPress={() => removeFavorite(item.id?.toString())}
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
          <Ionicons name="heart" size={18} color={COLOR_SECONDARY} />
        </Pressable>
      </View>

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

  return (
    <View style={{ flex: 1, backgroundColor: BG_PINK }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <SubScreenHeader title="즐겨찾기" />

        {favoriteProjects.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#FCE4EC", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="heart-outline" size={36} color={COLOR_SECONDARY} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 }}>
              즐겨찾기가 비어있어요
            </Text>
            <Text style={{ fontSize: 14, color: "#6B6B6B", textAlign: "center" }}>
              결과물에서 하트를 눌러{"\n"}즐겨찾기에 추가하세요
            </Text>
          </View>
        ) : (
          <FlatList
            data={favoriteProjects}
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

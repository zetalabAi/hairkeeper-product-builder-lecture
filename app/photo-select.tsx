import { View, Text, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { BG_LAVENDER, COLOR_PRIMARY, COLOR_PRIMARY_LIGHT } from "@/constants/colors";

export default function PhotoSelectScreen() {
  const colors = useColors();

  const handleSelectFromCamera = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("카메라 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: "/photo-edit" as any,
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  const handleSelectFromGallery = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("갤러리 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: "/photo-edit" as any,
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  const cardOptions = [
    {
      icon: "camera" as const,
      label: "카메라로 촬영",
      desc: "지금 바로 사진을 촬영하세요",
      onPress: handleSelectFromCamera,
    },
    {
      icon: "images" as const,
      label: "갤러리에서 선택",
      desc: "저장된 사진을 불러오세요",
      onPress: handleSelectFromGallery,
    },
  ];

  return (
    <ScreenContainer style={{ backgroundColor: BG_LAVENDER }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8, flexDirection: "row", alignItems: "center" }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center",
            marginRight: 12, opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="arrow-back" size={22} color={COLOR_PRIMARY} />
        </Pressable>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>사진 선택</Text>
          <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>원하는 방법을 선택해주세요</Text>
        </View>
      </View>

      {/* Cards */}
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 16 }}>
        {cardOptions.map((opt) => (
          <Pressable
            key={opt.label}
            onPress={opt.onPress}
            style={({ pressed }) => ({
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              height: 160,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#9C27B0",
              shadowOpacity: 0.1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: COLOR_PRIMARY_LIGHT,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name={opt.icon} size={32} color={COLOR_PRIMARY} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 4 }}>
              {opt.label}
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted }}>{opt.desc}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

import { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

export default function BatchProcessScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("사진 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
    });

    if (result.canceled) return;

    const uris = result.assets.map((asset) => asset.uri);
    setSelectedImages(uris);
  };

  const handleRemoveImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((item) => item !== uri));
  };

  const handleNext = () => {
    if (selectedImages.length === 0) return;

    router.push({
      pathname: "/face-select" as any,
      params: {
        imageUris: JSON.stringify(selectedImages),
      },
    });
  };

  return (
    <View className="flex-1 bg-background px-6 pt-6">
      <Text className="text-2xl font-semibold text-foreground">배치 처리</Text>
      <Text className="mt-2 text-sm text-muted">최대 10장까지 선택할 수 있습니다.</Text>

      <View className="mt-6 flex-row items-center justify-between">
        <Text className="text-sm text-muted">선택됨</Text>
        <Text className="text-sm font-semibold text-foreground">{selectedImages.length}/10</Text>
      </View>

      <TouchableOpacity
        onPress={handlePickImages}
        className="mt-4 rounded-2xl border border-dashed border-border px-4 py-6"
      >
        <Text className="text-center text-base text-foreground">이미지 선택</Text>
      </TouchableOpacity>

      <ScrollView className="mt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="flex-row flex-wrap gap-2">
          {selectedImages.map((uri) => (
            <View key={uri} className="relative h-28 w-28 overflow-hidden rounded-xl">
              <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
              <TouchableOpacity
                onPress={() => handleRemoveImage(uri)}
                className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/70"
              >
                <Text className="text-xs text-white">X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-6 py-5">
        <TouchableOpacity
          onPress={handleNext}
          disabled={selectedImages.length === 0}
          className={`rounded-xl py-4 ${selectedImages.length === 0 ? "bg-muted" : "bg-primary"}`}
        >
          <Text
            className={`text-center text-base font-semibold ${
              selectedImages.length === 0 ? "text-muted-foreground" : "text-primary-foreground"
            }`}
          >
            얼굴 선택으로 이동
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

import { Image, Pressable, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface FaceGridItemProps {
  imageUrl: string;
  selected: boolean;
  onPress: () => void;
}

export function FaceGridItem({ imageUrl, selected, onPress }: FaceGridItemProps) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        flex: 1,
        aspectRatio: 0.75,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: selected ? 3 : 0,
        borderColor: "#A855F7",
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
      {selected && (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#A855F7",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

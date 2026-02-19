import { View, Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { Ionicons } from "@expo/vector-icons";
import { BG_PINK, COLOR_PRIMARY } from "@/constants/colors";

export default function ContactScreen() {
  return (
    <ScreenContainer style={{ backgroundColor: BG_PINK }}>
      <SubScreenHeader title="문의하기" />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Ionicons name="mail-outline" size={64} color={COLOR_PRIMARY} />
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginTop: 16 }}>
          문의하기
        </Text>
        <Text style={{ fontSize: 15, color: "#6B6B6B", marginTop: 8, textAlign: "center" }}>
          곧 공개됩니다
        </Text>
      </View>
    </ScreenContainer>
  );
}

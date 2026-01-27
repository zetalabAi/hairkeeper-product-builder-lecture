import { View, Text, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function HistoryScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-foreground">히스토리</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-muted text-center">
            아직 작업 기록이 없습니다.{"\n"}
            첫 프로젝트를 시작해보세요!
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ProgressBarProps {
  progress: number; // 0-100
  showPercent?: boolean;
}

export function ProgressBar({ progress, showPercent = false }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View>
      {showPercent && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: "#A855F7",
            textAlign: "right",
            marginBottom: 6,
          }}
        >
          {Math.round(clampedProgress)}%
        </Text>
      )}
      <View
        style={{
          height: 8,
          backgroundColor: "#E5E5E5",
          borderRadius: 100,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["#A855F7", "#EC4899"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: "100%",
            width: `${clampedProgress}%`,
            borderRadius: 100,
          }}
        />
      </View>
    </View>
  );
}

import { Pressable, Text, View, Platform, type PressableProps, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  /**
   * Button text label
   */
  label: string;
  /**
   * Button variant (primary, secondary, tertiary)
   */
  variant?: ButtonVariant;
  /**
   * Button size
   */
  size?: ButtonSize;
  /**
   * Optional icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * Icon position (left or right)
   */
  iconPosition?: "left" | "right";
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Custom style
   */
  style?: ViewStyle;
}

/**
 * 독자적 버튼 컴포넌트
 * 
 * - Soft rounded rectangle (16px, 20px, 24px)
 * - Border 사용 금지
 * - Depth는 subtle shadow로 표현
 * - Press: opacity + 1px 이동만 (bounce 금지)
 */
export function Button({
  label,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  disabled = false,
  fullWidth = false,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const colors = useColors();

  const handlePress = (e: any) => {
    if (disabled) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(
        variant === "primary"
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }
    
    onPress?.(e);
  };

  // Size configurations
  const sizeConfig = {
    small: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 16,
      fontSize: 14,
      iconSize: 18,
    },
    medium: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 20,
      fontSize: 16,
      iconSize: 20,
    },
    large: {
      paddingVertical: 20,
      paddingHorizontal: 32,
      borderRadius: 24,
      fontSize: 18,
      iconSize: 24,
    },
  };

  const config = sizeConfig[size];

  // Variant styles
  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: disabled ? colors.muted : "transparent",
      shadowColor: "#9C27B0",
      shadowOpacity: disabled ? 0 : 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: disabled ? 0 : 4,
    },
    secondary: {
      backgroundColor: colors.surface,
      shadowColor: "#000",
      shadowOpacity: disabled ? 0 : 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: disabled ? 0 : 2,
    },
    tertiary: {
      backgroundColor: "transparent",
    },
  };

  const textColor =
    variant === "primary"
      ? "#FFFFFF"
      : variant === "secondary"
      ? colors.primary
      : colors.foreground;

  const iconColor = disabled ? colors.muted : textColor;

  const innerContent = (
    <>
      {icon && iconPosition === "left" && (
        <Ionicons
          name={icon}
          size={config.iconSize}
          color={iconColor}
          style={{ marginRight: 8 }}
        />
      )}
      <Text
        style={{
          fontSize: config.fontSize,
          fontWeight: "600",
          color: disabled ? colors.muted : textColor,
        }}
      >
        {label}
      </Text>
      {icon && iconPosition === "right" && (
        <Ionicons
          name={icon}
          size={config.iconSize}
          color={iconColor}
          style={{ marginLeft: 8 }}
        />
      )}
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          borderRadius: config.borderRadius,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ translateY: pressed && !disabled ? 1 : 0 }],
          width: fullWidth ? "100%" : undefined,
          overflow: "hidden",
        },
        variant !== "primary" ? variantStyles[variant] : undefined,
        style,
      ]}
      {...props}
    >
      {variant === "primary" && !disabled ? (
        <LinearGradient
          colors={["#9C27B0", "#E91E63"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: config.paddingVertical,
            paddingHorizontal: config.paddingHorizontal,
            shadowColor: "#9C27B0",
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          {innerContent}
        </LinearGradient>
      ) : (
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: config.paddingVertical,
              paddingHorizontal: config.paddingHorizontal,
            },
            variantStyles[variant],
          ]}
        >
          {innerContent}
        </View>
      )}
    </Pressable>
  );
}

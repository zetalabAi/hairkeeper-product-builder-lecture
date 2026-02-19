import { Animated, Pressable, Text, View, StyleSheet, Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDrawer } from "@/lib/drawer-context";
import { useDemoAuth } from "@/lib/demo-auth-context";
import {
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_PRIMARY_LIGHT,
  COLOR_PRIMARY_BORDER,
  BG_PINK,
} from "@/constants/colors";

const DRAWER_WIDTH = 280;
const ANIMATION_DURATION = 240;

const MENU_ITEMS = [
  { icon: "images-outline" as const, label: "결과물", route: "/results" },
  { icon: "star-outline" as const, label: "즐겨찾기", route: "/favorites" },
  { icon: "stats-chart-outline" as const, label: "사용 통계", route: "/statistics" },
  { icon: "settings-outline" as const, label: "설정", route: "/settings" },
  { icon: "help-circle-outline" as const, label: "도움말", route: "/help" },
  { icon: "mail-outline" as const, label: "문의하기", route: "/contact" },
];

export function CustomDrawer() {
  const { isOpen, close } = useDrawer();
  const { user, isLoggedIn, logout } = useDemoAuth();

  const [mounted, setMounted] = useState(isOpen);
  // 우측에서 슬라이드: 초기값 +DRAWER_WIDTH (화면 오른쪽 밖)
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isOpen ? 0 : DRAWER_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isOpen ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!isOpen) setMounted(false);
    });
  }, [isOpen]);

  const navigate = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // 패널 닫지 않고 이동 - 뒤로가기 시 패널 유지
    router.push(route as any);
  };

  const handleLogout = () => {
    close();
    logout();
  };

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.backdrop, { opacity }]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
      </Animated.View>

      {/* Drawer Panel - 우측 */}
      <Animated.View
        style={[
          styles.panel,
          { transform: [{ translateX }] },
        ]}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Pressable
            onPress={() => navigate("/profile")}
            style={styles.avatarContainer}
          >
            <Ionicons name="person" size={32} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.userName}>
            {isLoggedIn && user ? user.name : "로그인이 필요합니다"}
          </Text>
          {isLoggedIn && user ? (
            <Text style={styles.userEmail}>{user.email}</Text>
          ) : (
            <Pressable
              onPress={() => navigate("/profile")}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>로그인하기</Text>
            </Pressable>
          )}
        </View>

        {/* Menu Items */}
        <View style={{ flex: 1, paddingVertical: 8 }}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => navigate(item.route)}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={18} color={COLOR_PRIMARY} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        {isLoggedIn && (
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={18} color={COLOR_SECONDARY} />
            </View>
            <Text style={styles.logoutLabel}>로그아웃</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  panel: {
    position: "absolute",
    right: 0,  // 우측 기준
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: BG_PINK,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: -4, height: 0 },  // 왼쪽으로 그림자
    elevation: 8,
  },
  profileSection: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_PRIMARY_BORDER,
    alignItems: "center",
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLOR_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  userEmail: {
    fontSize: 13,
    color: "#6B6B6B",
    marginTop: 4,
    textAlign: "center",
  },
  loginButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLOR_PRIMARY,
  },
  loginButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  menuItemPressed: {
    backgroundColor: COLOR_PRIMARY_LIGHT,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLOR_PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLOR_PRIMARY_BORDER,
  },
  logoutButtonPressed: {
    backgroundColor: "#FCE4EC",
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FCE4EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLOR_SECONDARY,
  },
});

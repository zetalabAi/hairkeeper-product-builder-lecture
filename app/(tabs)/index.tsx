import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GRADIENT_PRIMARY, BG_PINK, COLOR_PRIMARY, COLOR_PRIMARY_LIGHT, COLOR_PRIMARY_BORDER } from "@/constants/colors";
import { useDrawer } from "@/lib/drawer-context";

const LANGUAGES = [
  { code: "ko", flag: "🇰🇷" },
  { code: "en", flag: "🇺🇸" },
  { code: "ja", flag: "🇯🇵" },
] as const;

type LangCode = typeof LANGUAGES[number]["code"];

const TEXTS: Record<LangCode, {
  greeting: string; subtitle: string; startWork: string; recentWork: string;
  more: string; emptyHistory: string; bannerTitle: string; bannerSub: string;
  bannerCta: string; photoSelect: string; results: string; favorites: string; statistics: string;
}> = {
  ko: {
    greeting: "안녕하세요 디자이너님!", subtitle: "오늘도 멋진 작업 하세요",
    startWork: "작업 시작하기", recentWork: "최근 작업", more: "더보기",
    emptyHistory: "아직 작업 기록이 없습니다.\n첫 프로젝트를 시작해보세요!",
    bannerTitle: "AI로 5분만에 완성", bannerSub: "머리는 보존, 얼굴만 교체", bannerCta: "지금 시작하기 →",
    photoSelect: "사진 선택", results: "결과물", favorites: "즐겨찾기", statistics: "통계",
  },
  en: {
    greeting: "Hello Designer!", subtitle: "Have a great day at work",
    startWork: "Start Working", recentWork: "Recent Work", more: "More",
    emptyHistory: "No work history yet.\nStart your first project!",
    bannerTitle: "Done in 5 min with AI", bannerSub: "Keep the hair, swap the face", bannerCta: "Start Now →",
    photoSelect: "Select Photo", results: "Results", favorites: "Favorites", statistics: "Statistics",
  },
  ja: {
    greeting: "こんにちは、デザイナーさん！", subtitle: "今日も素晴らしい仕事を",
    startWork: "作業を始める", recentWork: "最近の作業", more: "もっと見る",
    emptyHistory: "まだ作業履歴がありません。\n最初のプロジェクトを始めましょう！",
    bannerTitle: "AIで5分で完成", bannerSub: "髪型はそのまま、顔だけ交換", bannerCta: "今すぐ始める →",
    photoSelect: "写真を選択", results: "結果", favorites: "お気に入り", statistics: "統計",
  },
};

export default function HomeScreen() {
  const colors = useColors();
  const { open: openDrawer } = useDrawer();
  const [langIdx, setLangIdx] = useState(0);

  const currentLang = LANGUAGES[langIdx];
  const tx = TEXTS[currentLang.code];

  const handleLangToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const next = (langIdx + 1) % LANGUAGES.length;
    setLangIdx(next);
    // i18n 연동 (실패해도 UI는 정상 동작)
    try {
      const { changeLanguage } = require("@/i18n");
      changeLanguage(LANGUAGES[next].code).catch(() => {});
    } catch {}
  };

  const handleNav = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const ACTION_BUTTONS = [
    { icon: "camera", label: tx.photoSelect, route: "/photo-select" },
    { icon: "images", label: tx.results, route: "/results" },
    { icon: "star", label: tx.favorites, route: "/favorites" },
    { icon: "bar-chart", label: tx.statistics, route: "/statistics" },
  ] as const;

  return (
    <ScreenContainer style={{ backgroundColor: BG_PINK }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 }}>
          <TouchableOpacity
            onPress={openDrawer}
            activeOpacity={0.8}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLOR_PRIMARY, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="menu" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Welcome + 국기 토글 버튼 */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 16 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A" }}>
              {tx.greeting} 👋
            </Text>
            <Text style={{ fontSize: 15, color: "#4A4A4A", marginTop: 4 }}>
              {tx.subtitle}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleLangToggle}
            activeOpacity={0.7}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: COLOR_PRIMARY_BORDER,
              ...Platform.select({
                ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
                android: { elevation: 4 },
              }),
            }}
          >
            <Text style={{ fontSize: 26 }}>{currentLang.flag}</Text>
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <LinearGradient colors={GRADIENT_PRIMARY} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 24, elevation: 6,
              ...Platform.select({ ios: { shadowColor: COLOR_PRIMARY, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } } })
            }}
          >
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>HairKeeper AI</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 }}>{tx.bannerTitle}</Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>{tx.bannerSub}</Text>
            <TouchableOpacity onPress={() => handleNav("/photo-select")} activeOpacity={0.8}
              style={{ backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, alignSelf: "flex-start" }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>{tx.bannerCta}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Action Grid */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#1A1A1A", marginBottom: 16 }}>{tx.startWork}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {ACTION_BUTTONS.map((btn) => (
              <TouchableOpacity key={btn.route} onPress={() => handleNav(btn.route)} activeOpacity={0.85}
                style={{ width: "47%", aspectRatio: 1, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 2,
                  borderColor: COLOR_PRIMARY_BORDER, alignItems: "center", justifyContent: "center",
                  elevation: 4, ...Platform.select({ ios: { shadowColor: COLOR_PRIMARY, shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } } })
                }}
              >
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: COLOR_PRIMARY_LIGHT, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <Ionicons name={btn.icon as any} size={26} color={COLOR_PRIMARY} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Work */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#1A1A1A" }}>{tx.recentWork}</Text>
            <TouchableOpacity onPress={() => handleNav("/history")}>
              <Text style={{ fontSize: 14, color: COLOR_PRIMARY, fontWeight: "600" }}>{tx.more}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 28, alignItems: "center", borderWidth: 1.5, borderColor: COLOR_PRIMARY_BORDER }}>
            <Ionicons name="images-outline" size={36} color={colors.muted} />
            <Text style={{ fontSize: 14, color: "#4A4A4A", marginTop: 10, textAlign: "center" }}>{tx.emptyHistory}</Text>
          </View>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

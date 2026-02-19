import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SubScreenHeader } from "@/components/sub-screen-header";
import { Ionicons } from "@expo/vector-icons";
import { trpc } from "@/lib/trpc";
import {
  BG_PINK,
  COLOR_PRIMARY,
  COLOR_PRIMARY_LIGHT,
  COLOR_PRIMARY_BORDER,
  COLOR_SECONDARY,
} from "@/constants/colors";

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent?: "primary" | "secondary";
};

function StatCard({ icon, label, value, accent = "primary" }: StatCardProps) {
  const color = accent === "primary" ? COLOR_PRIMARY : COLOR_SECONDARY;
  const bg = accent === "primary" ? COLOR_PRIMARY_LIGHT : "#FCE4EC";
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1.5,
        borderColor: COLOR_PRIMARY_BORDER,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: bg, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={{ fontSize: 26, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 13, color: "#6B6B6B" }}>{label}</Text>
    </View>
  );
}

export default function StatisticsScreen() {
  const { data: projects, isLoading } = trpc.ai.getHistory.useQuery({});

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const total = projects?.length ?? 0;
  const monthlyCount = (projects ?? []).filter((p: any) => {
    const d = new Date(p.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  // 성별 분포
  const maleCount = (projects ?? []).filter((p: any) => p.gender === "male").length;
  const femaleCount = total - maleCount;

  // 스타일 분포 (가장 많이 사용한 스타일)
  const styleCounts = (projects ?? []).reduce<Record<string, number>>((acc, p: any) => {
    if (p.style) acc[p.style] = (acc[p.style] || 0) + 1;
    return acc;
  }, {});
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <View style={{ flex: 1, backgroundColor: BG_PINK }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <SubScreenHeader title="사용 통계" />

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* 주요 수치 카드 2x2 */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <StatCard icon="stats-chart" label="총 처리 횟수" value={isLoading ? "..." : `${total}회`} accent="primary" />
            <StatCard icon="calendar" label="이번 달 사용" value={isLoading ? "..." : `${monthlyCount}회`} accent="secondary" />
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <StatCard icon="male" label="남성 스타일" value={isLoading ? "..." : `${maleCount}회`} accent="primary" />
            <StatCard icon="female" label="여성 스타일" value={isLoading ? "..." : `${femaleCount}회`} accent="secondary" />
          </View>

          {/* 가장 많이 사용한 스타일 */}
          {topStyle && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 20,
                borderWidth: 1.5,
                borderColor: COLOR_PRIMARY_BORDER,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: COLOR_PRIMARY, marginBottom: 12 }}>
                🏆 가장 많이 사용한 스타일
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 }}>
                    {topStyle[0]}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#6B6B6B" }}>총 {topStyle[1]}회 사용</Text>
                </View>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: COLOR_PRIMARY_LIGHT, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="trophy" size={26} color={COLOR_PRIMARY} />
                </View>
              </View>
            </View>
          )}

          {/* 빈 상태 */}
          {!isLoading && total === 0 && (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <Ionicons name="bar-chart-outline" size={48} color={COLOR_PRIMARY} />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginTop: 16 }}>
                아직 데이터가 없어요
              </Text>
              <Text style={{ fontSize: 14, color: "#6B6B6B", marginTop: 8, textAlign: "center" }}>
                얼굴 합성을 완료하면{"\n"}통계가 표시됩니다
              </Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

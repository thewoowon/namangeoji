import type { Metadata } from "next";
import { TodayDashboard } from "@/features/today/today-dashboard";

export const metadata: Metadata = {
  title: "오늘의 포비아",
  description:
    "오늘 한국인이 가장 두려워하는 생활형 불안과 FOMO를 종합 지수와 TOP 10으로 한눈에 확인하세요.",
};

export default function TodayPage() {
  return <TodayDashboard />;
}

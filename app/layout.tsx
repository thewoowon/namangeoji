import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "나만거지지수 | 오늘 한국인의 생활형 FOMO 대시보드",
    template: "%s | 나만거지지수",
  },
  description:
    "나만거지지수는 한국 사람들이 지금 체감하는 자산, 주거, 물가, 고용, 노후, AI 관련 생활형 불안과 FOMO를 데이터로 보여주는 대시보드입니다.",
  keywords: [
    "나만거지",
    "벼락거지",
    "공포지수",
    "FOMO 지수",
    "한국 불안지수",
    "오늘의 경제 심리",
    "집값 불안",
    "주식 FOMO",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "나만거지지수",
    title: "나만거지지수 | 오늘 한국인의 생활형 FOMO 대시보드",
    description:
      "오늘 한국인은 무엇 때문에 ‘나만 뒤처진다’고 느끼는가. 생활형 불안·FOMO를 데이터로 관측합니다.",
    images: [{ url: "/api/og?type=today_summary", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="bg-bg-base text-text-primary min-h-full">
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col">
          <AppHeader />
          <main className="flex-1 pb-24 md:pb-12">{children}</main>
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}

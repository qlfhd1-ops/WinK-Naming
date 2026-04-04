import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Noto_Serif_KR } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AudioPlayer from "@/components/AudioPlayer";

const notoSerifKR = Noto_Serif_KR({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "윙크 네이밍 - AI 작명 서비스",
    template: "%s | 윙크 네이밍",
  },
  description: "자녀, 브랜드, 반려동물 이름을 AI가 설계합니다. 성씨 음운 조화, 한자 오행 획수, 놀림감 필터까지 반영한 프리미엄 네이밍 서비스.",
  keywords: ["작명", "AI 작명", "이름 짓기", "아이 이름", "브랜드명", "반려동물 이름", "윙크 네이밍", "네이밍 서비스"],
  authors: [{ name: "윙크 네이밍" }],
  creator: "윙크 네이밍",
  metadataBase: new URL("https://wink-naming.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://wink-naming.vercel.app",
    siteName: "윙크 네이밍",
    title: "윙크 네이밍 - AI 작명 서비스",
    description: "자녀, 브랜드, 반려동물 이름을 AI가 설계합니다",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "윙크 네이밍 - AI 작명 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "윙크 네이밍 - AI 작명 서비스",
    description: "자녀, 브랜드, 반려동물 이름을 AI가 설계합니다",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={notoSerifKR.variable}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
        <AudioPlayer />
        {/* Kakao SDK — NEXT_PUBLIC_KAKAO_JS_KEY 설정 시 활성화 */}
        {process.env.NEXT_PUBLIC_KAKAO_JS_KEY && (
          <>
            <Script
              src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
              integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <Script id="kakao-init" strategy="afterInteractive">
              {`
                window.__kakaoKey = "${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}";
                (function tryInit() {
                  if (window.Kakao && !window.Kakao.isInitialized()) {
                    window.Kakao.init(window.__kakaoKey);
                  } else if (!window.Kakao) {
                    setTimeout(tryInit, 200);
                  }
                })();
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

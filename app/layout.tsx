import "./globals.css";
import type { Metadata } from "next";
import { Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import AudioPlayer from "@/components/AudioPlayer";
import { SERVICE_PRE_LAUNCH } from "@/lib/pricing";

const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID || "GTM-MWLC54CZ").trim();

const notoSerifKR = Noto_Serif_KR({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "윙크 네이밍 - 한국식 작명 서비스 | Wink Naming",
    template: "%s | 윙크 네이밍",
  },
  description:
    "나의 한국이름 개명, 활동명, 아이 이름, 반려동물 이름을 설계해보세요. Design your Korean name — renaming, stage names, baby names, and pet names.",
  keywords: ["작명", "AI 작명", "이름 짓기", "아이 이름", "브랜드명", "반려동물 이름", "윙크 네이밍", "네이밍 서비스", "Korean name", "Korean naming service"],
  authors: [{ name: "윙크 네이밍" }],
  creator: "윙크 네이밍",
  metadataBase: new URL("https://wink-naming.com"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://wink-naming.com",
    siteName: "윙크 네이밍",
    title: "윙크 네이밍 - 한국식 작명 서비스 | Wink Naming",
    description:
      "나의 한국이름 개명, 활동명, 아이 이름, 반려동물 이름을 설계해보세요. Design your Korean name — renaming, stage names, baby names, and pet names.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "윙크 네이밍 - 한국식 작명 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "윙크 네이밍 - 한국식 작명 서비스 | Wink Naming",
    description:
      "나의 한국이름 개명, 활동명, 아이 이름, 반려동물 이름을 설계해보세요. Design your Korean name — renaming, stage names, baby names, and pet names.",
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
      <head>
        {/* Google Tag Manager — 공식 설치 가이드 (서버 렌더링 HTML에 정적 포함) */}
        <script
          id="gtm-init"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        {/* 로그인 링크가 어떤 페이지로 돌아오든(#access_token 해시 포함) /auth/callback 으로 모아 세션을 저장한다.
            브라우저 Supabase 클라이언트(PKCE 고정)는 이 해시를 거부해 로그인이 반복되기 때문. hydration 전에 실행. */}
        <script
          id="auth-hash-redirect"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=location.hash;if(h&&h.indexOf('access_token=')>-1&&h.indexOf('refresh_token=')>-1&&location.pathname.indexOf('/auth/callback')!==0){var m=location.pathname.match(/^\\/(ko|en|ja|zh|es|ru|fr|ar|hi)(\\/|$)/);var l=m?m[1]:'';location.replace('/auth/callback?next='+encodeURIComponent(location.pathname+location.search)+(l?'&lang='+l:'')+h);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${notoSerifKR.variable} ${notoSansKR.variable}`}>
        {/* Google Tag Manager (noscript) — body 시작 직후 */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {SERVICE_PRE_LAUNCH && (
          <div
            style={{
              width: "100%",
              padding: "8px 16px",
              background: "#1a2140",
              color: "rgba(230,238,255,0.9)",
              fontSize: 12,
              fontWeight: 600,
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            서비스 준비 중 · Pre-launch Beta
          </div>
        )}
        {children}
        <AudioPlayer />
      </body>
    </html>
  );
}

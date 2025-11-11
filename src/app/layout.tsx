import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";
import { ClarityAnalytics } from "@/components/analytics/clarity-analytics";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { WebApplicationJsonLd } from "@/components/seo/web-application-jsonld";
import { OrganizationJsonLd } from "@/components/seo/organization-jsonld";
import { WebSiteJsonLd } from "@/components/seo/website-jsonld";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "iLovePDF | PDF를 즐겨 쓰시는 분들을 위한 온라인 PDF 툴",
    template: "%s | iLovePDF",
  },
  description:
    "iLovePDF는 PDF 파일 작업을 위한 온라인 서비스로 완전히 무료이며 사용하기 쉽습니다. PDF 병합, PDF 분리, PDF 압축, 오피스 파일에서 PDF로, PDF에서 JPG로 변환 등!",
  keywords: [
    "PDF 병합",
    "PDF 합치기",
    "PDF 분할",
    "PDF 압축",
    "PDF 편집",
    "PDF 변환",
    "Word PDF 변환",
    "JPG PDF 변환",
    "PDF 도구",
    "무료 PDF",
    "온라인 PDF",
  ],
  authors: [{ name: "iLovePDF" }],
  creator: "iLovePDF",
  publisher: "iLovePDF",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  applicationName: "iLovePDF",
  appleWebApp: {
    capable: true,
    title: "iLovePDF",
    statusBarStyle: "default",
  },
  appLinks: {
    ios: {
      app_store_id: "1207332399",
      url: "https://apps.apple.com/app/ilovepdf/id1207332399",
    },
    android: {
      package: "com.ilovepdf.www",
      url: "https://play.google.com/store/apps/details?id=com.ilovepdf.www",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "iLovePDF",
    title: "iLovePDF | PDF를 즐겨 쓰시는 분들을 위한 온라인 PDF 툴",
    description:
      "iLovePDF는 PDF 파일 작업을 위한 온라인 서비스로 완전히 무료이며 사용하기 쉽습니다. PDF 병합, PDF 분리, PDF 압축, 오피스 파일에서 PDF로, PDF에서 JPG로 변환 등!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "iLovePDF - PDF를 즐겨 쓰시는 분들을 위한 온라인 PDF 툴",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ilovepdf_com",
    creator: "@ilovepdf_com",
    title: "iLovePDF | PDF를 즐겨 쓰시는 분들을 위한 온라인 PDF 툴",
    description:
      "iLovePDF는 PDF 파일 작업을 위한 온라인 서비스로 완전히 무료이며 사용하기 쉽습니다. PDF 병합, PDF 분리, PDF 압축, 오피스 파일에서 PDF로, PDF에서 JPG로 변환 등!",
    images: ["/twitter-image.png"],
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
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <WebApplicationJsonLd />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body
        className={`${notoSansKR.variable} ${geistMono.variable} antialiased`}
      >
        <ClarityAnalytics />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}

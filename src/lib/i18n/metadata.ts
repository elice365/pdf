import type { Metadata } from "next";
import type { Locale } from "./config";
import { i18n } from "./config";
import { getTranslation } from "./locales";

const localeMap: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  ru: "ru_RU",
  de: "de_DE",
  fr: "fr_FR",
  hi: "hi_IN",
  bn: "bn_BD",
};

export function generateLocalizedMetadata(locale: Locale): Metadata {
  const t = getTranslation(locale);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";
  const localePath = locale === i18n.defaultLocale ? "" : `/${locale}`;

  // Generate hreflang alternates
  const languages: Record<string, string> = {};
  i18n.locales.forEach((loc) => {
    const path = loc === i18n.defaultLocale ? "" : `/${loc}`;
    languages[loc] = `${baseUrl}${path}`;
  });
  // Add x-default for international fallback
  languages["x-default"] =
    `${baseUrl}/${i18n.defaultLocale === "ko" ? "en" : i18n.defaultLocale}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t.seo.title,
      template: `%s | iLovePDF`,
    },
    description: t.seo.description,
    keywords: [...t.seo.keywords],
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
      locale: localeMap[locale],
      url: `${baseUrl}${localePath}`,
      siteName: "iLovePDF",
      title: t.seo.title,
      description: t.seo.description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t.seo.title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@ilovepdf_com",
      creator: "@ilovepdf_com",
      title: t.seo.title,
      description: t.seo.description,
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
      canonical: `${baseUrl}${localePath}`,
      languages,
    },
    verification: {
      google: "your-google-verification-code",
    },
  };
}

interface ToolMetadata {
  toolKey: keyof typeof import("./locales/ko").ko.tools;
  path: string;
  locale: Locale;
}

export function generateToolMetadata(params: ToolMetadata): Metadata {
  const t = getTranslation(params.locale);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";
  const localePath =
    params.locale === i18n.defaultLocale ? "" : `/${params.locale}`;

  const toolName = t.tools[params.toolKey];
  const toolDescription =
    (t.toolDescriptions as Record<string, string>)[params.toolKey] ||
    t.seo.description;
  const fullTitle = `${toolName} | iLovePDF`;

  // Generate hreflang alternates for this tool
  const languages: Record<string, string> = {};
  i18n.locales.forEach((loc) => {
    const path = loc === i18n.defaultLocale ? "" : `/${loc}`;
    languages[loc] = `${baseUrl}${path}${params.path}`;
  });

  return {
    title: fullTitle,
    description: toolDescription,
    keywords: [toolName, ...t.seo.keywords],
    openGraph: {
      title: fullTitle,
      description: toolDescription,
      url: `${baseUrl}${localePath}${params.path}`,
      siteName: "iLovePDF",
      type: "website",
      locale: localeMap[params.locale],
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: fullTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@ilovepdf_com",
      creator: "@ilovepdf_com",
      title: fullTitle,
      description: toolDescription,
      images: ["/twitter-image.png"],
    },
    alternates: {
      canonical: `${baseUrl}${localePath}${params.path}`,
      languages,
    },
  };
}

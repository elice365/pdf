import { MetadataRoute } from "next";
import { tools } from "@/components/tools/tools-data";
import { i18n } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";
  const sitemap: MetadataRoute.Sitemap = [];

  // 각 언어별로 URL 생성
  i18n.locales.forEach((locale) => {
    const localePath = locale === i18n.defaultLocale ? "" : `/${locale}`;

    // 홈페이지
    sitemap.push({
      url: `${baseUrl}${localePath}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: locale === i18n.defaultLocale ? 1.0 : 0.9,
      alternates: {
        languages: Object.fromEntries(
          i18n.locales.map((loc) => [
            loc,
            `${baseUrl}${loc === i18n.defaultLocale ? "" : `/${loc}`}`,
          ])
        ),
      },
    });

    // 도구 페이지들
    tools.forEach((tool) => {
      sitemap.push({
        url: `${baseUrl}${localePath}${tool.href}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: locale === i18n.defaultLocale ? 0.8 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            i18n.locales.map((loc) => [
              loc,
              `${baseUrl}${loc === i18n.defaultLocale ? "" : `/${loc}`}${tool.href}`,
            ])
          ),
        },
      });
    });
  });

  return sitemap;
}

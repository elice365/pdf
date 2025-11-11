import type { Locale } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/locales";

interface BreadcrumbJsonLdProps {
  locale: Locale;
  toolKey: keyof typeof import("@/lib/i18n/locales/ko").ko.tools;
  toolPath: string;
}

export function BreadcrumbJsonLd({ locale, toolKey, toolPath }: BreadcrumbJsonLdProps) {
  const t = getTranslation(locale);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";
  const localePath = locale === "ko" ? "" : `/${locale}`;

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${baseUrl}${localePath}`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t.tools[toolKey],
        "item": `${baseUrl}${localePath}${toolPath}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
    />
  );
}

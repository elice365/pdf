export function WebApplicationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "iLovePDF",
    "description": "무료 온라인 PDF 도구 - PDF 병합, 분할, 압축, 변환 등 모든 PDF 작업을 한 곳에서",
    "url": baseUrl,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW",
      "availability": "https://schema.org/InStock",
    },
    "featureList": [
      "PDF 병합",
      "PDF 분할",
      "PDF 압축",
      "PDF 변환",
      "PDF 편집",
      "PDF 보호",
      "PDF 회전",
      "Word to PDF",
      "PDF to JPG",
    ],
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "permissions": "browser",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

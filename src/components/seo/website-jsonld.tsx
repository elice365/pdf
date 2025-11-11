export function WebSiteJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "iLovePDF",
    url: baseUrl,
    description: "무료 온라인 PDF 도구 - PDF 병합, 분할, 압축, 변환",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["ko", "en", "ja", "ru", "de", "fr", "hi", "bn"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

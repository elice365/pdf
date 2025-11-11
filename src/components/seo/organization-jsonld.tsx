export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "iLovePDF",
    "url": baseUrl,
    "logo": `${baseUrl}/android-chrome-512x512.png`,
    "description": "무료 온라인 PDF 도구를 제공하는 웹 애플리케이션 서비스",
    "foundingDate": "2010",
    "sameAs": [
      "https://twitter.com/ilovepdf_com",
      "https://www.facebook.com/ilovepdf",
      "https://www.linkedin.com/company/ilovepdf",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["Korean", "English", "Japanese", "Russian", "German", "French", "Hindi", "Bengali"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

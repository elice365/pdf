import { FeaturesSection } from "@/components/features/features-section";
import { Footer } from "@/components/footer/footer";
import { Header } from "@/components/header/header";
import { Hero } from "@/components/hero/hero";
import { ToolsSection } from "@/components/tools/tools-section";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://www.ilovepdf.com/#webapp",
        name: "iLovePDF",
        url: "https://www.ilovepdf.com",
        description:
          "PDF 파일 작업을 위한 온라인 서비스로 완전히 무료이며 사용하기 쉽습니다. PDF 병합, PDF 분리, PDF 압축, 오피스 파일에서 PDF로, PDF에서 JPG로 변환 등!",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
        },
        featureList: [
          "PDF 합치기",
          "PDF 나누기",
          "PDF 압축",
          "PDF 회전",
          "PDF 편집",
          "PDF 보호",
          "Word를 PDF로",
          "PDF를 JPG로",
        ],
        browserRequirements: "Requires JavaScript. Requires HTML5.",
      },
      {
        "@type": "Organization",
        "@id": "https://www.ilovepdf.com/#organization",
        name: "iLovePDF",
        url: "https://www.ilovepdf.com",
        logo: {
          "@type": "ImageObject",
          url: "https://www.ilovepdf.com/img/ilovepdf-logo.png",
        },
        sameAs: [
          "https://twitter.com/ilovepdf_com",
          "https://www.facebook.com/ilovepdfcom",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.ilovepdf.com/#website",
        url: "https://www.ilovepdf.com",
        name: "iLovePDF",
        publisher: {
          "@id": "https://www.ilovepdf.com/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.ilovepdf.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main>
          <Hero />

          {/* Tools Section */}
          <ToolsSection />

          {/* Features Section */}
          <FeaturesSection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

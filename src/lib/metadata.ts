import { Metadata } from "next";

interface ToolMetadata {
  title: string;
  description: string;
  keywords: string[];
  path: string;
}

export function generateToolMetadata(tool: ToolMetadata): Metadata {
  const fullTitle = `${tool.title} | iLovePDF`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";
  const url = `${baseUrl}${tool.path}`;

  return {
    title: fullTitle,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: fullTitle,
      description: tool.description,
      url: url,
      siteName: "iLovePDF",
      type: "website",
      locale: "ko_KR",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: tool.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@ilovepdf_com",
      creator: "@ilovepdf_com",
      title: fullTitle,
      description: tool.description,
      images: ["/twitter-image.png"],
    },
    alternates: {
      canonical: tool.path,
    },
  };
}

// 주요 도구 메타데이터
export const toolsMetadata: Record<string, ToolMetadata> = {
  merge: {
    title: "PDF 합치기",
    description:
      "여러 PDF 파일을 하나로 병합합니다. 무료 온라인 PDF 합치기 도구로 간편하게 PDF를 결합하세요.",
    keywords: ["PDF 합치기", "PDF 병합", "PDF 결합", "무료 PDF", "온라인 PDF"],
    path: "/pdf/merge",
  },
  split: {
    title: "PDF 나누기",
    description:
      "PDF를 여러 파일로 분할합니다. 무료 온라인 PDF 나누기 도구로 원하는 페이지만 추출하세요.",
    keywords: ["PDF 나누기", "PDF 분할", "PDF 추출", "무료 PDF", "온라인 PDF"],
    path: "/pdf/split",
  },
  compress: {
    title: "PDF 압축",
    description:
      "PDF 파일 크기를 줄입니다. 무료 온라인 PDF 압축 도구로 품질 저하 없이 파일 크기를 최적화하세요.",
    keywords: ["PDF 압축", "PDF 용량 줄이기", "PDF 최적화", "무료 PDF", "온라인 PDF"],
    path: "/pdf/compress",
  },
  rotate: {
    title: "PDF 회전",
    description:
      "PDF 페이지를 회전합니다. 무료 온라인 PDF 회전 도구로 페이지 방향을 조정하세요.",
    keywords: ["PDF 회전", "PDF 방향", "PDF 페이지 회전", "무료 PDF", "온라인 PDF"],
    path: "/pdf/rotate",
  },
  edit: {
    title: "PDF 편집",
    description:
      "PDF 내용을 편집합니다. 무료 온라인 PDF 편집 도구로 텍스트와 이미지를 수정하세요.",
    keywords: ["PDF 편집", "PDF 수정", "PDF 텍스트 편집", "무료 PDF", "온라인 PDF"],
    path: "/pdf/edit",
  },
  protect: {
    title: "PDF 보호",
    description:
      "암호로 PDF를 보호합니다. 무료 온라인 PDF 보호 도구로 파일에 비밀번호를 설정하세요.",
    keywords: [
      "PDF 보호",
      "PDF 암호",
      "PDF 비밀번호",
      "PDF 보안",
      "무료 PDF",
      "온라인 PDF",
    ],
    path: "/pdf/protect",
  },
  wordToPdf: {
    title: "Word를 PDF로",
    description:
      "Word 파일을 PDF로 변환합니다. 무료 온라인 Word to PDF 변환 도구를 사용하세요.",
    keywords: [
      "Word PDF 변환",
      "DOCX PDF",
      "워드 PDF",
      "무료 PDF 변환",
      "온라인 PDF",
    ],
    path: "/pdf/convert/word-to-pdf",
  },
  pdfToJpg: {
    title: "PDF를 JPG로",
    description:
      "PDF를 이미지로 변환합니다. 무료 온라인 PDF to JPG 변환 도구로 각 페이지를 이미지로 추출하세요.",
    keywords: [
      "PDF JPG 변환",
      "PDF 이미지",
      "PDF to JPG",
      "무료 PDF 변환",
      "온라인 PDF",
    ],
    path: "/pdf/convert/pdf-to-jpg",
  },
};

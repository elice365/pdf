import type { Metadata } from "next";

interface ToolMetadata {
  title: string;
  description: string;
  keywords: string[];
  path: string;
}

export function generateToolMetadata(tool: ToolMetadata): Metadata {
  const fullTitle = `${tool.title} | iLovePDF`;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.ilovepdf.com";
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
    keywords: [
      "PDF 압축",
      "PDF 용량 줄이기",
      "PDF 최적화",
      "무료 PDF",
      "온라인 PDF",
    ],
    path: "/pdf/compress",
  },
  rotate: {
    title: "PDF 회전",
    description:
      "PDF 페이지를 회전합니다. 무료 온라인 PDF 회전 도구로 페이지 방향을 조정하세요.",
    keywords: [
      "PDF 회전",
      "PDF 방향",
      "PDF 페이지 회전",
      "무료 PDF",
      "온라인 PDF",
    ],
    path: "/pdf/rotate",
  },
  edit: {
    title: "PDF 편집",
    description:
      "PDF 내용을 편집합니다. 무료 온라인 PDF 편집 도구로 텍스트와 이미지를 수정하세요.",
    keywords: [
      "PDF 편집",
      "PDF 수정",
      "PDF 텍스트 편집",
      "무료 PDF",
      "온라인 PDF",
    ],
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
  // 새로 추가된 도구들
  form: {
    title: "PDF 양식 채우기",
    description:
      "PDF 양식의 필드를 자동으로 감지하고 채우세요. AcroForm 필드 지원, 텍스트 필드, 체크박스, 라디오 버튼을 간편하게 작성할 수 있습니다. 무료 온라인 PDF 양식 작성 도구.",
    keywords: [
      "PDF 양식 채우기",
      "PDF 양식 작성",
      "AcroForm",
      "PDF 필드 채우기",
      "온라인 양식 작성",
      "PDF 폼",
      "양식 자동 감지",
      "무료 PDF",
      "온라인 PDF",
    ],
    path: "/pdf/form",
  },
  htmlToPdf: {
    title: "HTML을 PDF로 변환",
    description:
      "HTML 코드를 고품질 PDF 문서로 변환하세요. 웹 페이지, HTML 파일을 PDF로 저장할 수 있습니다. 브라우저 기반 변환으로 빠르고 안전합니다. 무료 온라인 HTML PDF 변환기.",
    keywords: [
      "HTML PDF 변환",
      "HTML을 PDF로",
      "웹페이지 PDF",
      "HTML PDF 저장",
      "온라인 HTML 변환기",
      "웹페이지 저장",
      "무료 PDF 변환",
      "온라인 PDF",
    ],
    path: "/pdf/convert/html-to-pdf",
  },
  pdfToWord: {
    title: "PDF를 Word로 변환",
    description:
      "PDF 파일을 편집 가능한 Word 문서(DOCX)로 변환하세요. 텍스트, 단락, 서식을 유지하며 변환합니다. 브라우저에서 바로 처리되어 안전합니다. 무료 온라인 PDF Word 변환기.",
    keywords: [
      "PDF Word 변환",
      "PDF를 Word로",
      "PDF DOCX 변환",
      "PDF 편집",
      "PDF 문서 변환",
      "온라인 PDF 변환기",
      "무료 PDF 변환",
      "온라인 PDF",
    ],
    path: "/pdf/convert/word",
  },
  pdfToExcel: {
    title: "PDF를 Excel로 변환",
    description:
      "PDF 파일을 Excel 스프레드시트(XLSX)로 변환하세요. 표와 데이터를 자동으로 감지하여 편집 가능한 엑셀 파일로 만듭니다. 무료 온라인 PDF Excel 변환기.",
    keywords: [
      "PDF Excel 변환",
      "PDF를 Excel로",
      "PDF XLSX 변환",
      "PDF 표 추출",
      "PDF 데이터 변환",
      "온라인 PDF 변환기",
      "무료 PDF 변환",
      "온라인 PDF",
    ],
    path: "/pdf/convert/pdf-to-excel",
  },
  pdfToPowerpoint: {
    title: "PDF를 PowerPoint로 변환",
    description:
      "PDF 파일을 PowerPoint 프레젠테이션(PPTX)으로 변환하세요. 각 페이지가 슬라이드로 변환되어 편집 가능한 PPT 파일을 만들 수 있습니다. 무료 온라인 PDF PowerPoint 변환기.",
    keywords: [
      "PDF PowerPoint 변환",
      "PDF를 PPT로",
      "PDF PPTX 변환",
      "PDF 슬라이드 변환",
      "PDF 프레젠테이션",
      "온라인 PDF 변환기",
      "무료 PDF 변환",
      "온라인 PDF",
    ],
    path: "/pdf/convert/pdf-to-powerpoint",
  },
  ocr: {
    title: "PDF OCR - 이미지 PDF를 텍스트로 변환",
    description:
      "스캔한 PDF나 이미지 PDF를 검색 가능한 텍스트로 변환하세요. 한국어, 영어, 일본어, 중국어 등 다국어 OCR 지원. Tesseract.js 기반의 정확한 문자 인식. 무료 온라인 PDF OCR 도구.",
    keywords: [
      "PDF OCR",
      "PDF 텍스트 인식",
      "스캔 PDF 변환",
      "이미지 PDF 텍스트",
      "한글 OCR",
      "다국어 OCR",
      "문자 인식",
      "무료 PDF",
      "온라인 PDF",
    ],
    path: "/pdf/ocr",
  },
  sign: {
    title: "PDF 전자서명 - 디지털 서명 추가",
    description:
      "PDF 문서에 전자서명을 추가하세요. 마우스나 터치로 서명을 그려 PDF에 삽입할 수 있습니다. 계약서, 동의서 등에 간편하게 서명하세요. 무료 온라인 PDF 서명 도구.",
    keywords: [
      "PDF 전자서명",
      "PDF 서명",
      "디지털 서명",
      "PDF 사인",
      "온라인 서명",
      "계약서 서명",
      "문서 서명",
      "무료 PDF",
      "온라인 PDF",
    ],
    path: "/pdf/sign",
  },
};

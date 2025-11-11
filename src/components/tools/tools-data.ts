export type ToolCategory =
  | "all"
  | "organize"
  | "optimize"
  | "convert"
  | "edit"
  | "security"
  | "other";

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  href: string;
  color: string;
}

export const tools: Tool[] = [
  // PDF 구성 (organize) - iLovePDF 스타일 개별 색상
  {
    id: "merge",
    name: "PDF 합치기",
    category: "organize",
    href: "/pdf/merge",
    color: "#E93C3C", // 빨강 (iLovePDF merge)
  },
  {
    id: "split",
    name: "PDF 나누기",
    category: "organize",
    href: "/pdf/split",
    color: "#F56565", // 주황빨강 (iLovePDF split)
  },
  {
    id: "rotate",
    name: "PDF 회전",
    category: "organize",
    href: "/pdf/rotate",
    color: "#ED8936", // 주황 (rotate)
  },
  {
    id: "organize_pdf",
    name: "PDF 정리",
    category: "organize",
    href: "/pdf/organize",
    color: "#F56565", // 주황빨강
  },

  // PDF 최적화 (optimize) - 초록 계열
  {
    id: "compress",
    name: "PDF 압축",
    category: "optimize",
    href: "/pdf/compress",
    color: "#48BB78", // 초록 (iLovePDF compress)
  },
  {
    id: "repair",
    name: "PDF 복구",
    category: "optimize",
    href: "/pdf/repair",
    color: "#38B2AC", // 청록
  },
  {
    id: "ocr",
    name: "OCR PDF",
    category: "optimize",
    href: "/pdf/ocr",
    color: "#48BB78", // 초록
  },

  // PDF 변환 (convert) - 파랑/노랑 계열 (도구별 차별화)
  {
    id: "pdf_to_word",
    name: "PDF를 Word로",
    category: "convert",
    href: "/pdf/convert/word",
    color: "#4299E1", // 파랑 (iLovePDF Word)
  },
  {
    id: "pdf_to_excel",
    name: "PDF를 Excel로",
    category: "convert",
    href: "/pdf/convert/pdf-to-excel",
    color: "#38B2AC", // 녹색 (iLovePDF Excel)
  },
  {
    id: "pdf_to_ppt",
    name: "PDF를 PPT로",
    category: "convert",
    href: "/pdf/convert/pdf-to-powerpoint",
    color: "#ED8936", // 주황 (iLovePDF PPT)
  },
  {
    id: "pdf_to_jpg",
    name: "PDF를 JPG로",
    category: "convert",
    href: "/pdf/convert/pdf-to-jpg",
    color: "#ECC94B", // 노랑 (iLovePDF JPG)
  },
  {
    id: "word_to_pdf",
    name: "Word를 PDF로",
    category: "convert",
    href: "/pdf/convert/word-to-pdf",
    color: "#4299E1", // 파랑
  },
  {
    id: "excel_to_pdf",
    name: "Excel을 PDF로",
    category: "convert",
    href: "/pdf/convert/excel-to-pdf",
    color: "#38B2AC", // 녹색
  },
  {
    id: "ppt_to_pdf",
    name: "PPT를 PDF로",
    category: "convert",
    href: "/pdf/convert/powerpoint-to-pdf",
    color: "#ED8936", // 주황
  },
  {
    id: "jpg_to_pdf",
    name: "JPG를 PDF로",
    category: "convert",
    href: "/pdf/convert/jpg-to-pdf",
    color: "#ECC94B", // 노랑
  },
  {
    id: "html_to_pdf",
    name: "HTML을 PDF로",
    category: "convert",
    href: "/pdf/convert/html-to-pdf",
    color: "#ECC94B", // 노랑
  },
  {
    id: "pdf_to_pdfa",
    name: "PDF를 PDF/A로",
    category: "convert",
    href: "/pdf/pdfa",
    color: "#4299E1", // 파랑
  },

  // PDF 편집 (edit) - 보라 계열
  {
    id: "edit_pdf",
    name: "PDF 편집",
    category: "edit",
    href: "/pdf/edit",
    color: "#9F7AEA", // 보라 (iLovePDF edit)
  },
  {
    id: "add_page_numbers",
    name: "페이지 번호 추가",
    category: "edit",
    href: "/pdf/page-number",
    color: "#9F7AEA", // 보라
  },
  {
    id: "watermark",
    name: "워터마크 추가",
    category: "edit",
    href: "/pdf/watermark",
    color: "#B794F4", // 밝은 보라
  },
  {
    id: "redact",
    name: "PDF 검열",
    category: "edit",
    href: "/pdf/redact",
    color: "#9F7AEA", // 보라
  },
  {
    id: "crop",
    name: "PDF 자르기",
    category: "edit",
    href: "/pdf/crop",
    color: "#B794F4", // 밝은 보라
  },

  // PDF 보안 (security) - 파랑/보라 계열
  {
    id: "protect",
    name: "PDF 보호",
    category: "security",
    href: "/pdf/protect",
    color: "#5A67D8", // 진한 파랑
  },
  {
    id: "unlock",
    name: "PDF 잠금 해제",
    category: "security",
    href: "/pdf/unlock",
    color: "#5A67D8", // 진한 파랑
  },
  {
    id: "sign",
    name: "PDF 서명",
    category: "security",
    href: "/pdf/sign",
    color: "#667EEA", // 파랑보라
  },
  {
    id: "fill_form",
    name: "양식 채우기",
    category: "edit",
    href: "/pdf/form",
    color: "#9F7AEA", // 보라
  },

  // 기타 도구 (other)
  {
    id: "compare",
    name: "PDF 비교",
    category: "other",
    href: "/pdf/compare",
    color: "#FC8181", // 연한 빨강 (새 기능)
  },
  {
    id: "scan",
    name: "문서 스캔",
    category: "other",
    href: "/pdf/scan",
    color: "#68D391", // 밝은 초록
  },
];

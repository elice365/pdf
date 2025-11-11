import type { Locale } from "./i18n/config";
import { getTranslation } from "./i18n/locales";
import type { Tool, ToolCategory } from "@/components/tools/tools-data";

// Tool ID to translation key mapping
const toolKeyMap: Record<string, keyof ReturnType<typeof getTranslation>["tools"]> = {
  merge: "merge",
  split: "split",
  compress: "compress",
  rotate: "rotate",
  organize_pdf: "organize",
  repair: "repair",
  ocr: "ocr",
  pdf_to_word: "pdfToWord",
  pdf_to_excel: "pdfToExcel",
  pdf_to_ppt: "pdfToPpt",
  pdf_to_jpg: "pdfToJpg",
  word_to_pdf: "wordToPdf",
  excel_to_pdf: "excelToPdf",
  ppt_to_pdf: "pptToPdf",
  jpg_to_pdf: "jpgToPdf",
  html_to_pdf: "htmlToPdf",
  pdf_to_pdfa: "pdfToPdfA",
  pdf_to_png: "pdfToPng",
  png_to_pdf: "pngToPdf",
  edit_pdf: "edit",
  add_page_numbers: "pageNumber",
  watermark: "watermark",
  redact: "redact",
  crop: "crop",
  protect: "protect",
  unlock: "unlock",
  sign: "sign",
  fill_form: "fillForm",
  compare: "compare",
  scan: "scan",
  add_text: "addText",
  extract_text: "extractText",
  extract_images: "extractImages",
  resize: "resize",
  metadata: "metadata",
};

export function getLocalizedTools(locale: Locale): Tool[] {
  const t = getTranslation(locale);

  // Tool definitions with static data (category, href, color)
  const toolDefinitions: Omit<Tool, "name">[] = [
    // PDF 구성 (organize)
    {
      id: "merge",
      category: "organize",
      href: "/pdf/merge",
      color: "#E93C3C",
    },
    {
      id: "split",
      category: "organize",
      href: "/pdf/split",
      color: "#F56565",
    },
    {
      id: "rotate",
      category: "organize",
      href: "/pdf/rotate",
      color: "#ED8936",
    },
    {
      id: "organize_pdf",
      category: "organize",
      href: "/pdf/organize",
      color: "#F56565",
    },

    // PDF 최적화 (optimize)
    {
      id: "compress",
      category: "optimize",
      href: "/pdf/compress",
      color: "#48BB78",
    },
    {
      id: "repair",
      category: "optimize",
      href: "/pdf/repair",
      color: "#38B2AC",
    },
    {
      id: "ocr",
      category: "optimize",
      href: "/pdf/ocr",
      color: "#48BB78",
    },

    // PDF 변환 (convert)
    {
      id: "pdf_to_word",
      category: "convert",
      href: "/pdf/convert/word",
      color: "#4299E1",
    },
    {
      id: "pdf_to_excel",
      category: "convert",
      href: "/pdf/convert/pdf-to-excel",
      color: "#38B2AC",
    },
    {
      id: "pdf_to_ppt",
      category: "convert",
      href: "/pdf/convert/pdf-to-powerpoint",
      color: "#ED8936",
    },
    {
      id: "pdf_to_jpg",
      category: "convert",
      href: "/pdf/convert/pdf-to-jpg",
      color: "#ECC94B",
    },
    {
      id: "word_to_pdf",
      category: "convert",
      href: "/pdf/convert/word-to-pdf",
      color: "#4299E1",
    },
    {
      id: "excel_to_pdf",
      category: "convert",
      href: "/pdf/convert/excel-to-pdf",
      color: "#38B2AC",
    },
    {
      id: "ppt_to_pdf",
      category: "convert",
      href: "/pdf/convert/powerpoint-to-pdf",
      color: "#ED8936",
    },
    {
      id: "jpg_to_pdf",
      category: "convert",
      href: "/pdf/convert/jpg-to-pdf",
      color: "#ECC94B",
    },
    {
      id: "html_to_pdf",
      category: "convert",
      href: "/pdf/convert/html-to-pdf",
      color: "#ECC94B",
    },
    {
      id: "pdf_to_pdfa",
      category: "convert",
      href: "/pdf/pdfa",
      color: "#4299E1",
    },
    {
      id: "pdf_to_png",
      category: "convert",
      href: "/pdf/convert/pdf-to-png",
      color: "#ECC94B",
    },
    {
      id: "png_to_pdf",
      category: "convert",
      href: "/pdf/convert/png-to-pdf",
      color: "#ECC94B",
    },

    // PDF 편집 (edit)
    {
      id: "edit_pdf",
      category: "edit",
      href: "/pdf/edit",
      color: "#9F7AEA",
    },
    {
      id: "add_page_numbers",
      category: "edit",
      href: "/pdf/page-number",
      color: "#9F7AEA",
    },
    {
      id: "watermark",
      category: "edit",
      href: "/pdf/watermark",
      color: "#B794F4",
    },
    {
      id: "redact",
      category: "edit",
      href: "/pdf/redact",
      color: "#9F7AEA",
    },
    {
      id: "crop",
      category: "edit",
      href: "/pdf/crop",
      color: "#B794F4",
    },
    {
      id: "fill_form",
      category: "edit",
      href: "/pdf/form",
      color: "#9F7AEA",
    },
    {
      id: "add_text",
      category: "edit",
      href: "/pdf/add-text",
      color: "#9F7AEA",
    },
    {
      id: "resize",
      category: "edit",
      href: "/pdf/resize",
      color: "#B794F4",
    },
    {
      id: "metadata",
      category: "edit",
      href: "/pdf/metadata",
      color: "#9F7AEA",
    },
    {
      id: "extract_text",
      category: "edit",
      href: "/pdf/extract-text",
      color: "#B794F4",
    },
    {
      id: "extract_images",
      category: "edit",
      href: "/pdf/extract-images",
      color: "#B794F4",
    },

    // PDF 보안 (security)
    {
      id: "protect",
      category: "security",
      href: "/pdf/protect",
      color: "#5A67D8",
    },
    {
      id: "unlock",
      category: "security",
      href: "/pdf/unlock",
      color: "#5A67D8",
    },
    {
      id: "sign",
      category: "security",
      href: "/pdf/sign",
      color: "#667EEA",
    },

    // 기타 도구 (other)
    {
      id: "compare",
      category: "other",
      href: "/pdf/compare",
      color: "#FC8181",
    },
    {
      id: "scan",
      category: "other",
      href: "/pdf/scan",
      color: "#68D391",
    },
  ];

  // Add localized names to each tool
  return toolDefinitions.map((tool) => ({
    ...tool,
    name: t.tools[toolKeyMap[tool.id] as keyof typeof t.tools] || tool.id,
  }));
}

export function getLocalizedCategories(locale: Locale) {
  const t = getTranslation(locale);
  return t.categories;
}

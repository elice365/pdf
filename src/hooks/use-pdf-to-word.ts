import { useState, useCallback } from "react";
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from "docx";
import * as pdfjsLib from "pdfjs-dist";
import { usePdfTool } from "./use-pdf-tool";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export type ConversionQuality = "standard" | "high";

/**
 * Custom hook for PDF to Word conversion
 */
export function usePdfToWord() {
  const tool = usePdfTool({ operationName: "PDF to Word 변환" });
  const [quality, setQuality] = useState<ConversionQuality>("high");
  const [wordBlob, setWordBlob] = useState<Blob | null>(null);
  const [completed, setCompleted] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const convert = useCallback(async () => {
    if (!tool.validateFiles()) return;

    try {
      tool.startProcessing("PDF to Word 변환");
      tool.updateProgress(10);

      const arrayBuffer = await tool.firstFile.arrayBuffer();
      tool.updateProgress(20);

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      tool.updateProgress(30);

      const totalPages = pdfDoc.numPages;
      setPageCount(totalPages);
      const paragraphs: Paragraph[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        tool.updateProgress(30 + (pageNum / totalPages) * 50);

        // 페이지 헤더
        paragraphs.push(
          new Paragraph({
            text: `--- 페이지 ${pageNum} ---`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        // 텍스트 추출 및 라인 그룹화
        const lines: string[] = [];
        let currentLine = "";
        let lastY = 0;

        for (const item of textContent.items) {
          if ("str" in item && "transform" in item) {
            const y = item.transform[5];
            const text = item.str;

            if (lastY !== 0 && Math.abs(y - lastY) > 5) {
              if (currentLine.trim()) {
                lines.push(currentLine.trim());
              }
              currentLine = text;
            } else {
              currentLine = currentLine ? `${currentLine} ${text}` : text;
            }
            lastY = y;
          }
        }

        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }

        // 각 라인을 단락으로 추가
        for (const line of lines) {
          if (line.trim()) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    font: quality === "high" ? "맑은 고딕" : undefined,
                  }),
                ],
              })
            );
          }
        }
      }

      tool.updateProgress(85);

      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      setWordBlob(blob);
      setCompleted(true);

      tool.updateProgress(100);
    } catch (error) {
      console.error("PDF to Word 변환 오류:", error);
      tool.setError("PDF to Word 변환 중 오류가 발생했습니다.");
    } finally {
      tool.finishProcessing();
    }
  }, [tool, quality]);

  const reset = useCallback(() => {
    setWordBlob(null);
    setCompleted(false);
    setPageCount(0);
    tool.reset();
  }, [tool]);

  return {
    ...tool,
    quality,
    setQuality,
    wordBlob,
    completed,
    pageCount,
    convert,
    reset,
  };
}

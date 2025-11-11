import { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import { usePdfTool } from "./use-pdf-tool";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Custom hook for PDF to Excel conversion
 */
export function usePdfToExcel() {
  const tool = usePdfTool({ operationName: "PDF to Excel 변환" });
  const [excelBlob, setExcelBlob] = useState<Blob | null>(null);
  const [completed, setCompleted] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);

  const convert = useCallback(async () => {
    if (!tool.validateFiles()) return;

    try {
      tool.startProcessing("PDF to Excel 변환");
      tool.updateProgress(10);

      const arrayBuffer = await tool.firstFile.arrayBuffer();
      tool.updateProgress(20);

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      tool.updateProgress(30);

      const totalPages = pdfDoc.numPages;
      setPageCount(totalPages);

      const workbook = XLSX.utils.book_new();
      let detectedTables = 0;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        tool.updateProgress(30 + (pageNum / totalPages) * 50);

        // 위치 기반 텍스트 그룹화
        const lines: { y: number; items: { x: number; text: string }[] }[] = [];

        for (const item of textContent.items) {
          if ("str" in item && "transform" in item) {
            const x = item.transform[4];
            const y = item.transform[5];
            const text = item.str.trim();

            if (!text) continue;

            let line = lines.find((l) => Math.abs(l.y - y) < 5);
            if (!line) {
              line = { y, items: [] };
              lines.push(line);
            }
            line.items.push({ x, text });
          }
        }

        // Y 좌표로 정렬 (위→아래)
        lines.sort((a, b) => b.y - a.y);

        // 각 라인의 항목을 X 좌표로 정렬
        for (const line of lines) {
          line.items.sort((a, b) => a.x - b.x);
        }

        // 2D 배열로 변환
        const sheetData: string[][] = lines.map((line) =>
          line.items.map((item) => item.text)
        );

        if (sheetData.length > 0) {
          const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
          XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `페이지 ${pageNum}`
          );
          detectedTables++;
        }
      }

      tool.updateProgress(85);

      setTableCount(detectedTables);

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      setExcelBlob(blob);
      setCompleted(true);

      tool.updateProgress(100);
    } catch (error) {
      console.error("PDF to Excel 변환 오류:", error);
      tool.setError("PDF to Excel 변환 중 오류가 발생했습니다.");
    } finally {
      tool.finishProcessing();
    }
  }, [tool]);

  const reset = useCallback(() => {
    setExcelBlob(null);
    setCompleted(false);
    setPageCount(0);
    setTableCount(0);
    tool.reset();
  }, [tool]);

  return {
    ...tool,
    excelBlob,
    completed,
    pageCount,
    tableCount,
    convert,
    reset,
  };
}

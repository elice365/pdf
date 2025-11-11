import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { usePdfTool } from "./use-pdf-tool";

/**
 * Custom hook for HTML to PDF conversion
 */
export function useHtmlToPdf() {
  const tool = usePdfTool({ operationName: "HTML을 PDF로 변환" });
  const [htmlContent, setHtmlContent] = useState("");
  const [pdfData, setPdfData] = useState<string>("");
  const [completed, setCompleted] = useState(false);

  const convert = useCallback(async () => {
    if (!htmlContent.trim()) {
      tool.setError("HTML 내용을 입력해주세요.");
      return;
    }

    try {
      tool.startProcessing("HTML을 PDF로 변환");
      tool.updateProgress(20);

      // HTML을 DOM에 렌더링
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "210mm"; // A4 width
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      tool.updateProgress(40);

      // html2canvas로 캔버스로 변환
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      tool.updateProgress(60);

      // DOM에서 제거
      document.body.removeChild(container);

      // jsPDF로 PDF 생성
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      tool.updateProgress(90);

      const pdfBase64 = pdf.output("datauristring");
      setPdfData(pdfBase64);
      setCompleted(true);

      tool.updateProgress(100);
    } catch (error) {
      console.error("HTML to PDF 변환 오류:", error);
      tool.setError("HTML to PDF 변환 중 오류가 발생했습니다.");
    } finally {
      tool.finishProcessing();
    }
  }, [htmlContent, tool]);

  const reset = useCallback(() => {
    setHtmlContent("");
    setPdfData("");
    setCompleted(false);
    tool.reset();
  }, [tool]);

  return {
    ...tool,
    htmlContent,
    setHtmlContent,
    pdfData,
    completed,
    convert,
    reset,
  };
}

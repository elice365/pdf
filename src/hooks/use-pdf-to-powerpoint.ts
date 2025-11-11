import { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pptxgen from "pptxgenjs";
import { usePdfTool } from "./use-pdf-tool";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Custom hook for PDF to PowerPoint conversion
 */
export function usePdfToPowerPoint() {
  const tool = usePdfTool({ operationName: "PDF to PowerPoint 변환" });
  const [pptxBlob, setPptxBlob] = useState<Blob | null>(null);
  const [completed, setCompleted] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const convert = useCallback(async () => {
    if (!tool.validateFiles()) return;

    try {
      tool.startProcessing("PDF to PowerPoint 변환");
      tool.updateProgress(10);

      const arrayBuffer = await tool.firstFile.arrayBuffer();
      tool.updateProgress(20);

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      tool.updateProgress(30);

      const totalPages = pdfDoc.numPages;
      setPageCount(totalPages);

      const ppt = new pptxgen();

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);

        tool.updateProgress(30 + (pageNum / totalPages) * 60);

        // 페이지를 캔버스로 렌더링
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas context not available");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        // 캔버스를 이미지로 변환
        const imageData = canvas.toDataURL("image/png");

        // 슬라이드 추가
        const slide = ppt.addSlide();
        slide.addImage({
          data: imageData,
          x: 0,
          y: 0,
          w: "100%",
          h: "100%",
        });
      }

      tool.updateProgress(95);

      const blob = (await ppt.write({ outputType: "blob" })) as Blob;

      setPptxBlob(blob);
      setCompleted(true);

      tool.updateProgress(100);
    } catch (error) {
      console.error("PDF to PowerPoint 변환 오류:", error);
      tool.setError("PDF to PowerPoint 변환 중 오류가 발생했습니다.");
    } finally {
      tool.finishProcessing();
    }
  }, [tool]);

  const reset = useCallback(() => {
    setPptxBlob(null);
    setCompleted(false);
    setPageCount(0);
    tool.reset();
  }, [tool]);

  return {
    ...tool,
    pptxBlob,
    completed,
    pageCount,
    convert,
    reset,
  };
}

"use client";

import { ArrowLeft, EyeOff } from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb } from "pdf-lib";
import { useEffect, useRef, useState } from "react";
import { DownloadButton } from "@/components/pdf/download-button";
import { FileUpload } from "@/components/pdf/file-upload";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetState,
  setError,
  setOperation,
  setProcessedFile,
  setProcessing,
  setProgress,
} from "@/store/slices/pdfSlice";

interface RedactionArea {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function RedactPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [redactionAreas, setRedactionAreas] = useState<RedactionArea[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(
    null,
  );

  // Load and render PDF pages
  useEffect(() => {
    if (files.length > 0) {
      loadPdfPages();
    }
  }, [files]);

  const loadPdfPages = async () => {
    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 로딩"));
      dispatch(setProgress(10));

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      setPdfArrayBuffer(arrayBuffer);

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      dispatch(setProgress(30));

      const images: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport } as any).promise;
        images.push(canvas.toDataURL());

        dispatch(
          setProgress(30 + (pageNum / pdf.numPages) * 50),
        );
      }

      setPageImages(images);
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 로딩 오류:", error);
      dispatch(setError("PDF 로딩 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  // Handle mouse down (start drawing redaction box)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
  };

  // Handle mouse up (finish drawing redaction box)
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const x = Math.min(startPos.x, endX);
    const y = Math.min(startPos.y, endY);
    const width = Math.abs(endX - startPos.x);
    const height = Math.abs(endY - startPos.y);

    if (width > 5 && height > 5) {
      setRedactionAreas([
        ...redactionAreas,
        {
          pageIndex: currentPage,
          x,
          y,
          width,
          height,
        },
      ]);
    }

    setIsDrawing(false);
    setStartPos(null);
  };

  // Draw redaction areas on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pageImages.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load current page image
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw existing redaction areas for this page
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      redactionAreas
        .filter((area) => area.pageIndex === currentPage)
        .forEach((area) => {
          ctx.fillRect(area.x, area.y, area.width, area.height);
        });

      // Draw current selection if drawing
      if (isDrawing && startPos) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const currentRect = canvas.getBoundingClientRect();
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          0,
          0,
        );
      }
    };
    img.src = pageImages[currentPage];
  }, [currentPage, pageImages, redactionAreas, isDrawing, startPos]);

  // Apply redactions to PDF
  const handleApplyRedactions = async () => {
    if (!pdfArrayBuffer) {
      dispatch(setError("PDF 파일이 로드되지 않았습니다."));
      return;
    }

    if (redactionAreas.length === 0) {
      dispatch(setError("검열할 영역을 선택해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("검열 적용"));
      dispatch(setProgress(10));

      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();

      dispatch(setProgress(30));

      // Group redaction areas by page
      const areasByPage = new Map<number, RedactionArea[]>();
      for (const area of redactionAreas) {
        if (!areasByPage.has(area.pageIndex)) {
          areasByPage.set(area.pageIndex, []);
        }
        areasByPage.get(area.pageIndex)!.push(area);
      }

      // Apply black rectangles to each page
      for (const [pageIndex, areas] of areasByPage) {
        const page = pages[pageIndex];
        const { height } = page.getSize();

        for (const area of areas) {
          // Convert canvas coordinates to PDF coordinates
          // Canvas Y is top-down, PDF Y is bottom-up
          const pdfY = height - area.y - area.height;

          page.drawRectangle({
            x: area.x,
            y: pdfY,
            width: area.width,
            height: area.height,
            color: rgb(0, 0, 0),
          });
        }
      }

      dispatch(setProgress(70));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([Buffer.from(pdfBytes)], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("검열 적용 오류:", error);
      dispatch(setError("검열 적용 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setPageImages([]);
    setCurrentPage(0);
    setRedactionAreas([]);
    setPdfArrayBuffer(null);
  };

  const removeRedaction = (index: number) => {
    setRedactionAreas(redactionAreas.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <EyeOff className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF 검열하기
              </h1>
              <p className="text-muted-foreground mt-1">
                민감한 정보를 영구적으로 삭제하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && pageImages.length === 0 && (
            <ProcessingProgress />
          )}

          {pageImages.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">사용 방법</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>마우스로 드래그하여 검열할 영역을 선택하세요</li>
                  <li>여러 영역을 선택할 수 있습니다</li>
                  <li>페이지 버튼으로 다른 페이지로 이동할 수 있습니다</li>
                  <li>검은색 박스로 영구적으로 가려집니다</li>
                </ul>
              </div>

              {/* Page navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  이전 페이지
                </Button>
                <span className="text-sm text-muted-foreground">
                  페이지 {currentPage + 1} / {pageImages.length}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pageImages.length - 1, currentPage + 1),
                    )
                  }
                  disabled={currentPage === pageImages.length - 1}
                >
                  다음 페이지
                </Button>
              </div>

              {/* Canvas for drawing redaction areas */}
              <div className="border border-border rounded-lg overflow-hidden bg-surface">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  className="w-full cursor-crosshair"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>

              {/* Redaction list */}
              {redactionAreas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    선택된 검열 영역 ({redactionAreas.length}개)
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {redactionAreas.map((area, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-surface rounded text-xs"
                      >
                        <span className="text-muted-foreground">
                          페이지 {area.pageIndex + 1} - {Math.round(area.width)}x
                          {Math.round(area.height)}px
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRedaction(index)}
                          className="h-6 text-xs"
                        >
                          삭제
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-center gap-3">
                <Button
                  size="lg"
                  onClick={handleApplyRedactions}
                  disabled={redactionAreas.length === 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <EyeOff className="w-5 h-5 mr-2" />
                  검열 적용
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset}>
                  다시 시작
                </Button>
              </div>
            </Card>
          )}

          {processedFile && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">검열 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {redactionAreas.length}개 영역이 검열되었습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>참고:</strong> 검은색 박스로 가려진 정보는 영구적으로
                  삭제되어 복구할 수 없습니다.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <DownloadButton
                  filename="redacted.pdf"
                  className="flex-1 sm:flex-initial max-w-xs"
                />
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial max-w-xs"
                >
                  다시 시작
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

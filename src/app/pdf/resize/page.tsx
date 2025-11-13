"use client";

import { ArrowLeft, Maximize2 } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
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

type PageSize = "a4" | "a3" | "a5" | "letter" | "legal" | "custom";
type Orientation = "portrait" | "landscape";

export default function ResizePdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [customWidth, setCustomWidth] = useState<string>("595");
  const [customHeight, setCustomHeight] = useState<string>("842");

  const getPageDimensions = (): [number, number] => {
    let width = 595;
    let height = 842;

    switch (pageSize) {
      case "a4":
        width = 595;
        height = 842;
        break;
      case "a3":
        width = 842;
        height = 1191;
        break;
      case "a5":
        width = 420;
        height = 595;
        break;
      case "letter":
        width = 612;
        height = 792;
        break;
      case "legal":
        width = 612;
        height = 1008;
        break;
      case "custom":
        width = Number.parseFloat(customWidth) || 595;
        height = Number.parseFloat(customHeight) || 842;
        break;
    }

    if (orientation === "landscape") {
      return [height, width];
    }
    return [width, height];
  };

  const handleResize = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 크기 조정"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      const [newWidth, newHeight] = getPageDimensions();
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        page.setSize(newWidth, newHeight);

        const progress = 30 + ((i + 1) / pages.length) * 60;
        dispatch(setProgress(Math.round(progress)));
      }

      dispatch(setProgress(95));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 크기 조정 오류:", error);
      dispatch(setError("PDF 크기 조정 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setPageSize("a4");
    setOrientation("portrait");
    setCustomWidth("595");
    setCustomHeight("842");
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
              <Maximize2 className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF 크기 조정
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF 페이지 크기를 변경하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              {/* Page Size Selection */}
              <div>
                <h3 className="text-sm font-medium mb-4">페이지 크기</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button
                    variant={pageSize === "a4" ? "default" : "outline"}
                    onClick={() => setPageSize("a4")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">A4</span>
                    <span className="text-xs opacity-80">210×297mm</span>
                  </Button>
                  <Button
                    variant={pageSize === "a3" ? "default" : "outline"}
                    onClick={() => setPageSize("a3")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">A3</span>
                    <span className="text-xs opacity-80">297×420mm</span>
                  </Button>
                  <Button
                    variant={pageSize === "a5" ? "default" : "outline"}
                    onClick={() => setPageSize("a5")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">A5</span>
                    <span className="text-xs opacity-80">148×210mm</span>
                  </Button>
                  <Button
                    variant={pageSize === "letter" ? "default" : "outline"}
                    onClick={() => setPageSize("letter")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">Letter</span>
                    <span className="text-xs opacity-80">8.5×11in</span>
                  </Button>
                  <Button
                    variant={pageSize === "legal" ? "default" : "outline"}
                    onClick={() => setPageSize("legal")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">Legal</span>
                    <span className="text-xs opacity-80">8.5×14in</span>
                  </Button>
                  <Button
                    variant={pageSize === "custom" ? "default" : "outline"}
                    onClick={() => setPageSize("custom")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">사용자 정의</span>
                    <span className="text-xs opacity-80">직접 입력</span>
                  </Button>
                </div>
              </div>

              {/* Orientation Selection */}
              <div>
                <h3 className="text-sm font-medium mb-4">방향</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={orientation === "portrait" ? "default" : "outline"}
                    onClick={() => setOrientation("portrait")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">세로</span>
                    <span className="text-xs opacity-80">Portrait</span>
                  </Button>
                  <Button
                    variant={
                      orientation === "landscape" ? "default" : "outline"
                    }
                    onClick={() => setOrientation("landscape")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">가로</span>
                    <span className="text-xs opacity-80">Landscape</span>
                  </Button>
                </div>
              </div>

              {/* Custom Dimensions */}
              {pageSize === "custom" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">사용자 정의 크기 (pt)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="width"
                        className="text-sm text-muted-foreground block mb-2"
                      >
                        너비
                      </label>
                      <input
                        id="width"
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        min="50"
                        step="10"
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="height"
                        className="text-sm text-muted-foreground block mb-2"
                      >
                        높이
                      </label>
                      <input
                        id="height"
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        min="50"
                        step="10"
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    포인트(pt) 단위: 1인치 = 72pt
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  크기 조정 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>모든 페이지가 동일한 크기로 조정됩니다</li>
                  <li>내용은 원본 비율을 유지합니다</li>
                  <li>큰 페이지는 축소, 작은 페이지는 확대될 수 있습니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleResize}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Maximize2 className="w-5 h-5 mr-2" />
                  크기 조정
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Maximize2
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">조정 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    PDF 크기가 조정되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="resized.pdf"
                  className="flex-1 sm:flex-initial"
                />
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial"
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

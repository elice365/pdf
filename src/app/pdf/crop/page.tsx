"use client";

import { ArrowLeft, Crop } from "lucide-react";
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

type CropPreset = "custom" | "square" | "a4" | "letter";

export default function CropPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [preset, setPreset] = useState<CropPreset>("custom");
  const [top, setTop] = useState<string>("0");
  const [bottom, setBottom] = useState<string>("0");
  const [left, setLeft] = useState<string>("0");
  const [right, setRight] = useState<string>("0");

  const handleCrop = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 자르기"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      const pages = pdfDoc.getPages();
      const topMargin = Number.parseFloat(top) || 0;
      const bottomMargin = Number.parseFloat(bottom) || 0;
      const leftMargin = Number.parseFloat(left) || 0;
      const rightMargin = Number.parseFloat(right) || 0;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Calculate new dimensions
        let newWidth = width - leftMargin - rightMargin;
        let newHeight = height - topMargin - bottomMargin;

        // Apply preset dimensions
        if (preset === "square") {
          const size = Math.min(newWidth, newHeight);
          newWidth = size;
          newHeight = size;
        } else if (preset === "a4") {
          newWidth = 595;
          newHeight = 842;
        } else if (preset === "letter") {
          newWidth = 612;
          newHeight = 792;
        }

        // Ensure positive dimensions
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        // Set crop box
        page.setCropBox(leftMargin, bottomMargin, newWidth, newHeight);

        const progress = 30 + ((i + 1) / pages.length) * 60;
        dispatch(setProgress(Math.round(progress)));
      }

      dispatch(setProgress(95));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([Buffer.from(pdfBytes)], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 자르기 오류:", error);
      dispatch(setError("PDF 자르기 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setPreset("custom");
    setTop("0");
    setBottom("0");
    setLeft("0");
    setRight("0");
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
              <Crop className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDF 자르기</h1>
              <p className="text-muted-foreground mt-1">
                PDF 페이지를 원하는 크기로 자르세요
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
              {/* Preset Selection */}
              <div>
                <h3 className="text-sm font-medium mb-4">자르기 프리셋</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant={preset === "custom" ? "default" : "outline"}
                    onClick={() => setPreset("custom")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">사용자 정의</span>
                    <span className="text-xs opacity-80">직접 설정</span>
                  </Button>
                  <Button
                    variant={preset === "square" ? "default" : "outline"}
                    onClick={() => setPreset("square")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">정사각형</span>
                    <span className="text-xs opacity-80">1:1 비율</span>
                  </Button>
                  <Button
                    variant={preset === "a4" ? "default" : "outline"}
                    onClick={() => setPreset("a4")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">A4</span>
                    <span className="text-xs opacity-80">595×842</span>
                  </Button>
                  <Button
                    variant={preset === "letter" ? "default" : "outline"}
                    onClick={() => setPreset("letter")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">Letter</span>
                    <span className="text-xs opacity-80">612×792</span>
                  </Button>
                </div>
              </div>

              {/* Custom Margins */}
              {preset === "custom" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">여백 설정 (pt)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="top"
                        className="text-sm text-muted-foreground block mb-2"
                      >
                        상단 여백
                      </label>
                      <input
                        id="top"
                        type="number"
                        value={top}
                        onChange={(e) => setTop(e.target.value)}
                        min="0"
                        step="10"
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bottom"
                        className="text-sm text-muted-foreground block mb-2"
                      >
                        하단 여백
                      </label>
                      <input
                        id="bottom"
                        type="number"
                        value={bottom}
                        onChange={(e) => setBottom(e.target.value)}
                        min="0"
                        step="10"
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="left"
                        className="text-sm text-muted-foreground block mb-2"
                      >
                        좌측 여백
                      </label>
                      <input
                        id="left"
                        type="number"
                        value={left}
                        onChange={(e) => setLeft(e.target.value)}
                        min="0"
                        step="10"
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="right"
                        className="text-sm text-muted-foreground block mb-2"
                      >
                        우측 여백
                      </label>
                      <input
                        id="right"
                        type="number"
                        value={right}
                        onChange={(e) => setRight(e.target.value)}
                        min="0"
                        step="10"
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  자르기 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>모든 페이지에 동일하게 적용됩니다</li>
                  <li>여백은 포인트(pt) 단위입니다 (1인치 = 72pt)</li>
                  <li>프리셋을 선택하면 여백 설정이 무시됩니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleCrop}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Crop className="w-5 h-5 mr-2" />
                  PDF 자르기
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Crop className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">자르기 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    PDF가 자르기되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="cropped.pdf"
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

"use client";

import { ArrowLeft, RotateCw } from "lucide-react";
import Link from "next/link";
import { degrees, PDFDocument } from "pdf-lib";
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

type RotationAngle = 90 | 180 | 270;
type RotationMode = "all" | "specific";

export default function RotatePdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [angle, setAngle] = useState<RotationAngle>(90);
  const [mode, setMode] = useState<RotationMode>("all");
  const [specificPages, setSpecificPages] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleFileLoad = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdf.getPageCount());
    } catch (error) {
      console.error("PDF 로드 오류:", error);
      dispatch(setError("PDF 파일을 읽을 수 없습니다."));
    }
  };

  const handleRotate = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 회전"));
      dispatch(setProgress(10));

      const file = files[0];
      await handleFileLoad(file);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      const pages = pdfDoc.getPages();
      let pagesToRotate: number[] = [];

      if (mode === "all") {
        pagesToRotate = pages.map((_, index) => index);
      } else {
        // Parse specific pages (e.g., "1,3,5-7")
        const pageNumbers = specificPages
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== "");

        for (const pageStr of pageNumbers) {
          if (pageStr.includes("-")) {
            const [start, end] = pageStr
              .split("-")
              .map((n) => parseInt(n.trim(), 10));
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= pages.length) {
                pagesToRotate.push(i - 1);
              }
            }
          } else {
            const pageNum = parseInt(pageStr, 10);
            if (pageNum >= 1 && pageNum <= pages.length) {
              pagesToRotate.push(pageNum - 1);
            }
          }
        }
      }

      if (pagesToRotate.length === 0) {
        dispatch(setError("유효한 페이지를 선택해주세요."));
        dispatch(setProcessing(false));
        return;
      }

      dispatch(setProgress(50));

      // Rotate selected pages
      for (const pageIndex of pagesToRotate) {
        const page = pages[pageIndex];
        page.setRotation(degrees(angle));
      }

      dispatch(setProgress(80));

      const rotatedBytes = await pdfDoc.save();
      const blob = new Blob([Buffer.from(rotatedBytes)], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 회전 오류:", error);
      dispatch(setError("PDF 회전 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setSpecificPages("");
    setTotalPages(0);
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
              <RotateCw className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDF 회전</h1>
              <p className="text-muted-foreground mt-1">
                PDF 페이지를 회전시키세요
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
              {totalPages > 0 && (
                <div className="text-sm text-muted-foreground">
                  총 {totalPages}페이지
                </div>
              )}

              {/* Rotation Angle */}
              <div>
                <h3 className="text-sm font-medium mb-4">회전 각도</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={angle === 90 ? "default" : "outline"}
                    onClick={() => setAngle(90)}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span className="font-medium">90°</span>
                    <span className="text-xs opacity-80">시계 방향</span>
                  </Button>
                  <Button
                    variant={angle === 180 ? "default" : "outline"}
                    onClick={() => setAngle(180)}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span className="font-medium">180°</span>
                    <span className="text-xs opacity-80">뒤집기</span>
                  </Button>
                  <Button
                    variant={angle === 270 ? "default" : "outline"}
                    onClick={() => setAngle(270)}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span className="font-medium">270°</span>
                    <span className="text-xs opacity-80">반시계 방향</span>
                  </Button>
                </div>
              </div>

              {/* Rotation Mode */}
              <div>
                <h3 className="text-sm font-medium mb-4">적용 범위</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={mode === "all" ? "default" : "outline"}
                    onClick={() => setMode("all")}
                    className="h-auto py-3"
                  >
                    모든 페이지
                  </Button>
                  <Button
                    variant={mode === "specific" ? "default" : "outline"}
                    onClick={() => setMode("specific")}
                    className="h-auto py-3"
                  >
                    특정 페이지
                  </Button>
                </div>
              </div>

              {/* Specific Pages Input */}
              {mode === "specific" && (
                <div className="space-y-2">
                  <label
                    htmlFor="specificPages"
                    className="text-sm font-medium"
                  >
                    페이지 번호
                  </label>
                  <input
                    id="specificPages"
                    type="text"
                    value={specificPages}
                    onChange={(e) => setSpecificPages(e.target.value)}
                    placeholder="예: 1,3,5-7"
                    className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    쉼표로 구분하거나 범위를 지정하세요 (예: 1,3,5-7)
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleRotate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <RotateCw className="w-5 h-5 mr-2" />
                  PDF 회전하기
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <RotateCw
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">회전 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    페이지가 회전되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="rotated.pdf"
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

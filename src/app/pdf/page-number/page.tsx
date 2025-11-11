"use client";

import { ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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

type Position =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";
type Format = "number" | "page-of-total";

export default function PageNumberPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<Format>("number");
  const [startPage, setStartPage] = useState<string>("1");
  const [fontSize, setFontSize] = useState<number>(12);

  const handleAddPageNumbers = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("페이지 번호 추가"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const startNum = parseInt(startPage, 10) || 1;

      dispatch(setProgress(40));

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNumber = startNum + i;

        let text = "";
        if (format === "number") {
          text = pageNumber.toString();
        } else {
          text = `${pageNumber} / ${totalPages}`;
        }

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = fontSize;

        let x = 0;
        let y = 0;

        // Calculate position
        switch (position) {
          case "bottom-center":
            x = (width - textWidth) / 2;
            y = 30;
            break;
          case "bottom-left":
            x = 40;
            y = 30;
            break;
          case "bottom-right":
            x = width - textWidth - 40;
            y = 30;
            break;
          case "top-center":
            x = (width - textWidth) / 2;
            y = height - textHeight - 30;
            break;
          case "top-left":
            x = 40;
            y = height - textHeight - 30;
            break;
          case "top-right":
            x = width - textWidth - 40;
            y = height - textHeight - 30;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });

        const progress = 40 + ((i + 1) / pages.length) * 50;
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
      console.error("페이지 번호 추가 오류:", error);
      dispatch(setError("페이지 번호 추가 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
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
              <Hash className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                페이지 번호 추가
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF에 페이지 번호를 넣으세요
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
              {/* Position Selection */}
              <div>
                <h3 className="text-sm font-medium mb-4">위치</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={position === "top-left" ? "default" : "outline"}
                    onClick={() => setPosition("top-left")}
                    className="h-12"
                  >
                    상단 왼쪽
                  </Button>
                  <Button
                    variant={position === "top-center" ? "default" : "outline"}
                    onClick={() => setPosition("top-center")}
                    className="h-12"
                  >
                    상단 중앙
                  </Button>
                  <Button
                    variant={position === "top-right" ? "default" : "outline"}
                    onClick={() => setPosition("top-right")}
                    className="h-12"
                  >
                    상단 오른쪽
                  </Button>
                  <Button
                    variant={position === "bottom-left" ? "default" : "outline"}
                    onClick={() => setPosition("bottom-left")}
                    className="h-12"
                  >
                    하단 왼쪽
                  </Button>
                  <Button
                    variant={
                      position === "bottom-center" ? "default" : "outline"
                    }
                    onClick={() => setPosition("bottom-center")}
                    className="h-12"
                  >
                    하단 중앙
                  </Button>
                  <Button
                    variant={
                      position === "bottom-right" ? "default" : "outline"
                    }
                    onClick={() => setPosition("bottom-right")}
                    className="h-12"
                  >
                    하단 오른쪽
                  </Button>
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <h3 className="text-sm font-medium mb-4">형식</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={format === "number" ? "default" : "outline"}
                    onClick={() => setFormat("number")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">숫자만</span>
                    <span className="text-xs opacity-80">예: 1, 2, 3</span>
                  </Button>
                  <Button
                    variant={format === "page-of-total" ? "default" : "outline"}
                    onClick={() => setFormat("page-of-total")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">페이지 / 전체</span>
                    <span className="text-xs opacity-80">예: 1 / 10</span>
                  </Button>
                </div>
              </div>

              {/* Start Page Number */}
              <div>
                <label
                  htmlFor="startPage"
                  className="text-sm font-medium block mb-2"
                >
                  시작 번호
                </label>
                <input
                  id="startPage"
                  type="number"
                  value={startPage}
                  onChange={(e) => setStartPage(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Font Size */}
              <div>
                <label
                  htmlFor="fontSize"
                  className="text-sm font-medium block mb-2"
                >
                  글자 크기: {fontSize}pt
                </label>
                <input
                  id="fontSize"
                  type="range"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  min="8"
                  max="24"
                  step="1"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>8pt</span>
                  <span>24pt</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAddPageNumbers}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Hash className="w-5 h-5 mr-2" />
                  페이지 번호 추가
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">추가 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    페이지 번호가 추가되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="numbered.pdf"
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

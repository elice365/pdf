"use client";

import { ArrowLeft, Droplets } from "lucide-react";
import Link from "next/link";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
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

type WatermarkStyle = "diagonal" | "horizontal" | "footer";

export default function WatermarkPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [text, setText] = useState<string>("CONFIDENTIAL");
  const [style, setStyle] = useState<WatermarkStyle>("diagonal");
  const [opacity, setOpacity] = useState<number>(0.3);
  const [fontSize, setFontSize] = useState<number>(48);

  const handleAddWatermark = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    if (!text.trim()) {
      dispatch(setError("워터마크 텍스트를 입력해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("워터마크 추가"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      dispatch(setProgress(40));

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = fontSize;

        let x = 0;
        let y = 0;
        let rotation = 0;

        switch (style) {
          case "diagonal":
            // Center of page, rotated 45 degrees
            x = (width - textWidth) / 2;
            y = (height - textHeight) / 2;
            rotation = 45;
            break;
          case "horizontal":
            // Center of page, horizontal
            x = (width - textWidth) / 2;
            y = (height - textHeight) / 2;
            rotation = 0;
            break;
          case "footer":
            // Bottom center
            x = (width - textWidth) / 2;
            y = 40;
            rotation = 0;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(rotation),
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
      console.error("워터마크 추가 오류:", error);
      dispatch(setError("워터마크 추가 중 오류가 발생했습니다."));
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
              <Droplets className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                워터마크 추가
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF에 워터마크를 넣으세요
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
              {/* Watermark Text */}
              <div>
                <label
                  htmlFor="watermarkText"
                  className="text-sm font-medium block mb-2"
                >
                  워터마크 텍스트
                </label>
                <input
                  id="watermarkText"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="예: CONFIDENTIAL, DRAFT, SAMPLE"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Style Selection */}
              <div>
                <h3 className="text-sm font-medium mb-4">스타일</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={style === "diagonal" ? "default" : "outline"}
                    onClick={() => setStyle("diagonal")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">대각선</span>
                    <span className="text-xs opacity-80">45° 회전</span>
                  </Button>
                  <Button
                    variant={style === "horizontal" ? "default" : "outline"}
                    onClick={() => setStyle("horizontal")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">가로</span>
                    <span className="text-xs opacity-80">중앙</span>
                  </Button>
                  <Button
                    variant={style === "footer" ? "default" : "outline"}
                    onClick={() => setStyle("footer")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">하단</span>
                    <span className="text-xs opacity-80">바닥글</span>
                  </Button>
                </div>
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
                  min="12"
                  max="72"
                  step="4"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>12pt</span>
                  <span>72pt</span>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label
                  htmlFor="opacity"
                  className="text-sm font-medium block mb-2"
                >
                  투명도: {Math.round(opacity * 100)}%
                </label>
                <input
                  id="opacity"
                  type="range"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  min="0.1"
                  max="1"
                  step="0.1"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAddWatermark}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Droplets className="w-5 h-5 mr-2" />
                  워터마크 추가
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Droplets
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">추가 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    워터마크가 추가되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="watermarked.pdf"
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

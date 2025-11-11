"use client";

import { ArrowLeft, Type } from "lucide-react";
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
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export default function AddTextPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [text, setText] = useState<string>("");
  const [position, setPosition] = useState<Position>("top-left");
  const [fontSize, setFontSize] = useState<number>(24);
  const [textColor, setTextColor] = useState<string>("#000000");

  const handleAddText = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    if (!text.trim()) {
      dispatch(setError("텍스트를 입력해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("텍스트 추가"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      dispatch(setProgress(40));

      // Parse hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: Number.parseInt(result[1], 16) / 255,
              g: Number.parseInt(result[2], 16) / 255,
              b: Number.parseInt(result[3], 16) / 255,
            }
          : { r: 0, g: 0, b: 0 };
      };

      const color = hexToRgb(textColor);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = fontSize;

        let x = 0;
        let y = 0;

        // Calculate position
        switch (position) {
          case "top-left":
            x = 40;
            y = height - textHeight - 40;
            break;
          case "top-center":
            x = (width - textWidth) / 2;
            y = height - textHeight - 40;
            break;
          case "top-right":
            x = width - textWidth - 40;
            y = height - textHeight - 40;
            break;
          case "center":
            x = (width - textWidth) / 2;
            y = (height - textHeight) / 2;
            break;
          case "bottom-left":
            x = 40;
            y = 40;
            break;
          case "bottom-center":
            x = (width - textWidth) / 2;
            y = 40;
            break;
          case "bottom-right":
            x = width - textWidth - 40;
            y = 40;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
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
      console.error("텍스트 추가 오류:", error);
      dispatch(setError("텍스트 추가 중 오류가 발생했습니다."));
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
              <Type className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                텍스트 추가
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF에 텍스트를 추가하세요
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
              {/* Text Input */}
              <div>
                <label
                  htmlFor="textInput"
                  className="text-sm font-medium block mb-2"
                >
                  텍스트
                </label>
                <textarea
                  id="textInput"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="추가할 텍스트를 입력하세요"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24 resize-y"
                />
              </div>

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
                  <Button
                    variant={position === "center" ? "default" : "outline"}
                    onClick={() => setPosition("center")}
                    className="h-12 col-span-3"
                  >
                    중앙
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
                  step="2"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>12pt</span>
                  <span>72pt</span>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label
                  htmlFor="textColor"
                  className="text-sm font-medium block mb-2"
                >
                  텍스트 색상
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="textColor"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-12 w-24 rounded-md border border-border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {textColor.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAddText}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Type className="w-5 h-5 mr-2" />
                  텍스트 추가
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Type className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">추가 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    텍스트가 추가되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="text-added.pdf"
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

"use client";

import { ArrowLeft, Download, Image } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FileUpload } from "@/components/pdf/file-upload";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetState,
  setError,
  setOperation,
  setProcessing,
  setProgress,
} from "@/store/slices/pdfSlice";

type Quality = "low" | "medium" | "high";

interface ConvertedImage {
  page: number;
  dataUrl: string;
}

export default function PdfToJpgPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [quality, setQuality] = useState<Quality>("high");
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF를 JPG로 변환"));
      dispatch(setProgress(10));

      // Dynamically import pdfjs-dist only on client side
      const pdfjsLib = await import("pdfjs-dist");

      // Configure worker (use local file)
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const file = files[0];

      // Map quality to scale factor
      const scaleMap = { low: 1.0, medium: 1.5, high: 2.0 };
      const scale = scaleMap[quality];

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(20));

      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;

      dispatch(setProgress(30));

      const convertedImages: ConvertedImage[] = [];
      const totalPages = pdf.numPages;

      // Convert each page to image
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Canvas context를 생성할 수 없습니다.");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          intent: "display" as const,
        };

        await page.render(renderContext as any).promise;

        // Convert canvas to data URL (JPEG format)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

        convertedImages.push({
          page: pageNum,
          dataUrl,
        });

        // Update progress
        const progress = 30 + (pageNum / totalPages) * 60;
        dispatch(setProgress(Math.round(progress)));
      }

      dispatch(setProgress(95));

      setImages(convertedImages);
      setCompleted(true);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF to JPG 변환 오류:", error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "PDF to JPG 변환 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleDownloadImage = (dataUrl: string, pageNumber: number) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `page-${pageNumber}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    images.forEach((image) => {
      handleDownloadImage(image.dataUrl, image.page);
    });
  };

  const handleReset = () => {
    dispatch(resetState());
    setQuality("high");
    setImages([]);
    setCompleted(false);
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
              <Image className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF를 JPG로
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF 페이지를 JPG 이미지로 변환하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !completed && (
            <Card className="p-6 space-y-6">
              {/* Quality Selection */}
              <div>
                <h3 className="text-sm font-medium mb-4">이미지 품질</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={quality === "low" ? "default" : "outline"}
                    onClick={() => setQuality("low")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">낮음</span>
                    <span className="text-xs opacity-80">72 DPI</span>
                  </Button>
                  <Button
                    variant={quality === "medium" ? "default" : "outline"}
                    onClick={() => setQuality("medium")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">중간</span>
                    <span className="text-xs opacity-80">150 DPI</span>
                  </Button>
                  <Button
                    variant={quality === "high" ? "default" : "outline"}
                    onClick={() => setQuality("high")}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="font-medium">높음</span>
                    <span className="text-xs opacity-80">300 DPI</span>
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  JPG 변환 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>모든 페이지가 개별 JPG 파일로 변환됩니다</li>
                  <li>높은 품질은 파일 크기가 커집니다</li>
                  <li>변환된 이미지는 ZIP 파일로 다운로드됩니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Image className="w-5 h-5 mr-2" />
                  JPG로 변환
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && images.length > 0 && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Image
                      className="w-5 h-5 text-success"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">변환 완료!</p>
                    <p className="text-sm text-muted-foreground">
                      {images.length}개의 이미지가 생성되었습니다
                    </p>
                  </div>
                </div>
                <Button onClick={handleDownloadAll}>
                  <Download className="w-4 h-4 mr-2" />
                  모두 다운로드
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {images.map((image) => (
                  <div
                    key={image.page}
                    className="p-4 bg-surface rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        페이지 {image.page}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDownloadImage(image.dataUrl, image.page)
                        }
                      >
                        <Download className="w-3 h-3 mr-1" />
                        다운로드
                      </Button>
                    </div>
                    <div className="relative aspect-[8.5/11] bg-white rounded overflow-hidden border border-border">
                      <img
                        src={image.dataUrl}
                        alt={`페이지 ${image.page}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" onClick={handleReset}>
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

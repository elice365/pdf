"use client";

import { ArrowLeft, FileImage } from "lucide-react";
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

type PageSize = "auto" | "a4" | "letter";
type Orientation = "portrait" | "landscape";

export default function PngToPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [pageSize, setPageSize] = useState<PageSize>("auto");
  const [orientation, setOrientation] = useState<Orientation>("portrait");

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("PNG 이미지를 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PNG를 PDF로 변환"));
      dispatch(setProgress(10));

      const pdfDoc = await PDFDocument.create();

      dispatch(setProgress(20));

      // Process each image file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageBytes = await file.arrayBuffer();

        dispatch(setProgress(20 + ((i + 1) / files.length) * 60));

        // Embed PNG image
        const image = await pdfDoc.embedPng(imageBytes);
        const imageDims = image.scale(1);

        // Determine page dimensions
        let pageWidth = imageDims.width;
        let pageHeight = imageDims.height;

        if (pageSize === "a4") {
          pageWidth = orientation === "portrait" ? 595 : 842;
          pageHeight = orientation === "portrait" ? 842 : 595;
        } else if (pageSize === "letter") {
          pageWidth = orientation === "portrait" ? 612 : 792;
          pageHeight = orientation === "portrait" ? 792 : 612;
        }

        // Add page with image
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate image position to center it
        const scale = Math.min(
          pageWidth / imageDims.width,
          pageHeight / imageDims.height,
        );
        const scaledWidth = imageDims.width * scale;
        const scaledHeight = imageDims.height * scale;

        page.drawImage(image, {
          x: (pageWidth - scaledWidth) / 2,
          y: (pageHeight - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      dispatch(setProgress(90));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([Buffer.from(pdfBytes)], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PNG to PDF 변환 오류:", error);
      dispatch(setError("PNG to PDF 변환 중 오류가 발생했습니다."));
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
              <FileImage className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PNG를 PDF로
              </h1>
              <p className="text-muted-foreground mt-1">
                PNG 이미지를 PDF 문서로 변환하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={true} accept={{ "image/png": [".png"] }} />
          </Card>

          {files.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              <div className="text-sm text-muted-foreground">
                {files.length}개의 이미지 선택됨
              </div>

              {/* Page Size */}
              <div>
                <h3 className="text-sm font-medium mb-4">페이지 크기</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={pageSize === "auto" ? "default" : "outline"}
                    onClick={() => setPageSize("auto")}
                    className="h-auto py-3"
                  >
                    자동
                  </Button>
                  <Button
                    variant={pageSize === "a4" ? "default" : "outline"}
                    onClick={() => setPageSize("a4")}
                    className="h-auto py-3"
                  >
                    A4
                  </Button>
                  <Button
                    variant={pageSize === "letter" ? "default" : "outline"}
                    onClick={() => setPageSize("letter")}
                    className="h-auto py-3"
                  >
                    Letter
                  </Button>
                </div>
              </div>

              {/* Orientation */}
              {pageSize !== "auto" && (
                <div>
                  <h3 className="text-sm font-medium mb-4">방향</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={
                        orientation === "portrait" ? "default" : "outline"
                      }
                      onClick={() => setOrientation("portrait")}
                      className="h-auto py-3"
                    >
                      세로
                    </Button>
                    <Button
                      variant={
                        orientation === "landscape" ? "default" : "outline"
                      }
                      onClick={() => setOrientation("landscape")}
                      className="h-auto py-3"
                    >
                      가로
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileImage className="w-5 h-5 mr-2" />
                  PDF로 변환
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <FileImage
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">변환 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    PDF로 변환되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="converted.pdf"
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

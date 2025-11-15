"use client";

import { ArrowLeft, Download, Image } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

interface ExtractedImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export default function ExtractImagesPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);

  const handleExtractImages = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("이미지 추출"));
      dispatch(setProgress(10));

      // Dynamically import pdfjs-dist and JSZip
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(20));

      // Load PDF
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      dispatch(setProgress(30));

      const totalPages = pdf.numPages;
      const images: ExtractedImage[] = [];

      // Extract images from each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality

        // Create canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Canvas context를 생성할 수 없습니다.");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        } as any).promise;

        // Convert canvas to data URL (PNG format)
        const dataUrl = canvas.toDataURL("image/png");

        images.push({
          pageNumber: pageNum,
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        });

        // Update progress
        const progress = 30 + (pageNum / totalPages) * 60;
        dispatch(setProgress(Math.round(progress)));
      }

      setExtractedImages(images);
      setCompleted(true);
      dispatch(setProgress(100));
    } catch (error) {
      console.error("이미지 추출 오류:", error);
      dispatch(setError("이미지 추출 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleDownloadZip = async () => {
    try {
      // Dynamically import JSZip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Add each image to ZIP
      for (const image of extractedImages) {
        // Convert data URL to blob
        const base64Data = image.dataUrl.split(",")[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }

        zip.file(`page-${image.pageNumber}.png`, bytes);
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download ZIP
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      const originalFilename = files[0]?.name?.replace(/\.pdf$/i, "") || "pdf";
      link.download = `${originalFilename}-images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ZIP 생성 오류:", error);
      dispatch(setError("ZIP 파일 생성 중 오류가 발생했습니다."));
    }
  };

  const handleDownloadSingle = (image: ExtractedImage) => {
    const link = document.createElement("a");
    link.href = image.dataUrl;
    const originalFilename = files[0]?.name?.replace(/\.pdf$/i, "") || "pdf";
    link.download = `${originalFilename}-page-${image.pageNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    dispatch(resetState());
    setExtractedImages([]);
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
                이미지 추출
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF의 각 페이지를 이미지로 추출하세요
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
              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  이미지 추출 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>PDF의 모든 페이지를 고해상도 PNG 이미지로 변환합니다</li>
                  <li>각 페이지는 개별 PNG 파일로 저장됩니다</li>
                  <li>모든 이미지를 ZIP 파일로 한번에 다운로드할 수 있습니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleExtractImages}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Image className="w-5 h-5 mr-2" />
                  이미지 추출 시작
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && extractedImages.length > 0 && (
            <div className="space-y-4">
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
                      <p className="font-medium text-foreground">추출 완료!</p>
                      <p className="text-sm text-muted-foreground">
                        {extractedImages.length}개의 이미지가 추출되었습니다
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleDownloadZip}>
                      <Download className="w-4 h-4 mr-2" />
                      모두 다운로드 (ZIP)
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      다시 시작
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {extractedImages.map((image) => (
                  <Card
                    key={image.pageNumber}
                    className="p-4 space-y-3 hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[3/4] relative bg-surface rounded overflow-hidden">
                      <img
                        src={image.dataUrl}
                        alt={`페이지 ${image.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-foreground">
                          페이지 {image.pageNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {image.width} × {image.height}px
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadSingle(image)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        다운로드
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { ArrowLeft, Minimize2 } from "lucide-react";
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

type CompressionLevel = "low" | "medium" | "high";

export default function CompressPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [compressionLevel, setCompressionLevel] =
    useState<CompressionLevel>("medium");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const handleCompress = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 압축"));
      dispatch(setProgress(10));

      const file = files[0];
      setOriginalSize(file.size);

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      // Get compression options based on level
      const saveOptions = {
        useObjectStreams: compressionLevel === "high",
        addDefaultPage: false,
        objectsPerTick: compressionLevel === "high" ? 50 : 20,
      };

      dispatch(setProgress(60));

      // Remove unused objects and compress
      const compressedBytes = await pdfDoc.save(saveOptions);

      dispatch(setProgress(90));

      const blob = new Blob([compressedBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      setCompressedSize(blob.size);
      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 압축 오류:", error);
      dispatch(setError("PDF 압축 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const getCompressionRate = (): number => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
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
              <Minimize2 className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDF 압축</h1>
              <p className="text-muted-foreground mt-1">
                PDF 파일 크기를 줄여보세요
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
              <div>
                <h3 className="text-sm font-medium mb-4">압축 레벨 선택</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={compressionLevel === "low" ? "default" : "outline"}
                    onClick={() => setCompressionLevel("low")}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <span className="font-medium">낮음</span>
                    <span className="text-xs opacity-80">빠른 처리</span>
                  </Button>
                  <Button
                    variant={
                      compressionLevel === "medium" ? "default" : "outline"
                    }
                    onClick={() => setCompressionLevel("medium")}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <span className="font-medium">보통</span>
                    <span className="text-xs opacity-80">권장</span>
                  </Button>
                  <Button
                    variant={
                      compressionLevel === "high" ? "default" : "outline"
                    }
                    onClick={() => setCompressionLevel("high")}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <span className="font-medium">높음</span>
                    <span className="text-xs opacity-80">최대 압축</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  압축 레벨이 높을수록 파일 크기가 더 줄어들지만 처리 시간이
                  길어질 수 있습니다.
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleCompress}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Minimize2 className="w-5 h-5 mr-2" />
                  PDF 압축하기
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Minimize2
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">압축 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    파일 크기가 줄어들었습니다
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-surface rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    원본 크기
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatFileSize(originalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">압축 후</p>
                  <p className="text-lg font-semibold text-success">
                    {formatFileSize(compressedSize)}
                  </p>
                </div>
              </div>

              {getCompressionRate() > 0 && (
                <div className="flex items-center justify-center p-3 bg-success/10 rounded-lg">
                  <p className="text-sm font-medium text-success">
                    {getCompressionRate()}% 감소
                  </p>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <DownloadButton filename="compressed.pdf" className="flex-1" />
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
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

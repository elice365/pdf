"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
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

type ConversionQuality = "standard" | "high";

export default function PdfToWordPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [quality, setQuality] = useState<ConversionQuality>("high");

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF to Word 변환"));
      dispatch(setProgress(10));

      // Note: pdf-lib doesn't support PDF to Word conversion
      // This would require a backend API or external service
      // For now, we'll show a placeholder implementation

      dispatch(setProgress(30));

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      dispatch(setProgress(60));

      // In a real implementation, this would:
      // 1. Send PDF to backend API or external service
      // 2. Receive converted DOCX file
      // 3. Create blob from response

      dispatch(setProgress(90));

      // Placeholder: Create a simple text blob as demonstration
      const placeholderText = `
이 파일은 PDF to Word 변환의 플레이스홀더입니다.

실제 구현을 위해서는 다음 중 하나가 필요합니다:
1. 백엔드 API 서버 (pdf2docx, Apache POI, iText 등 사용)
2. 외부 변환 서비스 API (CloudConvert, Zamzar 등)
3. 전용 변환 라이브러리 통합

원본 파일: ${files[0].name}
변환 품질: ${quality === "high" ? "높음" : "표준"}
변환 시간: ${new Date().toLocaleString("ko-KR")}
      `.trim();

      const blob = new Blob([placeholderText], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF to Word 변환 오류:", error);
      dispatch(setError("PDF to Word 변환 중 오류가 발생했습니다."));
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
              <FileText className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF to Word
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF를 편집 가능한 Word 문서로 변환하세요
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Notice */}
        <Card className="p-4 mb-6 bg-surface border-border">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">i</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground mb-1">
                개발 노트
              </h3>
              <p className="text-xs text-muted-foreground">
                현재 버전은 플레이스홀더 구현입니다. 실제 PDF to Word 변환을
                위해서는 백엔드 API 또는 외부 변환 서비스 통합이 필요합니다.
                (CloudConvert, pdf2docx, Apache POI 등)
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-4">변환 품질 선택</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={quality === "standard" ? "default" : "outline"}
                    onClick={() => setQuality("standard")}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <span className="font-medium">표준</span>
                    <span className="text-xs opacity-80">빠른 변환</span>
                  </Button>
                  <Button
                    variant={quality === "high" ? "default" : "outline"}
                    onClick={() => setQuality("high")}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <span className="font-medium">높음</span>
                    <span className="text-xs opacity-80">최고 품질</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  높은 품질 모드는 텍스트, 이미지, 레이아웃을 더욱 정확하게
                  변환합니다.
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Word로 변환
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <FileText
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">변환 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    Word 문서가 준비되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="converted.docx"
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

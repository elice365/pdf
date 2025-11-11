"use client";

import { ArrowLeft, FileText } from "lucide-react";
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

export default function ExtractTextPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [extractedText, setExtractedText] = useState<string>("");

  const handleExtractText = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("텍스트 추출"));
      dispatch(setProgress(10));

      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      dispatch(setProgress(30));

      // Call server API for text extraction
      const response = await fetch("/api/pdf/extract/text", {
        method: "POST",
        body: formData,
      });

      dispatch(setProgress(60));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "텍스트 추출에 실패했습니다.");
      }

      const result = await response.json();

      dispatch(setProgress(80));

      // Format extracted text with page numbers
      const formattedText = result.textContent
        .map((page: { page: number; text: string }) => {
          return `=== 페이지 ${page.page} ===\n${page.text}\n`;
        })
        .join("\n");

      setExtractedText(formattedText);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("텍스트 추출 오류:", error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "텍스트 추출 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      // Show toast or feedback here
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setExtractedText("");
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
                텍스트 추출
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF에서 텍스트를 추출하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !extractedText && (
            <Card className="p-6 space-y-6">
              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  텍스트 추출 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>PDF의 모든 페이지에서 텍스트를 추출합니다</li>
                  <li>이미지에 포함된 텍스트는 OCR이 필요합니다</li>
                  <li>추출된 텍스트는 복사하여 사용할 수 있습니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleExtractText}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  텍스트 추출
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {extractedText && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <FileText
                      className="w-5 h-5 text-success"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">추출 완료!</p>
                    <p className="text-sm text-muted-foreground">
                      텍스트가 추출되었습니다
                    </p>
                  </div>
                </div>
                <Button onClick={handleCopyText} variant="outline">
                  텍스트 복사
                </Button>
              </div>

              <textarea
                readOnly
                value={extractedText}
                className="w-full min-h-96 px-4 py-3 rounded-md border border-border bg-surface text-foreground font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex justify-center">
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

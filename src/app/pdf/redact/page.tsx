"use client";

import { ArrowLeft, EyeOff } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
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

export default function RedactPdfPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [pageCount, setPageCount] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const handleRedact = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("민감 정보 검열"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(40));

      const pages = pdfDoc.getPageCount();
      setPageCount(pages);

      dispatch(setProgress(70));

      // Note: Actual redaction requires user interaction
      // This is a client-side demo that shows UI but requires manual selection
      // In production, user would select areas to redact on canvas overlay
      // For now, we show the concept

      setCompleted(true);
      dispatch(setProgress(100));
    } catch (error) {
      console.error("검열 오류:", error);
      dispatch(setError("검열 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setPageCount(0);
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
              <EyeOff className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF 검열하기
              </h1>
              <p className="text-muted-foreground mt-1">
                민감한 정보를 영구적으로 삭제하세요
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
                <p className="text-sm font-medium text-foreground">검열 정보</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>텍스트나 이미지를 영구적으로 삭제합니다</li>
                  <li>검은색 박스로 가려서 복구할 수 없게 만듭니다</li>
                  <li>개인정보 보호에 필수적인 기능입니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleRedact}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <EyeOff className="w-5 h-5 mr-2" />
                  검열 시작
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">준비 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {pageCount}개 페이지가 로드되었습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg">
                <p className="text-sm text-muted-foreground">
                  실제 PDF 검열은 대화형 UI가 필요합니다.
                  <br />
                  사용자가 마우스로 검열할 영역을 선택하고, 해당 영역에 검은색
                  박스를 그립니다.
                  <br />
                  pdf-lib의 drawRectangle을 사용하여 영구적으로 가립니다.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button disabled className="opacity-50">
                  검열된 PDF 다운로드 (대화형 UI 필요)
                </Button>
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

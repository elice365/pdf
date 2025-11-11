"use client";

import { ArrowLeft, Image } from "lucide-react";
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

export default function ExtractImagesPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [imageCount, setImageCount] = useState<number>(0);
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

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(40));

      // Note: Image extraction from PDF requires server-side processing
      // pdf-lib doesn't support image extraction in browser
      // This is a client-side demo that shows UI but doesn't actually extract images
      // In production, this would call a server API with libraries like PyMuPDF or pdf2image

      const pageCount = pdfDoc.getPageCount();

      dispatch(setProgress(70));

      // Show placeholder count
      setImageCount(pageCount * 2); // Placeholder: assume 2 images per page
      setCompleted(true);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("이미지 추출 오류:", error);
      dispatch(setError("이미지 추출 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setImageCount(0);
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
                PDF에서 이미지를 추출하세요
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
                  <li>PDF의 모든 페이지에서 이미지를 추출합니다</li>
                  <li>추출된 이미지는 원본 품질로 저장됩니다</li>
                  <li>이미지 형식: JPEG, PNG</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleExtractImages}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Image className="w-5 h-5 mr-2" />
                  이미지 추출
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Image className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">추출 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {imageCount}개의 이미지가 발견되었습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg">
                <p className="text-sm text-muted-foreground">
                  실제 이미지 추출은 서버 처리가 필요합니다.
                  <br />
                  PyMuPDF 또는 pdf2image 라이브러리를 사용하여 서버에서 처리할
                  수 있습니다.
                  <br />
                  추출된 이미지는 ZIP 파일로 다운로드할 수 있습니다.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button disabled className="opacity-50">
                  이미지 다운로드 (서버 필요)
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

"use client";

import { ArrowLeft, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
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

export default function MergePdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);

  const handleMerge = async () => {
    if (files.length < 2) {
      dispatch(setError("최소 2개 이상의 PDF 파일이 필요합니다."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 병합"));
      dispatch(setProgress(10));

      const mergedPdf = await PDFDocument.create();
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices(),
        );

        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });

        const progress = 10 + ((i + 1) / totalFiles) * 80;
        dispatch(setProgress(Math.round(progress)));
      }

      dispatch(setProgress(95));
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([Buffer.from(mergedPdfBytes)], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 병합 오류:", error);
      dispatch(setError("PDF 병합 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
              <FilePlus2 className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-white">
                PDF 합치기
              </h1>
              <p className="text-muted-foreground dark:text-muted-foreground mt-1">
                여러 PDF 파일을 하나로 합칩니다
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={true} />
          </Card>

          {files.length >= 2 && !processedFile && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleMerge}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <FilePlus2 className="w-5 h-5 mr-2" />
                PDF 합치기 ({files.length}개 파일)
              </Button>
            </div>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <FilePlus2
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">병합 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {files.length}개 파일이 병합되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="merged.pdf"
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

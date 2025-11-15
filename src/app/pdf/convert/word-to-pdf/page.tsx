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

export default function WordToPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("Word 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("Word를 PDF로 변환"));
      dispatch(setProgress(10));

      // Dynamically import libraries
      const mammoth = (await import("mammoth")).default;
      const jsPDF = (await import("jspdf")).default;

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(20));

      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      const messages = result.messages;

      // Log any conversion warnings
      if (messages.length > 0) {
        console.warn("Mammoth conversion warnings:", messages);
      }

      dispatch(setProgress(50));

      // Create PDF from HTML
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Convert HTML to PDF
      await new Promise<void>((resolve, reject) => {
        doc.html(html, {
          callback: () => {
            resolve();
          },
          x: 10,
          y: 10,
          width: 190, // A4 width minus margins
          windowWidth: 800,
          html2canvas: {
            scale: 0.264583, // Convert px to mm (1/96*25.4)
          },
        });
      });

      dispatch(setProgress(90));

      // Save as Blob
      const pdfBlob = doc.output("blob");
      dispatch(setProcessedFile(pdfBlob));

      dispatch(setProgress(100));
    } catch (error) {
      console.error("Word to PDF 변환 오류:", error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "Word to PDF 변환 중 오류가 발생했습니다.",
        ),
      );
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
                Word를 PDF로
              </h1>
              <p className="text-muted-foreground mt-1">
                Word 문서를 PDF로 변환하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload
              multiple={false}
              accept={{
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
              }}
            />
          </Card>

          {files.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  변환 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Word 문서(.docx)를 PDF로 변환합니다</li>
                  <li>텍스트 서식과 기본 레이아웃이 유지됩니다</li>
                  <li>이미지와 테이블이 포함됩니다</li>
                  <li>
                    복잡한 레이아웃은 일부 손실될 수 있습니다 (클라이언트 처리)
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileText className="w-5 h-5 mr-2" />
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
                  <FileText
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">변환 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    Word가 PDF로 변환되었습니다
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

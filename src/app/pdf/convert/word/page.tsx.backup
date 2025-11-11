"use client";

import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import * as pdfjsLib from "pdfjs-dist";
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

// PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(20));

      // PDF 문서 로드
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      dispatch(setProgress(30));

      const totalPages = pdfDoc.numPages;
      const paragraphs: Paragraph[] = [];

      // 각 페이지에서 텍스트 추출
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        dispatch(setProgress(30 + (pageNum / totalPages) * 50));

        // 페이지 번호 헤더 추가
        paragraphs.push(
          new Paragraph({
            text: `--- 페이지 ${pageNum} ---`,
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 200,
              after: 100,
            },
          }),
        );

        // 텍스트 아이템들을 그룹화하여 단락 생성
        const lines: string[] = [];
        let currentLine = "";
        let lastY = 0;

        for (const item of textContent.items) {
          if ("str" in item && "transform" in item) {
            const y = item.transform[5];
            const text = item.str;

            // 새로운 줄인지 확인 (y 좌표가 크게 변경됨)
            if (lastY !== 0 && Math.abs(y - lastY) > 5) {
              if (currentLine.trim()) {
                lines.push(currentLine.trim());
              }
              currentLine = text;
            } else {
              // 같은 줄에 있는 텍스트
              if (currentLine) {
                currentLine += " " + text;
              } else {
                currentLine = text;
              }
            }

            lastY = y;
          }
        }

        // 마지막 줄 추가
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }

        // 각 줄을 단락으로 추가
        for (const line of lines) {
          if (line.trim()) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    font: quality === "high" ? "맑은 고딕" : undefined,
                  }),
                ],
                spacing: {
                  after: 120,
                },
              }),
            );
          }
        }

        // 페이지 사이에 간격 추가
        if (pageNum < totalPages) {
          paragraphs.push(new Paragraph({ text: "" }));
        }
      }

      dispatch(setProgress(85));

      // Word 문서 생성
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      dispatch(setProgress(90));

      // Word 문서를 Blob으로 변환
      const blob = await Packer.toBlob(doc);

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
            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-500">✓</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground mb-1">
                브라우저 기반 변환
              </h3>
              <p className="text-xs text-muted-foreground">
                이 도구는 브라우저에서 직접 PDF 텍스트를 추출하여 Word 문서로
                변환합니다. 복잡한 레이아웃이나 이미지는 텍스트만 추출됩니다.
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

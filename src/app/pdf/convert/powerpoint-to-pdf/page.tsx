"use client";

import { ArrowLeft, Presentation } from "lucide-react";
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

export default function PowerPointToPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [slideCount, setSlideCount] = useState<number>(0);

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("PowerPoint 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PowerPoint를 PDF로 변환"));
      dispatch(setProgress(10));

      // Dynamically import libraries
      const JSZip = (await import("jszip")).default;
      const jsPDF = (await import("jspdf")).default;

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(20));

      // PPTX is a ZIP file
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Extract slide XML files
      const slideFiles: string[] = [];
      zip.folder("ppt/slides")?.forEach((relativePath, file) => {
        if (relativePath.match(/slide\d+\.xml$/)) {
          slideFiles.push(relativePath);
        }
      });

      // Sort slides by number
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0");
        const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0");
        return numA - numB;
      });

      setSlideCount(slideFiles.length);

      dispatch(setProgress(40));

      // Create PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [297, 210], // A4 landscape
      });

      // Extract text from each slide
      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = zip.folder("ppt/slides")?.file(slideFiles[i]);
        if (!slideFile) continue;

        const xmlContent = await slideFile.async("string");

        // Simple text extraction (extract content between <a:t> tags)
        const textMatches = xmlContent.matchAll(/<a:t>([^<]*)<\/a:t>/g);
        const texts: string[] = [];
        for (const match of textMatches) {
          if (match[1] && match[1].trim()) {
            texts.push(match[1].trim());
          }
        }

        // Add new page for each slide except first
        if (i > 0) {
          doc.addPage();
        }

        // Add slide title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(`Slide ${i + 1}`, 148.5, 15, { align: "center" });

        // Add slide content
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        let y = 40;
        const lineHeight = 7;
        const maxWidth = 260;

        for (const text of texts) {
          // Split long text into multiple lines
          const lines = doc.splitTextToSize(text, maxWidth);
          for (const line of lines) {
            if (y > 190) break; // Prevent overflow
            doc.text(line, 20, y);
            y += lineHeight;
          }
          y += 2; // Extra space between paragraphs
          if (y > 190) break;
        }

        const progress = 40 + ((i + 1) / slideFiles.length) * 50;
        dispatch(setProgress(Math.round(progress)));
      }

      dispatch(setProgress(95));

      // Save as Blob
      const pdfBlob = doc.output("blob");
      dispatch(setProcessedFile(pdfBlob));

      dispatch(setProgress(100));
    } catch (error) {
      console.error("PowerPoint to PDF 변환 오류:", error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "PowerPoint to PDF 변환 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setSlideCount(0);
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
              <Presentation
                className="w-6 h-6 text-primary"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PowerPoint를 PDF로
              </h1>
              <p className="text-muted-foreground mt-1">
                PowerPoint 프레젠테이션을 PDF로 변환하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload
              multiple={false}
              accept={{
                "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                  [".pptx"],
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
                  <li>
                    PowerPoint 프레젠테이션(.pptx)을 PDF로 변환합니다
                  </li>
                  <li>각 슬라이드가 PDF의 한 페이지가 됩니다</li>
                  <li>텍스트 콘텐츠가 추출되어 변환됩니다</li>
                  <li>
                    이미지, 차트, 애니메이션은 변환되지 않습니다 (텍스트만)
                  </li>
                  <li>
                    복잡한 레이아웃은 단순화됩니다 (클라이언트 처리)
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Presentation className="w-5 h-5 mr-2" />
                  PDF로 변환
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Presentation
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">변환 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {slideCount}개의 슬라이드가 PDF로 변환되었습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>참고:</strong> 텍스트 콘텐츠만 변환되었습니다.
                  완벽한 레이아웃 보존을 위해서는 PowerPoint 자체 내보내기
                  기능을 사용하세요.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <DownloadButton
                  filename="converted.pdf"
                  className="flex-1 sm:flex-initial max-w-xs"
                />
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial max-w-xs"
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

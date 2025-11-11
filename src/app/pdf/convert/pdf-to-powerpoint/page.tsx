"use client";

import { ArrowLeft, Presentation, Download } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pptxgen from "pptxgenjs";
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

// PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToPowerPointPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [pageCount, setPageCount] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [pptxBlob, setPptxBlob] = useState<Blob | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF를 PowerPoint로 변환"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(20));

      // PDF 문서 로드
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      dispatch(setProgress(30));

      const totalPages = pdfDoc.numPages;
      setPageCount(totalPages);

      // PowerPoint 프레젠테이션 생성
      const ppt = new pptxgen();

      // 각 페이지를 이미지로 변환하여 슬라이드에 추가
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);

        dispatch(setProgress(30 + (pageNum / totalPages) * 60));

        // 페이지를 캔버스로 렌더링
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas context not available");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // 캔버스를 이미지 데이터로 변환
        const imageData = canvas.toDataURL("image/png");

        // 슬라이드 추가
        const slide = ppt.addSlide();

        // 이미지를 슬라이드에 추가 (전체 슬라이드 크기)
        slide.addImage({
          data: imageData,
          x: 0,
          y: 0,
          w: "100%",
          h: "100%",
        });
      }

      dispatch(setProgress(95));

      // PowerPoint 파일 생성
      const blob = await ppt.write({ outputType: "blob" }) as Blob;

      setPptxBlob(blob);
      setCompleted(true);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF to PowerPoint 변환 오류:", error);
      dispatch(setError("PDF to PowerPoint 변환 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleDownload = () => {
    if (!pptxBlob) return;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(pptxBlob);
    link.download = files[0]?.name.replace(/\.pdf$/i, ".pptx") || "converted.pptx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    dispatch(resetState());
    setPageCount(0);
    setCompleted(false);
    setPptxBlob(null);
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
                PDF를 PPT로
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF 문서를 PowerPoint 프레젠테이션으로 변환하세요
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
                  PowerPoint 변환 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>PDF의 각 페이지가 PowerPoint 슬라이드로 변환됩니다</li>
                  <li>레이아웃과 서식이 최대한 보존됩니다</li>
                  <li>이미지와 텍스트가 편집 가능한 형태로 변환됩니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Presentation className="w-5 h-5 mr-2" />
                  PowerPoint로 변환
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Presentation
                    className="w-5 h-5 text-green-500"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">변환 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {pageCount}개의 슬라이드가 생성되었습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg">
                <p className="text-sm text-muted-foreground">
                  PDF의 각 페이지가 이미지로 변환되어 PowerPoint 슬라이드에 추가되었습니다.
                  <br />
                  슬라이드는 PPTX 형식으로 저장됩니다.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  PowerPoint 다운로드
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

"use client";

import { ArrowLeft, PenTool } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";
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

export default function SignPdfPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    if (!hasSignature) {
      dispatch(setError("서명을 먼저 입력해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("서명 추가"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      // Convert signature canvas to PNG
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");

      const signatureDataUrl = canvas.toDataURL("image/png");
      const signatureImageBytes = await fetch(signatureDataUrl).then((res) =>
        res.arrayBuffer(),
      );

      dispatch(setProgress(50));

      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Add signature to bottom right of first page
      const { width } = firstPage.getSize();
      const signatureWidth = 150;
      const signatureHeight = 50;

      firstPage.drawImage(signatureImage, {
        x: width - signatureWidth - 50,
        y: 50,
        width: signatureWidth,
        height: signatureHeight,
      });

      dispatch(setProgress(80));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("서명 추가 오류:", error);
      dispatch(setError("서명 추가 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "signed.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl("");
    }
    clearSignature();
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
              <PenTool className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF 서명하기
              </h1>
              <p className="text-muted-foreground mt-1">
                전자 서명을 추가하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !pdfUrl && (
            <Card className="p-6 space-y-6">
              {/* Signature Canvas */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">서명 입력</p>
                <div className="border-2 border-dashed border-border rounded-lg bg-surface">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  disabled={!hasSignature}
                >
                  서명 지우기
                </Button>
              </div>

              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">서명 정보</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>마우스로 위 영역에 서명을 그려주세요</li>
                  <li>서명은 PDF 첫 페이지 하단에 추가됩니다</li>
                  <li>전자 서명으로 문서의 진위를 보증합니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleSign}
                  disabled={!hasSignature}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <PenTool className="w-5 h-5 mr-2" />
                  서명 추가
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {pdfUrl && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <PenTool
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">서명 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    PDF에 전자 서명이 추가되었습니다
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={handleDownload}>PDF 다운로드</Button>
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

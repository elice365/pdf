"use client";

import { ArrowLeft, Scissors } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
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

type SplitMode = "pages" | "range";

export default function SplitPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [splitMode, setSplitMode] = useState<SplitMode>("pages");
  const [pageNumbers, setPageNumbers] = useState<string>("");
  const [startPage, setStartPage] = useState<string>("1");
  const [endPage, setEndPage] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleFileLoad = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdf.getPageCount());
      setEndPage(pdf.getPageCount().toString());
    } catch (error) {
      console.error("PDF 로드 오류:", error);
      dispatch(setError("PDF 파일을 읽을 수 없습니다."));
    }
  };

  const handleSplit = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 분할"));
      dispatch(setProgress(10));

      const file = files[0];
      await handleFileLoad(file);
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);

      const pagesToExtract: number[] = [];

      if (splitMode === "pages") {
        const pages = pageNumbers
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== "");

        for (const page of pages) {
          if (page.includes("-")) {
            const [start, end] = page
              .split("-")
              .map((n) => parseInt(n.trim(), 10));
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= originalPdf.getPageCount()) {
                pagesToExtract.push(i - 1);
              }
            }
          } else {
            const pageNum = parseInt(page, 10);
            if (pageNum >= 1 && pageNum <= originalPdf.getPageCount()) {
              pagesToExtract.push(pageNum - 1);
            }
          }
        }
      } else {
        const start = parseInt(startPage, 10);
        const end = parseInt(endPage, 10);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= originalPdf.getPageCount()) {
            pagesToExtract.push(i - 1);
          }
        }
      }

      if (pagesToExtract.length === 0) {
        dispatch(setError("유효한 페이지 번호를 입력해주세요."));
        dispatch(setProcessing(false));
        return;
      }

      dispatch(setProgress(30));

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(originalPdf, pagesToExtract);

      dispatch(setProgress(60));

      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      dispatch(setProgress(90));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([Buffer.from(pdfBytes)], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 분할 오류:", error);
      dispatch(setError("PDF 분할 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setPageNumbers("");
    setStartPage("1");
    setEndPage("");
    setTotalPages(0);
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
              <Scissors className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDF 나누기</h1>
              <p className="text-muted-foreground mt-1">
                PDF에서 원하는 페이지만 추출합니다
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              {totalPages > 0 && (
                <div className="text-sm text-muted-foreground">
                  총 {totalPages}페이지
                </div>
              )}

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={splitMode === "pages" ? "default" : "outline"}
                    onClick={() => setSplitMode("pages")}
                    className="flex-1"
                  >
                    페이지 선택
                  </Button>
                  <Button
                    variant={splitMode === "range" ? "default" : "outline"}
                    onClick={() => setSplitMode("range")}
                    className="flex-1"
                  >
                    범위 지정
                  </Button>
                </div>

                {splitMode === "pages" ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="pageNumbers"
                      className="text-sm font-medium"
                    >
                      페이지 번호
                    </label>
                    <input
                      id="pageNumbers"
                      type="text"
                      value={pageNumbers}
                      onChange={(e) => setPageNumbers(e.target.value)}
                      placeholder="예: 1,3,5-7,10"
                      className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      쉼표로 구분하거나 범위를 지정하세요 (예: 1,3,5-7)
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="startPage"
                        className="text-sm font-medium"
                      >
                        시작 페이지
                      </label>
                      <input
                        id="startPage"
                        type="number"
                        value={startPage}
                        onChange={(e) => setStartPage(e.target.value)}
                        min="1"
                        max={totalPages}
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="endPage" className="text-sm font-medium">
                        끝 페이지
                      </label>
                      <input
                        id="endPage"
                        type="number"
                        value={endPage}
                        onChange={(e) => setEndPage(e.target.value)}
                        min="1"
                        max={totalPages}
                        className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleSplit}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Scissors className="w-5 h-5 mr-2" />
                  PDF 분할하기
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Scissors
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">분할 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    페이지가 추출되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="split.pdf"
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

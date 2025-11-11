"use client";

import { ArrowDown, ArrowLeft, ArrowUp, Grid3x3, Trash2 } from "lucide-react";
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

interface PageItem {
  originalIndex: number;
  currentPosition: number;
  isDeleted: boolean;
}

export default function OrganizePdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleFileLoad = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      setTotalPages(pageCount);

      // Initialize pages array
      const initialPages: PageItem[] = Array.from(
        { length: pageCount },
        (_, i) => ({
          originalIndex: i,
          currentPosition: i,
          isDeleted: false,
        }),
      );
      setPages(initialPages);
    } catch (error) {
      console.error("PDF 로드 오류:", error);
      dispatch(setError("PDF 파일을 읽을 수 없습니다."));
    }
  };

  // Load file when uploaded
  if (files.length > 0 && pages.length === 0 && !processedFile) {
    handleFileLoad(files[0]);
  }

  const movePageUp = (index: number) => {
    if (index === 0) return;

    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [
      newPages[index],
      newPages[index - 1],
    ];
    setPages(newPages);
  };

  const movePageDown = (index: number) => {
    if (index === pages.length - 1) return;

    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [
      newPages[index + 1],
      newPages[index],
    ];
    setPages(newPages);
  };

  const deletePage = (index: number) => {
    const newPages = [...pages];
    newPages[index].isDeleted = true;
    setPages(newPages);
  };

  const undeletePage = (index: number) => {
    const newPages = [...pages];
    newPages[index].isDeleted = false;
    setPages(newPages);
  };

  const handleOrganize = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    const activePages = pages.filter((p) => !p.isDeleted);
    if (activePages.length === 0) {
      dispatch(setError("최소 1개 이상의 페이지가 필요합니다."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 페이지 정리"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      const newPdf = await PDFDocument.create();

      // Copy pages in new order, skipping deleted pages
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page.isDeleted) {
          const [copiedPage] = await newPdf.copyPages(originalPdf, [
            page.originalIndex,
          ]);
          newPdf.addPage(copiedPage);
        }

        const progress = 30 + ((i + 1) / pages.length) * 60;
        dispatch(setProgress(Math.round(progress)));
      }

      dispatch(setProgress(95));

      const organizedBytes = await newPdf.save();
      const blob = new Blob([Buffer.from(organizedBytes)], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 페이지 정리 오류:", error);
      dispatch(setError("PDF 페이지 정리 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setPages([]);
    setTotalPages(0);
  };

  const activePageCount = pages.filter((p) => !p.isDeleted).length;

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
              <Grid3x3 className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF 페이지 정리
              </h1>
              <p className="text-muted-foreground mt-1">
                페이지를 재정렬하거나 삭제하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && pages.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  페이지 관리 (총 {totalPages}페이지 / 활성 {activePageCount}
                  페이지)
                </h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pages.map((page, index) => (
                  <Card
                    key={`page-${page.originalIndex}`}
                    className={`p-4 flex items-center gap-4 ${page.isDeleted ? "opacity-50 bg-surface" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        페이지 {page.originalIndex + 1}
                        {page.isDeleted && (
                          <span className="ml-2 text-xs text-destructive">
                            (삭제 예정)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        현재 위치: {index + 1}
                      </p>
                    </div>

                    {!page.isDeleted && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => movePageUp(index)}
                          disabled={index === 0}
                          aria-label="위로 이동"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => movePageDown(index)}
                          disabled={index === pages.length - 1}
                          aria-label="아래로 이동"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => deletePage(index)}
                          className="text-destructive hover:text-destructive"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {page.isDeleted && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => undeletePage(index)}
                      >
                        복원
                      </Button>
                    )}
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleOrganize}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={activePageCount === 0}
                >
                  <Grid3x3 className="w-5 h-5 mr-2" />
                  페이지 정리 적용
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Grid3x3
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">정리 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    페이지가 재정렬되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="organized.pdf"
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

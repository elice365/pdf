"use client";

import {
  ArrowLeft,
  ClipboardCopy,
  Download,
  FileText,
  ScanText,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { FileUpload } from "@/components/pdf/file-upload";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetState,
  setError,
  setOperation,
  setProcessing,
  setProgress,
} from "@/store/slices/pdfSlice";

const LANGUAGE_OPTIONS = [
  { value: "kor+eng", label: "한국어 + 영어" },
  { value: "eng", label: "영어" },
  { value: "kor", label: "한국어" },
  { value: "jpn+eng", label: "일본어 + 영어" },
  { value: "chi_sim+eng", label: "중국어(간체) + 영어" },
];

const DEFAULT_LANGUAGE = LANGUAGE_OPTIONS[0]?.value ?? "kor+eng";
const PDF_WORKER_SRC = "/pdf.worker.min.mjs";
const PDF_RENDER_SCALE = 2;
const TESSERACT_ASSETS = {
  workerPath:
    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
  corePath:
    "https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js",
  langPath: "https://tessdata.projectnaptha.com/4.0.0",
};

interface OcrPageResult {
  page: number;
  text: string;
  confidence: number;
}

interface OcrResponse {
  success: boolean;
  totalPages: number;
  processedPages: number;
  language: string;
  averageConfidence: number;
  text: string;
  pages: OcrPageResult[];
}

type PdfJsLib = typeof import("pdfjs-dist/legacy/build/pdf");

async function loadPdfjs(): Promise<PdfJsLib> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  }
  return pdfjsLib;
}

async function renderPageToCanvas(page: PDFPageProxy, scale = PDF_RENDER_SCALE) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D 컨텍스트를 초기화할 수 없습니다.");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}

export default function OcrPdfPage() {
  const dispatch = useAppDispatch();
  const { files, isProcessing } = useAppSelector((state) => state.pdf);

  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [pageLimit, setPageLimit] = useState<string>("");
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null);
  const [copyLabel, setCopyLabel] = useState<string>("텍스트 복사");

  const totalTextLength = useMemo(() => {
    if (!ocrResult?.text) return 0;
    return ocrResult.text.length;
  }, [ocrResult]);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    const numericPageLimit = pageLimit ? Number.parseInt(pageLimit, 10) : null;
    if (numericPageLimit !== null && (Number.isNaN(numericPageLimit) || numericPageLimit <= 0)) {
      dispatch(setError("페이지 제한은 1 이상의 숫자여야 합니다."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("OCR 처리"));
      dispatch(setProgress(5));

      const file = files[0];
      const pdfjsLib = await loadPdfjs();
      dispatch(setProgress(15));

      const arrayBuffer = await file.arrayBuffer();
      dispatch(setProgress(25));

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      dispatch(setProgress(30));

      const { createWorker } = await import("tesseract.js");
      let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

      try {
        worker = await createWorker(language, undefined, {
          ...TESSERACT_ASSETS,
          logger: ({ status, progress }) => {
            if (status === "recognizing text") {
              const value = 30 + progress * 40;
              dispatch(setProgress(Math.min(85, Math.round(value))));
            }
          },
        });

        const totalPages = pdf.numPages;
        const pagesToProcess = numericPageLimit
          ? Math.min(numericPageLimit, totalPages)
          : totalPages;

        const pageResults: OcrPageResult[] = [];

        for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const canvas = await renderPageToCanvas(page);
          const { data } = await worker.recognize(canvas);

          pageResults.push({
            page: pageNum,
            text: data.text.trim(),
            confidence: Number(data.confidence.toFixed(2)),
          });

          canvas.width = 0;
          canvas.height = 0;
          canvas.remove();

          const progressValue = 70 + (pageNum / pagesToProcess) * 20;
          dispatch(setProgress(Math.min(95, Math.round(progressValue))));
        }

        const combinedText = pageResults
          .map((entry) => `=== 페이지 ${entry.page} ===\n${entry.text}`)
          .join("\n\n");

        const averageConfidence =
          pageResults.reduce((acc, current) => acc + current.confidence, 0) /
          (pageResults.length || 1);

        const result: OcrResponse = {
          success: true,
          totalPages,
          processedPages: pageResults.length,
          language,
          averageConfidence: Number(averageConfidence.toFixed(2)),
          text: combinedText,
          pages: pageResults,
        };

        setOcrResult(result);
        setCopyLabel("텍스트 복사");
        dispatch(setProgress(100));
      } finally {
        if (worker) {
          await worker.terminate();
        }
      }
    } catch (error) {
      console.error("OCR 분석 오류:", error);
      dispatch(
        setError(
          error instanceof Error ? error.message : "OCR 처리 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleCopyText = async () => {
    if (!ocrResult?.text) return;
    try {
      await navigator.clipboard.writeText(ocrResult.text);
      setCopyLabel("복사 완료!");
      setTimeout(() => setCopyLabel("텍스트 복사"), 2000);
    } catch (error) {
      console.error("텍스트 복사 실패:", error);
    }
  };

  const handleDownloadText = () => {
    if (!ocrResult?.text) return;
    const blob = new Blob([ocrResult.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${files[0]?.name?.replace(/\.pdf$/i, "") || "ocr-result"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setOcrResult(null);
    setLanguage(DEFAULT_LANGUAGE);
    setPageLimit("");
    setCopyLabel("텍스트 복사");
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
              <ScanText className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">OCR PDF</h1>
              <p className="text-muted-foreground mt-1">
                이미지 기반 PDF를 검색 가능한 텍스트로 변환하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !ocrResult && (
            <Card className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">인식 언어</Label>
                  <div className="relative">
                    <select
                      id="language"
                      value={language}
                      onChange={(event) => setLanguage(event.target.value)}
                      className="w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={isProcessing}
                    >
                      {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                      v
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    여러 언어를 동시에 인식해야 한다면 `+`로 연결된 옵션을 선택하세요.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page-limit">처리할 페이지 수 (선택)</Label>
                  <Input
                    id="page-limit"
                    type="number"
                    min={1}
                    placeholder="전체 페이지"
                    value={pageLimit}
                    onChange={(event) => setPageLimit(event.target.value)}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    긴 문서라면 앞부분 일부만 처리하여 속도를 높일 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">OCR 안내</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>스캔된 문서, 이미지 PDF, 팩스 등에서 텍스트 추출</li>
                  <li>다국어 인식 지원 (언어 선택)</li>
                  <li>결과는 복사하거나 .txt 파일로 다운로드할 수 있습니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isProcessing}
                >
                  <ScanText className="w-5 h-5 mr-2" />
                  OCR 실행
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {ocrResult && (
            <Card className="p-6 space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <ScanText className="w-5 h-5 text-success" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">OCR 완료!</p>
                    <p className="text-sm text-muted-foreground">
                      {ocrResult.processedPages} / {ocrResult.totalPages} 페이지 인식
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleCopyText} className="flex items-center gap-2">
                    <ClipboardCopy className="w-4 h-4" />
                    {copyLabel}
                  </Button>
                  <Button variant="outline" onClick={handleDownloadText} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    텍스트 다운로드
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
                    다시 시작
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4 bg-background">
                  <p className="text-xs text-muted-foreground">평균 신뢰도</p>
                  <p className="text-2xl font-bold text-foreground">
                    {ocrResult.averageConfidence}%
                  </p>
                </Card>
                <Card className="p-4 bg-background">
                  <p className="text-xs text-muted-foreground">선택 언어</p>
                  <p className="text-sm font-medium text-foreground break-words">
                    {ocrResult.language}
                  </p>
                </Card>
                <Card className="p-4 bg-background">
                  <p className="text-xs text-muted-foreground">텍스트 길이</p>
                  <p className="text-2xl font-bold text-foreground">{totalTextLength.toLocaleString()}자</p>
                </Card>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">인식된 텍스트</p>
                <textarea
                  readOnly
                  value={ocrResult.text}
                  className="w-full min-h-96 px-4 py-3 rounded-md border border-border bg-surface text-foreground font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">페이지별 결과</p>
                <div className="space-y-3">
                  {ocrResult.pages.map((page) => (
                    <Card key={page.page} className="p-4 bg-background">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">페이지 {page.page}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          신뢰도 {page.confidence}%
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {page.text || "인식된 텍스트가 없습니다."}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { ArrowLeft, FileCheck } from "lucide-react";
import Link from "next/link";
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

interface ComparisonResult {
  file1: {
    name: string;
    pages: number;
    textLength: number;
    text: string;
  };
  file2: {
    name: string;
    pages: number;
    textLength: number;
    text: string;
  };
  comparison: {
    pageCountMatch: boolean;
    textSimilarity: number;
    identical: boolean;
    differences: Array<{
      type: "equal" | "insert" | "delete";
      text: string;
    }>;
  };
}

export default function ComparePdfPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [showDiff, setShowDiff] = useState<boolean>(false);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      const lines: string[] = [];
      let currentLine = "";
      let lastY = 0;

      for (const item of textContent.items) {
        if ("str" in item && "transform" in item) {
          const y = item.transform[5];
          const text = item.str;

          if (lastY !== 0 && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
            }
            currentLine = text;
          } else {
            currentLine = currentLine ? `${currentLine} ${text}` : text;
          }
          lastY = y;
        }
      }

      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }

      pageTexts.push(lines.join("\n"));
    }

    return pageTexts.join("\n\n");
  };

  const calculateSimilarity = (text1: string, text2: string): number => {
    if (text1 === text2) return 100;

    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;

    if (longer.length === 0) return 100;

    // Levenshtein distance
    const editDistance = (s1: string, s2: string): number => {
      const costs: number[] = [];
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
        if (i > 0) {
          costs[s2.length] = lastValue;
        }
      }
      return costs[s2.length];
    };

    const distance = editDistance(shorter, longer);
    return Math.round(((longer.length - distance) / longer.length) * 100);
  };

  const createDiff = async (
    text1: string,
    text2: string,
  ): Promise<Array<{ type: "equal" | "insert" | "delete"; text: string }>> => {
    const DiffMatchPatch = (await import("diff-match-patch")).default;
    const dmp = new DiffMatchPatch();

    const diffs = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(diffs);

    return diffs.map((diff) => ({
      type:
        diff[0] === 0 ? "equal" : diff[0] === 1 ? "insert" : ("delete" as const),
      text: diff[1],
    }));
  };

  const handleCompare = async () => {
    if (files.length !== 2) {
      dispatch(setError("비교할 PDF 파일 2개를 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 비교"));
      dispatch(setProgress(10));

      // Extract text from first PDF
      const text1 = await extractTextFromPdf(files[0]);
      dispatch(setProgress(35));

      // Extract text from second PDF
      const text2 = await extractTextFromPdf(files[1]);
      dispatch(setProgress(60));

      // Calculate similarity
      const similarity = calculateSimilarity(text1, text2);
      dispatch(setProgress(75));

      // Create detailed diff
      const differences = await createDiff(text1, text2);
      dispatch(setProgress(90));

      // Get page counts using pdfjs-dist
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const pdf1 = await pdfjsLib
        .getDocument({ data: await files[0].arrayBuffer() })
        .promise;
      const pdf2 = await pdfjsLib
        .getDocument({ data: await files[1].arrayBuffer() })
        .promise;

      const result: ComparisonResult = {
        file1: {
          name: files[0].name,
          pages: pdf1.numPages,
          textLength: text1.length,
          text: text1,
        },
        file2: {
          name: files[1].name,
          pages: pdf2.numPages,
          textLength: text2.length,
          text: text2,
        },
        comparison: {
          pageCountMatch: pdf1.numPages === pdf2.numPages,
          textSimilarity: similarity,
          identical: text1 === text2,
          differences,
        },
      };

      setResult(result);
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 비교 오류:", error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "PDF 비교 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    setResult(null);
    setShowDiff(false);
    dispatch(resetState());
  };

  const renderDiff = () => {
    if (!result || !showDiff) return null;

    // Only show first 50 differences to prevent UI lag
    const limitedDiffs = result.comparison.differences.slice(0, 50);
    const hasMore = result.comparison.differences.length > 50;

    return (
      <div className="p-4 bg-surface rounded-lg mt-4 max-h-96 overflow-y-auto">
        <h3 className="font-medium text-foreground mb-3 sticky top-0 bg-surface pb-2">
          텍스트 차이점 ({result.comparison.differences.length}개 변경사항)
        </h3>
        <div className="space-y-1 text-sm font-mono">
          {limitedDiffs.map((diff, index) => (
            <div
              key={index}
              className={`px-2 py-1 rounded ${
                diff.type === "equal"
                  ? "bg-transparent"
                  : diff.type === "insert"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"
                    : "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 line-through"
              }`}
            >
              {diff.type === "equal"
                ? diff.text.substring(0, 100) +
                  (diff.text.length > 100 ? "..." : "")
                : diff.text}
            </div>
          ))}
          {hasMore && (
            <div className="text-center text-muted-foreground py-2">
              ... 및 {result.comparison.differences.length - 50}개 더
            </div>
          )}
        </div>
      </div>
    );
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
              <FileCheck className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDF 비교</h1>
              <p className="text-muted-foreground mt-1">
                두 개의 PDF 파일을 비교하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={true} />
            <p className="text-sm text-muted-foreground mt-2">
              비교를 위해 2개의 PDF 파일을 업로드해주세요
            </p>
          </Card>

          {files.length === 2 && !result && (
            <Card className="p-6">
              <div className="p-4 bg-surface rounded-lg space-y-2 mb-6">
                <p className="text-sm font-medium text-foreground">비교 정보</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>페이지 수를 비교합니다</li>
                  <li>텍스트 유사도를 계산합니다 (Levenshtein 거리)</li>
                  <li>차이점을 상세히 확인할 수 있습니다</li>
                  <li>완전히 클라이언트에서 처리됩니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleCompare}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileCheck className="w-5 h-5 mr-2" />
                  비교 시작
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {result && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <FileCheck
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">비교 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    두 PDF의 차이점을 확인하세요
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-surface rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">
                    첫 번째 PDF
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    파일명: {result.file1.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    페이지 수: {result.file1.pages}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    텍스트 길이: {result.file1.textLength.toLocaleString()} 문자
                  </p>
                </div>

                <div className="p-4 bg-surface rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">
                    두 번째 PDF
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    파일명: {result.file2.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    페이지 수: {result.file2.pages}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    텍스트 길이: {result.file2.textLength.toLocaleString()} 문자
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg mt-4">
                <h3 className="font-medium text-foreground mb-3">비교 결과</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      페이지 수 일치
                    </span>
                    <span
                      className={`text-sm font-medium ${result.comparison.pageCountMatch ? "text-green-600" : "text-red-600"}`}
                    >
                      {result.comparison.pageCountMatch ? "일치" : "불일치"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      텍스트 유사도
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {result.comparison.textSimilarity}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      완전 일치
                    </span>
                    <span
                      className={`text-sm font-medium ${result.comparison.identical ? "text-green-600" : "text-red-600"}`}
                    >
                      {result.comparison.identical ? "예" : "아니오"}
                    </span>
                  </div>
                </div>
              </div>

              {result.comparison.identical && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mt-4">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <strong>완전 일치!</strong> 두 PDF 문서의 텍스트 내용이
                    동일합니다.
                  </p>
                </div>
              )}

              {!result.comparison.identical && (
                <>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>참고:</strong> 텍스트 유사도는 Levenshtein 거리
                      알고리즘을 사용하여 계산되었습니다. 레이아웃이나 이미지
                      차이는 반영되지 않습니다.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowDiff(!showDiff)}
                    >
                      {showDiff ? "차이점 숨기기" : "차이점 보기"}
                    </Button>
                  </div>

                  {renderDiff()}
                </>
              )}

              <div className="flex justify-center gap-3 mt-4">
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

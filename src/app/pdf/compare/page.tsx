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
  };
  file2: {
    name: string;
    pages: number;
    textLength: number;
  };
  comparison: {
    pageCountMatch: boolean;
    textSimilarity: number;
    identical: boolean;
  };
}

export default function ComparePdfPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCompare = async () => {
    if (files.length !== 2) {
      dispatch(setError("비교할 PDF 파일 2개를 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 비교"));
      dispatch(setProgress(10));

      const formData = new FormData();
      formData.append("file1", files[0]);
      formData.append("file2", files[1]);

      dispatch(setProgress(30));

      // Call server API for accurate PDF comparison
      const response = await fetch("/api/pdf/compare", {
        method: "POST",
        body: formData,
      });

      dispatch(setProgress(70));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "PDF 비교에 실패했습니다.");
      }

      const result = await response.json();

      dispatch(setProgress(90));

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
                  <li>텍스트 유사도를 계산합니다</li>
                  <li>차이점을 확인할 수 있습니다</li>
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
                    <strong>완전 일치!</strong> 두 PDF 문서의 내용이 동일합니다.
                  </p>
                </div>
              )}

              {!result.comparison.identical && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>참고:</strong> 텍스트 유사도는 Levenshtein 거리
                    알고리즘을 사용하여 계산되었습니다. 레이아웃이나 이미지
                    차이는 반영되지 않습니다.
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-3">
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

"use client";

import { ArrowLeft, Wrench } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
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

export default function RepairPdfPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [pageCount, setPageCount] = useState<number>(0);
  const [canLoad, setCanLoad] = useState<boolean>(false);
  const [completed, setCompleted] = useState(false);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 진단"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(40));

      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        const pages = pdfDoc.getPageCount();

        setPageCount(pages);
        setCanLoad(true);
      } catch (loadError) {
        console.error("PDF 로드 실패:", loadError);
        setPageCount(0);
        setCanLoad(false);
      }

      dispatch(setProgress(70));

      setCompleted(true);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 진단 오류:", error);
      dispatch(setError("PDF 진단 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    setPageCount(0);
    setCanLoad(false);
    setCompleted(false);
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
              <Wrench className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDF 복구</h1>
              <p className="text-muted-foreground mt-1">
                손상된 PDF 파일을 복구하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !completed && (
            <Card className="p-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-3 mb-6">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⚠️ PDF 복구 기능 안내
                </p>
                <div className="text-xs text-amber-800 dark:text-amber-200 space-y-2">
                  <p>
                    <strong>클라이언트 측 제약:</strong> pdf-lib는 손상된 PDF의
                    복구를 지원하지 않습니다. 복구는 다음과 같은 작업이
                    필요합니다:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>손상된 객체 테이블(xref) 재구성</li>
                    <li>누락된 헤더/트레일러 복원</li>
                    <li>깨진 스트림 데이터 복구</li>
                    <li>잘못된 참조 해결</li>
                  </ul>
                  <p>
                    <strong>권장 솔루션:</strong> 전문 PDF 복구 도구 사용:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>QPDF: 오픈소스 PDF 복구 및 최적화 도구</li>
                    <li>
                      Ghostscript: PDF 재처리를 통한 복구 (gs -dPDFSETTINGS)
                    </li>
                    <li>Apache PDFBox: Java 기반 PDF 복구 라이브러리</li>
                    <li>상용: Adobe Acrobat, Stellar PDF Repair</li>
                  </ul>
                  <p>
                    현재 페이지는 PDF 복구 기능의 UI 데모이며, 실제 복구는
                    구현되지 않았습니다.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg space-y-2 mb-6">
                <p className="text-sm font-medium text-foreground">복구 정보</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>손상된 PDF 파일 구조 복원</li>
                  <li>누락된 메타데이터 재구성</li>
                  <li>깨진 객체 참조 수정</li>
                  <li>읽을 수 없는 페이지 복구 시도</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Wrench className="w-5 h-5 mr-2" />
                  PDF 진단
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${canLoad ? "bg-success/10" : "bg-red-100 dark:bg-red-900/20"} flex items-center justify-center`}
                >
                  <Wrench
                    className={`w-5 h-5 ${canLoad ? "text-success" : "text-red-600 dark:text-red-400"}`}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">진단 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {canLoad
                      ? `PDF를 로드할 수 있습니다 (${pageCount}페이지)`
                      : "PDF가 손상되어 로드할 수 없습니다"}
                  </p>
                </div>
              </div>

              {!canLoad && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mt-4">
                  <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                    손상된 PDF 감지됨
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    이 PDF는 pdf-lib로 로드할 수 없습니다. 서버 기반 복구 도구를
                    사용하세요.
                  </p>
                </div>
              )}

              <div className="p-4 bg-surface rounded-lg mt-4">
                <h3 className="font-medium text-foreground mb-3">
                  PDF 복구 구현 가이드
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>QPDF (명령줄 도구):</strong>
                  </p>
                  <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                    {`# 손상된 PDF 복구 시도
qpdf --check input.pdf

# 복구 및 최적화
qpdf --linearize input.pdf output.pdf

# 오류 무시하고 복구
qpdf --warning-exit-0 input.pdf output.pdf`}
                  </pre>

                  <p className="mt-3">
                    <strong>Ghostscript (재처리를 통한 복구):</strong>
                  </p>
                  <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                    {`gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \\
   -dPDFSETTINGS=/prepress \\
   -sOutputFile=output.pdf \\
   input.pdf`}
                  </pre>

                  <p className="mt-3">
                    <strong>Python (pikepdf + PyPDF2):</strong>
                  </p>
                  <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                    {`import pikepdf

try:
    pdf = pikepdf.open('damaged.pdf',
                       allow_overwriting_input=True)
    pdf.save('repaired.pdf')
except Exception as e:
    print(f"복구 실패: {e}")`}
                  </pre>
                </div>
              </div>

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

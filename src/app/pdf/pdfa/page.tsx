"use client";

import { Archive, ArrowLeft } from "lucide-react";
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

export default function PdfaToPdfPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [pageCount, setPageCount] = useState<number>(0);
  const [completed, setCompleted] = useState(false);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF/A 분석"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(40));

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPageCount();

      dispatch(setProgress(70));

      setPageCount(pages);
      setCompleted(true);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF/A 분석 오류:", error);
      dispatch(setError("PDF/A 분석 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    setPageCount(0);
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
              <Archive className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF to PDF/A
              </h1>
              <p className="text-muted-foreground mt-1">
                ISO 표준 장기 보관 형식으로 변환하세요
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
                  ⚠️ PDF/A 변환 안내
                </p>
                <div className="text-xs text-amber-800 dark:text-amber-200 space-y-2">
                  <p>
                    <strong>PDF/A란?</strong> ISO 19005 표준으로, 문서의 장기
                    보관과 재현성을 보장하는 PDF 형식입니다.
                  </p>
                  <p>
                    <strong>클라이언트 측 제약:</strong> pdf-lib는 PDF/A 변환을
                    지원하지 않습니다. PDF/A는 특정 메타데이터, 폰트 임베딩,
                    색상 프로파일 요구사항이 있습니다.
                  </p>
                  <p>
                    <strong>권장 솔루션:</strong> 서버 기반 도구 사용:
                  </p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Python: pikepdf, borb (PDF/A 생성 및 검증 지원)</li>
                    <li>Java: Apache PDFBox, iText (PDF/A 변환 라이브러리)</li>
                    <li>상용: Adobe Acrobat, PDF/A Converter (전문 도구)</li>
                    <li>클라우드: AWS, GCP PDF 처리 서비스</li>
                  </ul>
                  <p>
                    현재 페이지는 PDF/A 기능의 UI 데모이며, 실제 변환은 구현되지
                    않았습니다.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg space-y-2 mb-6">
                <p className="text-sm font-medium text-foreground">
                  PDF/A 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>장기 보관에 최적화된 ISO 표준 형식</li>
                  <li>모든 폰트와 이미지를 문서에 임베딩</li>
                  <li>외부 참조 없이 독립적으로 재현 가능</li>
                  <li>PDF/A-1, PDF/A-2, PDF/A-3 등 여러 레벨 지원</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Archive className="w-5 h-5 mr-2" />
                  PDF 분석
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Archive
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">분석 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    PDF에 {pageCount}개의 페이지가 있습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg mt-4">
                <h3 className="font-medium text-foreground mb-3">
                  PDF/A 변환 구현 가이드
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Python (pikepdf):</strong>
                  </p>
                  <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                    {`pip install pikepdf

import pikepdf

with pikepdf.open('input.pdf') as pdf:
    # PDF/A-2b 메타데이터 설정
    with pdf.open_metadata() as meta:
        meta['pdfaid:part'] = '2'
        meta['pdfaid:conformance'] = 'B'

    pdf.save('output_pdfa.pdf',
             linearize=True,
             object_stream_mode=pikepdf.ObjectStreamMode.disable)`}
                  </pre>

                  <p className="mt-3">
                    <strong>Java (Apache PDFBox):</strong>
                  </p>
                  <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                    {`PDDocument doc = PDDocument.load(file);
PDFAIdentification identification =
    new PDFAIdentification(doc);
identification.setPart(2);
identification.setConformance("B");
doc.getDocumentCatalog().addMetadata(identification);
doc.save("output_pdfa.pdf");`}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>참고:</strong> PDF/A 준수성 검증은 veraPDF와 같은 전문
                  도구로 확인하는 것이 좋습니다.
                </p>
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

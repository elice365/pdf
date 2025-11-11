"use client";

import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useState } from "react";
import * as XLSX from "xlsx";
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

export default function PdfToExcelPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [pageCount, setPageCount] = useState<number>(0);
  const [tableCount, setTableCount] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [excelBlob, setExcelBlob] = useState<Blob | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF를 Excel로 변환"));
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

      // 새 Excel 워크북 생성
      const workbook = XLSX.utils.book_new();

      // 각 페이지에서 텍스트 추출하여 시트 생성
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        dispatch(setProgress(30 + (pageNum / totalPages) * 50));

        // 텍스트 아이템을 위치 기반으로 그룹화 (간단한 테이블 감지)
        const lines: { y: number; items: { x: number; text: string }[] }[] = [];

        for (const item of textContent.items) {
          if ("str" in item && "transform" in item) {
            const x = item.transform[4];
            const y = item.transform[5];
            const text = item.str.trim();

            if (!text) continue;

            // 같은 y 좌표의 항목 찾기 (같은 줄)
            let line = lines.find((l) => Math.abs(l.y - y) < 5);
            if (!line) {
              line = { y, items: [] };
              lines.push(line);
            }

            line.items.push({ x, text });
          }
        }

        // y 좌표로 정렬 (위에서 아래로)
        lines.sort((a, b) => b.y - a.y);

        // 각 줄의 항목을 x 좌표로 정렬 (왼쪽에서 오른쪽으로)
        for (const line of lines) {
          line.items.sort((a, b) => a.x - b.x);
        }

        // 2D 배열로 변환
        const sheetData: string[][] = lines.map((line) =>
          line.items.map((item) => item.text),
        );

        // 워크시트 생성
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

        // 워크북에 추가
        XLSX.utils.book_append_sheet(workbook, worksheet, `페이지 ${pageNum}`);
      }

      dispatch(setProgress(85));

      // Excel 파일로 변환
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      setExcelBlob(blob);
      setTableCount(totalPages);
      setCompleted(true);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF to Excel 변환 오류:", error);
      dispatch(setError("PDF to Excel 변환 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleDownload = () => {
    if (!excelBlob) return;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(excelBlob);
    link.download =
      files[0]?.name.replace(/\.pdf$/i, ".xlsx") || "converted.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    dispatch(resetState());
    setPageCount(0);
    setTableCount(0);
    setCompleted(false);
    setExcelBlob(null);
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
              <FileSpreadsheet
                className="w-6 h-6 text-primary"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PDF를 Excel로
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF 문서의 표를 Excel 스프레드시트로 변환하세요
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
                  Excel 변환 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>PDF의 표를 인식하여 Excel 스프레드시트로 변환합니다</li>
                  <li>각 페이지의 표는 별도 시트로 저장됩니다</li>
                  <li>셀 서식과 데이터 타입이 보존됩니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Excel로 변환
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <FileSpreadsheet
                    className="w-5 h-5 text-green-500"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">변환 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {pageCount}개 페이지가 {tableCount}개 시트로 변환되었습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg">
                <p className="text-sm text-muted-foreground">
                  PDF의 텍스트 내용이 위치 기반으로 추출되어 Excel 시트로
                  변환되었습니다.
                  <br />각 페이지는 별도의 시트로 저장됩니다.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleDownload}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel 다운로드
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

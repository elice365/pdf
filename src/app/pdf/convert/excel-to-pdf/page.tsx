"use client";

import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
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

export default function ExcelToPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("Excel 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("Excel을 PDF로 변환"));
      dispatch(setProgress(10));

      // Dynamically import libraries
      const XLSX = await import("xlsx");
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      dispatch(setProgress(20));

      // Read Excel file
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Get sheet names
      const sheets = workbook.SheetNames;
      setSheetNames(sheets);

      // Use selected sheet or first sheet
      const sheetName = selectedSheet || sheets[0];
      const worksheet = workbook.Sheets[sheetName];

      dispatch(setProgress(40));

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: "",
      }) as any[][];

      if (jsonData.length === 0) {
        throw new Error("시트가 비어있습니다.");
      }

      dispatch(setProgress(60));

      // Create PDF
      const doc = new jsPDF({
        orientation: jsonData[0]?.length > 6 ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add title
      doc.setFontSize(16);
      doc.text(sheetName, 14, 15);

      // Prepare table data
      const headers = jsonData[0] as string[];
      const body = jsonData.slice(1);

      // Add table using autoTable
      (doc as any).autoTable({
        head: [headers],
        body: body,
        startY: 25,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
          halign: "left",
        },
        headStyles: {
          fillColor: [229, 50, 45], // Primary color
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 25, left: 14, right: 14, bottom: 14 },
        theme: "grid",
        tableWidth: "auto",
        columnStyles: {},
      });

      dispatch(setProgress(90));

      // Save as Blob
      const pdfBlob = doc.output("blob");
      dispatch(setProcessedFile(pdfBlob));

      dispatch(setProgress(100));
    } catch (error) {
      console.error("Excel to PDF 변환 오류:", error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "Excel to PDF 변환 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setSheetNames([]);
    setSelectedSheet("");
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
                Excel을 PDF로
              </h1>
              <p className="text-muted-foreground mt-1">
                Excel 스프레드시트를 PDF로 변환하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload
              multiple={false}
              accept={{
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
                "application/vnd.ms-excel": [".xls"],
              }}
            />
          </Card>

          {files.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              {sheetNames.length > 0 && (
                <div>
                  <label
                    htmlFor="sheetSelect"
                    className="text-sm font-medium block mb-2"
                  >
                    시트 선택 (선택사항)
                  </label>
                  <select
                    id="sheetSelect"
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {sheetNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    선택하지 않으면 첫 번째 시트가 변환됩니다
                  </p>
                </div>
              )}

              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  변환 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Excel 데이터가 테이블 형식의 PDF로 변환됩니다</li>
                  <li>기본 서식과 테이블 레이아웃이 유지됩니다</li>
                  <li>여러 시트가 있는 경우 하나씩 선택하여 변환하세요</li>
                  <li>
                    복잡한 차트나 이미지는 변환되지 않습니다 (데이터만)
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  PDF로 변환
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <FileSpreadsheet
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">변환 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    Excel이 PDF로 변환되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="converted.pdf"
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

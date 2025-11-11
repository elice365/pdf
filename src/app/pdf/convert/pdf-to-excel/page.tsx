"use client";

import { FileSpreadsheet, Download } from "lucide-react";
import { FileUpload } from "@/components/pdf/file-upload";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import {
  PdfToolLayout,
  InfoCard,
  ResultCard,
  ActionButtons,
} from "@/components/pdf-tool";
import { Card } from "@/components/ui/card";
import { usePdfToExcel } from "@/hooks/use-pdf-to-excel";

export default function PdfToExcelPage() {
  const {
    hasFiles,
    files,
    completed,
    pageCount,
    tableCount,
    excelBlob,
    convert,
    reset,
  } = usePdfToExcel();

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

  return (
    <PdfToolLayout
      title="PDF를 Excel로"
      description="PDF 파일을 Excel 스프레드시트로 변환하세요"
      icon={FileSpreadsheet}
    >
      {/* File Upload */}
      <Card className="p-6">
        <FileUpload multiple={false} />
      </Card>

      {/* Convert */}
      {hasFiles && !completed && (
        <Card className="p-6 space-y-6">
          <InfoCard
            title="Excel 변환 정보"
            items={[
              "PDF의 텍스트를 위치 기반으로 분석하여 표로 변환합니다",
              "각 페이지는 별도의 시트로 생성됩니다",
              "간단한 표 구조를 자동으로 감지합니다",
            ]}
          />

          <ActionButtons
            primaryAction={{
              label: "Excel로 변환",
              icon: FileSpreadsheet,
              onClick: convert,
            }}
          />
        </Card>
      )}

      {/* Processing Progress */}
      <ProcessingProgress />

      {/* Result */}
      {completed && (
        <ResultCard
          icon={FileSpreadsheet}
          title="변환 완료!"
          subtitle={`${pageCount}개 페이지, ${tableCount}개 시트 생성`}
          description="PDF의 텍스트가 Excel 파일(.xlsx)로 변환되었습니다. 각 페이지는 별도의 시트로 저장됩니다."
        >
          <ActionButtons
            primaryAction={{
              label: "Excel 다운로드",
              icon: Download,
              onClick: handleDownload,
            }}
            secondaryAction={{
              label: "다시 시작",
              onClick: reset,
            }}
          />
        </ResultCard>
      )}
    </PdfToolLayout>
  );
}

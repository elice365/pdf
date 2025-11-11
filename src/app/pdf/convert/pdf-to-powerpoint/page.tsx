"use client";

import { Presentation, Download } from "lucide-react";
import { FileUpload } from "@/components/pdf/file-upload";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import {
  PdfToolLayout,
  InfoCard,
  ResultCard,
  ActionButtons,
} from "@/components/pdf-tool";
import { Card } from "@/components/ui/card";
import { usePdfToPowerPoint } from "@/hooks/use-pdf-to-powerpoint";

export default function PdfToPowerPointPage() {
  const {
    hasFiles,
    files,
    completed,
    pageCount,
    pptxBlob,
    convert,
    reset,
  } = usePdfToPowerPoint();

  const handleDownload = () => {
    if (!pptxBlob) return;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(pptxBlob);
    link.download =
      files[0]?.name.replace(/\.pdf$/i, ".pptx") || "converted.pptx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <PdfToolLayout
      title="PDF를 PPT로"
      description="PDF 파일을 PowerPoint 프레젠테이션으로 변환하세요"
      icon={Presentation}
    >
      {/* File Upload */}
      <Card className="p-6">
        <FileUpload multiple={false} />
      </Card>

      {/* Convert */}
      {hasFiles && !completed && (
        <Card className="p-6 space-y-6">
          <InfoCard
            title="PowerPoint 변환 정보"
            items={[
              "PDF의 각 페이지가 PowerPoint 슬라이드로 변환됩니다",
              "레이아웃과 서식이 최대한 보존됩니다",
              "고해상도 이미지로 변환되어 품질이 유지됩니다",
            ]}
          />

          <ActionButtons
            primaryAction={{
              label: "PowerPoint로 변환",
              icon: Presentation,
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
          icon={Presentation}
          title="변환 완료!"
          subtitle={`${pageCount}개 슬라이드가 생성되었습니다`}
          description="PDF의 각 페이지가 이미지로 변환되어 PowerPoint 슬라이드에 추가되었습니다."
        >
          <ActionButtons
            primaryAction={{
              label: "PowerPoint 다운로드",
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

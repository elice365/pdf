"use client";

import { FileText, Download } from "lucide-react";
import { FileUpload } from "@/components/pdf/file-upload";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import {
  PdfToolLayout,
  InfoCard,
  ResultCard,
  ActionButtons,
} from "@/components/pdf-tool";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { usePdfToWord } from "@/hooks/use-pdf-to-word";

export default function PdfToWordPage() {
  const {
    hasFiles,
    files,
    quality,
    setQuality,
    completed,
    pageCount,
    wordBlob,
    convert,
    reset,
  } = usePdfToWord();

  const handleDownload = () => {
    if (!wordBlob) return;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(wordBlob);
    link.download =
      files[0]?.name.replace(/\.pdf$/i, ".docx") || "converted.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <PdfToolLayout
      title="PDF를 Word로"
      description="PDF 파일을 편집 가능한 Word 문서로 변환하세요"
      icon={FileText}
    >
      {/* File Upload */}
      <Card className="p-6">
        <FileUpload multiple={false} />
      </Card>

      {/* Options & Convert */}
      {hasFiles && !completed && (
        <Card className="p-6 space-y-6">
          {/* Quality Selection */}
          <div className="space-y-2">
            <Label>변환 품질</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="quality"
                  value="standard"
                  checked={quality === "standard"}
                  onChange={(e) => setQuality(e.target.value as "standard")}
                  className="w-4 h-4"
                />
                <span className="text-sm">표준</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="quality"
                  value="high"
                  checked={quality === "high"}
                  onChange={(e) => setQuality(e.target.value as "high")}
                  className="w-4 h-4"
                />
                <span className="text-sm">고품질 (맑은 고딕 폰트)</span>
              </label>
            </div>
          </div>

          <InfoCard
            title="Word 변환 정보"
            items={[
              "PDF에서 텍스트를 추출하여 Word 문서로 변환합니다",
              "각 페이지는 제목으로 구분됩니다",
              "텍스트 레이아웃이 최대한 보존됩니다",
            ]}
          />

          <ActionButtons
            primaryAction={{
              label: "Word로 변환",
              icon: FileText,
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
          icon={FileText}
          title="변환 완료!"
          subtitle={`${pageCount}개 페이지가 변환되었습니다`}
          description="PDF의 텍스트가 Word 문서(.docx)로 변환되었습니다. 텍스트는 편집 가능한 상태로 저장됩니다."
        >
          <ActionButtons
            primaryAction={{
              label: "Word 다운로드",
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

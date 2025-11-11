"use client";

import { ClipboardList } from "lucide-react";
import { FileUpload } from "@/components/pdf/file-upload";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import {
  PdfToolLayout,
  InfoCard,
  ResultCard,
  ActionButtons,
} from "@/components/pdf-tool";
import { FormField } from "@/components/pdf-tool/form-field";
import { Card } from "@/components/ui/card";
import { useFormAnalyzer } from "@/hooks/use-form-analyzer";

export default function FillFormPage() {
  const {
    hasFiles,
    fieldsDetected,
    completed,
    formFields,
    filledPdfUrl,
    files,
    analyzeForm,
    fillForm,
    updateField,
    reset,
  } = useFormAnalyzer();

  const handleDownload = () => {
    if (!filledPdfUrl) return;

    const link = document.createElement("a");
    link.href = filledPdfUrl;
    link.download =
      files[0]?.name.replace(/\.pdf$/i, "_filled.pdf") || "filled-form.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PdfToolLayout
      title="양식 채우기"
      description="PDF 양식의 필드를 자동으로 감지하고 채우세요"
      icon={ClipboardList}
    >
      {/* File Upload */}
      <Card className="p-6">
        <FileUpload multiple={false} />
      </Card>

      {/* Analyze Form */}
      {hasFiles && !fieldsDetected && !completed && (
        <Card className="p-6 space-y-6">
          <InfoCard
            title="양식 채우기 정보"
            items={[
              "AcroForm 필드가 포함된 PDF만 지원됩니다",
              "텍스트 필드, 체크박스, 라디오 버튼을 자동으로 감지합니다",
              "모든 필드를 채운 후 PDF로 저장할 수 있습니다",
            ]}
          />

          <ActionButtons
            primaryAction={{
              label: "양식 분석",
              icon: ClipboardList,
              onClick: analyzeForm,
            }}
          />
        </Card>
      )}

      {/* Processing Progress */}
      <ProcessingProgress />

      {/* Form Fields */}
      {fieldsDetected && !completed && (
        <Card className="p-6 space-y-6">
          <div>
            <p className="text-lg font-medium text-foreground mb-4">
              감지된 필드: {formFields.length}개
            </p>
            <div className="space-y-4">
              {formFields.map((field, index) => (
                <FormField
                  key={index}
                  field={field}
                  index={index}
                  onUpdate={updateField}
                />
              ))}
            </div>
          </div>

          <ActionButtons
            primaryAction={{
              label: "양식 채우기",
              icon: ClipboardList,
              onClick: fillForm,
            }}
            secondaryAction={{
              label: "취소",
              onClick: reset,
            }}
          />
        </Card>
      )}

      {/* Result */}
      {completed && (
        <ResultCard
          icon={ClipboardList}
          title="양식 채우기 완료!"
          subtitle={`${formFields.length}개의 필드가 채워졌습니다`}
          description="모든 필드가 성공적으로 채워졌습니다. 필드는 편집 가능한 상태로 유지됩니다. 필요시 PDF 뷰어에서 추가 수정이 가능합니다."
        >
          <ActionButtons
            primaryAction={{
              label: "채워진 PDF 다운로드",
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

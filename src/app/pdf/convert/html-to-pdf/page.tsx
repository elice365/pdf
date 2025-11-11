"use client";

import { FileText, Download } from "lucide-react";
import { ProcessingProgress } from "@/components/pdf/processing-progress";
import {
  PdfToolLayout,
  InfoCard,
  ResultCard,
  ActionButtons,
} from "@/components/pdf-tool";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHtmlToPdf } from "@/hooks/use-html-to-pdf";

export default function HtmlToPdfPage() {
  const { htmlContent, setHtmlContent, pdfData, completed, convert, reset } =
    useHtmlToPdf();

  const handleDownload = () => {
    if (!pdfData) return;

    const link = document.createElement("a");
    link.href = pdfData;
    link.download = "converted.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PdfToolLayout
      title="HTML을 PDF로 변환"
      description="HTML 코드를 PDF 문서로 변환하세요"
      icon={FileText}
    >
      {/* Input Form */}
      {!completed && (
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="html-input">HTML 코드 입력</Label>
            <Textarea
              id="html-input"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="HTML 코드를 입력하세요..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <InfoCard
            title="변환 정보"
            items={[
              "HTML 코드가 이미지로 변환되어 PDF에 삽입됩니다",
              "CSS 스타일이 적용되어 렌더링됩니다",
              "A4 용지 크기로 자동 조정됩니다",
            ]}
          />

          <ActionButtons
            primaryAction={{
              label: "PDF로 변환",
              icon: FileText,
              onClick: convert,
              disabled: !htmlContent.trim(),
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
          subtitle="HTML이 PDF로 변환되었습니다"
          description="HTML 코드가 이미지로 렌더링되어 PDF 문서에 삽입되었습니다."
        >
          <ActionButtons
            primaryAction={{
              label: "PDF 다운로드",
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

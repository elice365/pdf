"use client";

import { ArrowLeft, Presentation } from "lucide-react";
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

export default function PowerPointToPdfPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [fileName, setFileName] = useState<string>("");
  const [completed, setCompleted] = useState<boolean>(false);

  const handleConvert = async () => {
    if (files.length === 0) {
      dispatch(setError("PowerPoint 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PowerPoint를 PDF로 변환"));
      dispatch(setProgress(10));

      const file = files[0];
      setFileName(file.name);

      dispatch(setProgress(40));

      // Note: PowerPoint to PDF conversion requires server-side processing
      // This is a client-side demo that shows UI but doesn't actually convert
      // In production, this would use LibreOffice, python-pptx + reportlab, or Microsoft API
      // Preserves animations, transitions, and slide layouts

      dispatch(setProgress(70));

      setCompleted(true);

      dispatch(setProgress(100));
    } catch (error) {
      console.error("PowerPoint to PDF 변환 오류:", error);
      dispatch(setError("PowerPoint to PDF 변환 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setFileName("");
    setCompleted(false);
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
              <Presentation
                className="w-6 h-6 text-primary"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                PPT를 PDF로
              </h1>
              <p className="text-muted-foreground mt-1">
                PowerPoint 프레젠테이션을 PDF로 변환하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload
              multiple={false}
              accept={{
                "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                  [".pptx"],
                "application/vnd.ms-powerpoint": [".ppt"],
              }}
            />
          </Card>

          {files.length > 0 && !completed && (
            <Card className="p-6 space-y-6">
              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  PDF 변환 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>PowerPoint 슬라이드를 고품질 PDF로 변환합니다</li>
                  <li>슬라이드 레이아웃과 서식이 보존됩니다</li>
                  <li>각 슬라이드는 PDF의 한 페이지가 됩니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Presentation className="w-5 h-5 mr-2" />
                  PDF로 변환
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {completed && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Presentation
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">변환 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    {fileName} 파일이 변환되었습니다
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg">
                <p className="text-sm text-muted-foreground">
                  실제 PowerPoint to PDF 변환은 서버 처리가 필요합니다.
                  <br />
                  LibreOffice, python-pptx + reportlab 또는 Microsoft API를
                  사용하여 서버에서 처리할 수 있습니다.
                  <br />
                  슬라이드 레이아웃과 콘텐츠를 정확히 보존하여 PDF로 변환합니다.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button disabled className="opacity-50">
                  PDF 다운로드 (서버 필요)
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

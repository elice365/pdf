"use client";

import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FileUpload } from "@/components/pdf/file-upload";
import PDFEditor from "@/components/pdf-editor/PDFEditor";
import { Card } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetEditor } from "@/store/slices/editorSlice";
import { resetState } from "@/store/slices/pdfSlice";

export default function EditPdfPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector((state) => state.pdf);
  const [isEditing, setIsEditing] = useState(false);

  // 파일이 업로드되면 자동으로 편집 모드로 전환
  useEffect(() => {
    if (files.length > 0 && !isEditing) {
      setIsEditing(true);
    }
  }, [files, isEditing]);

  const handleReset = () => {
    dispatch(resetState());
    dispatch(resetEditor());
    setIsEditing(false);
  };

  // 편집 모드일 때는 전체 화면 편집기 표시
  if (isEditing && files.length > 0) {
    return (
      <PDFEditor key={files[0].name} file={files[0]} onBack={handleReset} />
    );
  }

  // 파일 업로드 화면 (공통 패턴 사용)
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
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Edit className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDF 편집</h1>
              <p className="text-muted-foreground mt-1">
                PDF 파일을 편집해보세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium mb-4">편집 기능</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                텍스트 추가 및 편집
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                이미지 삽입
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                도형 그리기
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                페이지 추가 및 삭제
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

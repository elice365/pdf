"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PDFEditor from "@/components/pdf-editor/PDFEditor";

function EditorPageContent() {
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL에서 파일 정보 가져오기 또는 로컬 스토리지에서 가져오기
    const loadFile = async () => {
      try {
        // 실제 구현에서는 파일 업로드 플로우를 통해 파일을 받아야 함
        // 여기서는 임시로 에러 처리만 수행
        setLoading(false);
      } catch (err) {
        console.error("Failed to load file:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load PDF file",
        );
        setLoading(false);
      }
    };

    loadFile();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">편집기 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            PDF 파일 선택
          </h2>
          <p className="text-gray-600 mb-6">편집할 PDF 파일을 선택해주세요.</p>
          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  setFile(selectedFile);
                }
              }}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90
                cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              또는 홈페이지에서 PDF 편집 도구를 선택하세요.
            </p>
            <a
              href="/"
              className="inline-block text-primary hover:underline text-sm"
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <PDFEditor file={file} />;
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">편집기 로딩 중...</p>
          </div>
        </div>
      }
    >
      <EditorPageContent />
    </Suspense>
  );
}

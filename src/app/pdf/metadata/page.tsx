"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
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

export default function MetadataPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [creator, setCreator] = useState<string>("");

  const handleEditMetadata = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("메타데이터 편집"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(30));

      // Set metadata
      if (title) pdfDoc.setTitle(title);
      if (author) pdfDoc.setAuthor(author);
      if (subject) pdfDoc.setSubject(subject);
      if (keywords) {
        const keywordArray = keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k);
        pdfDoc.setKeywords(keywordArray);
      }
      if (creator) pdfDoc.setCreator(creator);

      // Always update modification date
      pdfDoc.setModificationDate(new Date());

      dispatch(setProgress(70));

      const pdfBytes = await pdfDoc.save();

      dispatch(setProgress(90));

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("메타데이터 편집 오류:", error);
      dispatch(setError("메타데이터 편집 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setTitle("");
    setAuthor("");
    setSubject("");
    setKeywords("");
    setCreator("");
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
              <FileText className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                메타데이터 편집
              </h1>
              <p className="text-muted-foreground mt-1">
                PDF 문서 정보를 수정하세요
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload multiple={false} />
          </Card>

          {files.length > 0 && !processedFile && (
            <Card className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="text-sm font-medium block mb-2"
                >
                  제목
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문서 제목을 입력하세요"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Author */}
              <div>
                <label
                  htmlFor="author"
                  className="text-sm font-medium block mb-2"
                >
                  작성자
                </label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="작성자 이름을 입력하세요"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="text-sm font-medium block mb-2"
                >
                  주제
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="문서 주제를 입력하세요"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Keywords */}
              <div>
                <label
                  htmlFor="keywords"
                  className="text-sm font-medium block mb-2"
                >
                  키워드
                </label>
                <input
                  id="keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="키워드1, 키워드2, 키워드3 (쉼표로 구분)"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  쉼표(,)로 여러 키워드를 구분하세요
                </p>
              </div>

              {/* Creator */}
              <div>
                <label
                  htmlFor="creator"
                  className="text-sm font-medium block mb-2"
                >
                  제작자
                </label>
                <input
                  id="creator"
                  type="text"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  placeholder="제작자 정보를 입력하세요"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  메타데이터 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>비어있는 필드는 수정되지 않습니다</li>
                  <li>수정 날짜는 자동으로 현재 시간으로 설정됩니다</li>
                  <li>메타데이터는 PDF 속성에서 확인할 수 있습니다</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleEditMetadata}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  메타데이터 저장
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <FileText
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">편집 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    메타데이터가 수정되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="metadata-edited.pdf"
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

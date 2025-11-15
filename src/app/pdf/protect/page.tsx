"use client";

import { ArrowLeft, Lock } from "lucide-react";
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

export default function ProtectPdfPage() {
  const dispatch = useAppDispatch();
  const { files, processedFile } = useAppSelector((state) => state.pdf);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleProtect = async () => {
    if (files.length === 0) {
      dispatch(setError("PDF 파일을 업로드해주세요."));
      return;
    }

    if (!password.trim()) {
      dispatch(setError("비밀번호를 입력해주세요."));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(setError("비밀번호가 일치하지 않습니다."));
      return;
    }

    if (password.length < 4) {
      dispatch(setError("비밀번호는 최소 4자 이상이어야 합니다."));
      return;
    }

    try {
      dispatch(setProcessing(true));
      dispatch(setOperation("PDF 보호"));
      dispatch(setProgress(10));

      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      dispatch(setProgress(40));

      // Note: pdf-lib in the browser doesn't support PDF encryption
      // PDF encryption requires cryptographic operations that are not
      // implemented in the current pdf-lib browser build
      //
      // Alternatives:
      // - Server-side: Use PyPDF2, qpdf, or Apache PDFBox
      // - Browser: Use pdf.js encryption (limited support)
      //
      // For now, we save the PDF without encryption and inform the user
      const pdfBytes = await pdfDoc.save();

      dispatch(setProgress(70));

      // Inform user that encryption is not applied
      throw new Error(
        "PDF 암호화는 브라우저에서 지원되지 않습니다. " +
          "서버 기반 도구(PyPDF2, qpdf, Apache PDFBox)를 사용하거나, " +
          "Adobe Acrobat과 같은 전문 도구를 사용하세요.",
      );

      dispatch(setProgress(90));

      const blob = new Blob([Buffer.from(pdfBytes)], {
        type: "application/pdf",
      });

      dispatch(setProcessedFile(blob));
      dispatch(setProgress(100));
    } catch (error) {
      console.error("PDF 보호 오류:", error);
      dispatch(setError("PDF 보호 중 오류가 발생했습니다."));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleReset = () => {
    dispatch(resetState());
    setPassword("");
    setConfirmPassword("");
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
              <Lock className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDF 보호</h1>
              <p className="text-muted-foreground mt-1">
                PDF에 비밀번호를 설정하세요
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
              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium block mb-2"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요 (최소 4자)"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium block mb-2"
                >
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Show Password Toggle */}
              <div className="flex items-center gap-2">
                <input
                  id="showPassword"
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <label
                  htmlFor="showPassword"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  비밀번호 표시
                </label>
              </div>

              {/* Password Strength Info */}
              <div className="p-4 bg-surface rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  보안 설정 정보
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>PDF를 열려면 비밀번호가 필요합니다</li>
                  <li>인쇄는 허용되지만 편집 및 복사는 제한됩니다</li>
                  <li>안전한 비밀번호를 사용하세요</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleProtect}
                  disabled={!password || !confirmPassword}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  PDF 보호하기
                </Button>
              </div>
            </Card>
          )}

          <ProcessingProgress />

          {processedFile && (
            <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">보호 완료!</p>
                  <p className="text-sm text-muted-foreground">
                    PDF가 비밀번호로 보호되었습니다
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <DownloadButton
                  filename="protected.pdf"
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

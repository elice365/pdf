"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

interface DownloadButtonProps {
  filename?: string;
  disabled?: boolean;
  className?: string;
}

export function DownloadButton({
  filename = "processed.pdf",
  disabled = false,
  className,
}: DownloadButtonProps) {
  const { processedFile, isProcessing } = useAppSelector((state) => state.pdf);

  const handleDownload = () => {
    if (!processedFile) return;

    const url = URL.createObjectURL(processedFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={disabled || isProcessing || !processedFile}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" aria-hidden="true" />
      다운로드
    </Button>
  );
}

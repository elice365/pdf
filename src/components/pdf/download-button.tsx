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
  const { processedFile, isProcessing, files } = useAppSelector(
    (state) => state.pdf,
  );

  // Generate filename with original name to prevent browser caching issues
  const getFilename = () => {
    if (files.length > 0 && files[0]?.name) {
      const originalName = files[0].name.replace(/\.pdf$/i, "");
      const suffix = filename.replace(/\.pdf$/i, "");

      // If suffix is just "processed", use original name only
      if (suffix === "processed") {
        return `${originalName}.pdf`;
      }

      // Otherwise, combine original name with suffix
      return `${originalName}-${suffix}.pdf`;
    }

    // Fallback to provided filename
    return filename;
  };

  const handleDownload = () => {
    if (!processedFile) return;

    const url = URL.createObjectURL(processedFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = getFilename();
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

"use client";

import { FileText, Upload, X } from "lucide-react";
import { useCallback } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addFile, removeFile, setError } from "@/store/slices/pdfSlice";

interface FileUploadProps {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
}

export function FileUpload({
  accept = { "application/pdf": [".pdf"] },
  multiple = true,
  maxSize = 50 * 1024 * 1024,
  disabled = false,
}: FileUploadProps) {
  const dispatch = useAppDispatch();
  const { files, isProcessing } = useAppSelector((state) => state.pdf);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        const maxSizeMB = maxSize / 1024 / 1024;
        if (error.code === "file-too-large") {
          dispatch(
            setError(
              "파일 크기가 너무 큽니다. 최대 " +
                maxSizeMB +
                "MB까지 가능합니다.",
            ),
          );
        } else if (error.code === "file-invalid-type") {
          dispatch(setError("PDF 파일만 업로드 가능합니다."));
        } else {
          dispatch(setError("파일 업로드 중 오류가 발생했습니다."));
        }
        return;
      }

      acceptedFiles.forEach((file) => {
        dispatch(addFile(file));
      });
    },
    [dispatch, maxSize],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
    disabled: disabled || isProcessing,
  });

  const handleRemoveFile = (index: number) => {
    dispatch(removeFile(index));
  };

  const maxSizeMB = maxSize / 1024 / 1024;

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          "p-8 border-2 border-dashed cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5 dark:bg-primary/10",
          (disabled || isProcessing) && "opacity-50 cursor-not-allowed",
          !isDragActive &&
            "hover:border-primary/50 dark:hover:border-primary/70",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Upload
            className={cn(
              "w-12 h-12 transition-colors",
              isDragActive
                ? "text-primary"
                : "text-muted-foreground dark:text-gray-400",
            )}
            aria-hidden="true"
          />
          {isDragActive ? (
            <p className="text-lg font-medium text-primary">
              파일을 여기에 놓으세요
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-foreground dark:text-white">
                PDF 파일을 드래그하거나 클릭하여 선택하세요
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                최대 {maxSizeMB}MB까지 업로드 가능
                {multiple && " • 여러 파일 선택 가능"}
              </p>
            </>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isProcessing}
            className="pointer-events-none dark:border-border dark:bg-surface/50"
          >
            파일 선택
          </Button>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground dark:text-white">
            업로드된 파일 ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <Card
                key={`${file.name}-${index}`}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText
                    className="w-5 h-5 text-primary flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={isProcessing}
                  className="flex-shrink-0 dark:hover:bg-surface/70"
                  aria-label={`${file.name} 제거`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

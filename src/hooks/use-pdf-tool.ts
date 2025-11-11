import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetState,
  setError,
  setOperation,
  setProcessing,
  setProgress,
} from "@/store/slices/pdfSlice";

interface UsePdfToolOptions {
  operationName?: string;
}

/**
 * Custom hook for PDF tool pages
 * Provides common functionality for file processing, state management, and error handling
 */
export function usePdfTool(options: UsePdfToolOptions = {}) {
  const dispatch = useAppDispatch();
  const { files, isProcessing, progress, error } = useAppSelector(
    (state) => state.pdf
  );

  const startProcessing = useCallback(
    (operation?: string) => {
      dispatch(setProcessing(true));
      if (operation || options.operationName) {
        dispatch(setOperation(operation || options.operationName || ""));
      }
      dispatch(setProgress(0));
    },
    [dispatch, options.operationName]
  );

  const updateProgress = useCallback(
    (value: number) => {
      dispatch(setProgress(Math.min(100, Math.max(0, value))));
    },
    [dispatch]
  );

  const finishProcessing = useCallback(() => {
    dispatch(setProgress(100));
    dispatch(setProcessing(false));
  }, [dispatch]);

  const setErrorMessage = useCallback(
    (message: string) => {
      dispatch(setError(message));
      dispatch(setProcessing(false));
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const validateFiles = useCallback(
    (minFiles = 1, maxFiles?: number): boolean => {
      if (files.length < minFiles) {
        setErrorMessage(
          `PDF 파일을 업로드해주세요.${minFiles > 1 ? ` (최소 ${minFiles}개)` : ""}`
        );
        return false;
      }

      if (maxFiles && files.length > maxFiles) {
        setErrorMessage(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        return false;
      }

      return true;
    },
    [files.length, setErrorMessage]
  );

  return {
    // State
    files,
    isProcessing,
    progress,
    error,
    hasFiles: files.length > 0,
    firstFile: files[0],

    // Actions
    startProcessing,
    updateProgress,
    finishProcessing,
    setError: setErrorMessage,
    reset,
    validateFiles,
  };
}

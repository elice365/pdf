/**
 * Common types for PDF tool pages
 */

export interface PdfToolConfig {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  operation: string;
}

export interface PdfToolResult<T = Blob> {
  data: T | null;
  pageCount?: number;
  completed: boolean;
}

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface PdfState {
  files: File[];
  processedFile: Blob | null;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  operation: string | null;
}

const initialState: PdfState = {
  files: [],
  processedFile: null,
  isProcessing: false,
  progress: 0,
  error: null,
  operation: null,
};

const pdfSlice = createSlice({
  name: "pdf",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload;
      state.error = null;
    },
    addFile: (state, action: PayloadAction<File>) => {
      state.files.push(action.payload);
      state.error = null;
    },
    removeFile: (state, action: PayloadAction<number>) => {
      state.files.splice(action.payload, 1);
    },
    clearFiles: (state) => {
      state.files = [];
      state.error = null;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = Math.min(100, Math.max(0, action.payload));
    },
    setProcessedFile: (state, action: PayloadAction<Blob>) => {
      state.processedFile = action.payload;
      state.isProcessing = false;
      state.progress = 100;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.progress = 0;
    },
    setOperation: (state, action: PayloadAction<string>) => {
      state.operation = action.payload;
    },
    resetState: () => initialState,
  },
});

export const {
  setFiles,
  addFile,
  removeFile,
  clearFiles,
  setProcessing,
  setProgress,
  setProcessedFile,
  setError,
  setOperation,
  resetState,
} = pdfSlice.actions;

export default pdfSlice.reducer;

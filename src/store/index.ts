import { configureStore } from "@reduxjs/toolkit";
import editorReducer from "./slices/editorSlice";
import pdfReducer from "./slices/pdfSlice";

export const store = configureStore({
  reducer: {
    pdf: pdfReducer,
    editor: editorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore File and Blob objects in Redux state
        ignoredActions: [
          "pdf/setFiles",
          "pdf/addFile",
          "pdf/setProcessedFile",
          "editor/setPdfFile",
        ],
        ignoredPaths: ["pdf.files", "pdf.processedFile", "editor.pdfFile"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

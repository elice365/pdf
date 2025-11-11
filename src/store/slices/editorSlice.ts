import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type {
  EditElement,
  ToolType,
  PDFPageInfo,
} from '@/lib/pdf-editor/types';

export interface EditorState {
  // PDF 상태
  pdfFile: File | null;
  pages: PDFPageInfo[];
  currentPage: number;
  totalPages: number;

  // 도구 상태
  currentTool: ToolType;
  isDrawing: boolean;
  selectedShapeType: 'rectangle' | 'circle' | 'line';

  // 요소 상태
  elements: EditElement[];
  selectedElementIds: string[];

  // 캔버스 상태
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;

  // 히스토리 상태
  canUndo: boolean;
  canRedo: boolean;
  historyCount: number;

  // UI 상태
  showSidebar: boolean;
  showProperties: boolean;
  isLoading: boolean;
  isSaving: boolean;

  // 에러 상태
  error: string | null;
}

const initialState: EditorState = {
  pdfFile: null,
  pages: [],
  currentPage: 1,
  totalPages: 0,

  currentTool: 'select',
  isDrawing: false,
  selectedShapeType: 'rectangle',

  elements: [],
  selectedElementIds: [],

  zoom: 1.0,
  canvasWidth: 0,
  canvasHeight: 0,

  canUndo: false,
  canRedo: false,
  historyCount: 0,

  showSidebar: true,
  showProperties: true,
  isLoading: false,
  isSaving: false,

  error: null,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    // PDF 관련
    setPdfFile: (state, action: PayloadAction<File>) => {
      state.pdfFile = action.payload;
      state.error = null;
    },
    setPages: (state, action: PayloadAction<PDFPageInfo[]>) => {
      state.pages = action.payload;
      state.totalPages = action.payload.length;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      if (action.payload >= 1 && action.payload <= state.totalPages) {
        state.currentPage = action.payload;
      }
    },
    nextPage: (state) => {
      if (state.currentPage < state.totalPages) {
        state.currentPage += 1;
      }
    },
    previousPage: (state) => {
      if (state.currentPage > 1) {
        state.currentPage -= 1;
      }
    },

    // 도구 관련
    setTool: (state, action: PayloadAction<ToolType>) => {
      state.currentTool = action.payload;
      // 도구 전환 시 선택 해제
      if (action.payload !== 'select') {
        state.selectedElementIds = [];
      }
    },
    setDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },
    setSelectedShapeType: (state, action: PayloadAction<'rectangle' | 'circle' | 'line'>) => {
      state.selectedShapeType = action.payload;
    },

    // 요소 관련
    addElement: (state, action: PayloadAction<EditElement>) => {
      state.elements.push(action.payload);
    },
    updateElement: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<EditElement> }>
    ) => {
      const index = state.elements.findIndex((el) => el.id === action.payload.id);
      if (index !== -1) {
        state.elements[index] = {
          ...state.elements[index],
          ...action.payload.updates,
        } as EditElement;
      }
    },
    deleteElement: (state, action: PayloadAction<string>) => {
      state.elements = state.elements.filter((el) => el.id !== action.payload);
      state.selectedElementIds = state.selectedElementIds.filter(
        (id) => id !== action.payload
      );
    },
    deleteSelectedElements: (state) => {
      state.elements = state.elements.filter(
        (el) => !state.selectedElementIds.includes(el.id)
      );
      state.selectedElementIds = [];
    },
    setElements: (state, action: PayloadAction<EditElement[]>) => {
      state.elements = action.payload;
    },

    // 선택 관련
    selectElement: (state, action: PayloadAction<string>) => {
      if (!state.selectedElementIds.includes(action.payload)) {
        state.selectedElementIds.push(action.payload);
      }
    },
    deselectElement: (state, action: PayloadAction<string>) => {
      state.selectedElementIds = state.selectedElementIds.filter(
        (id) => id !== action.payload
      );
    },
    setSelectedElements: (state, action: PayloadAction<string[]>) => {
      state.selectedElementIds = action.payload;
    },
    clearSelection: (state) => {
      state.selectedElementIds = [];
    },
    bringToFront: (state, action: PayloadAction<string>) => {
      const index = state.elements.findIndex((el) => el.id === action.payload);
      if (index !== -1 && index < state.elements.length - 1) {
        const element = state.elements.splice(index, 1)[0];
        state.elements.push(element);
      }
    },
    sendToBack: (state, action: PayloadAction<string>) => {
      const index = state.elements.findIndex((el) => el.id === action.payload);
      if (index !== -1 && index > 0) {
        const element = state.elements.splice(index, 1)[0];
        state.elements.unshift(element);
      }
    },

    // 캔버스 관련
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.min(3.0, Math.max(0.1, action.payload));
    },
    zoomIn: (state) => {
      state.zoom = Math.min(3.0, state.zoom + 0.1);
    },
    zoomOut: (state) => {
      state.zoom = Math.max(0.1, state.zoom - 0.1);
    },
    resetZoom: (state) => {
      state.zoom = 1.0;
    },
    setCanvasSize: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.canvasWidth = action.payload.width;
      state.canvasHeight = action.payload.height;
    },

    // 히스토리 관련
    setHistoryState: (
      state,
      action: PayloadAction<{ canUndo: boolean; canRedo: boolean; count: number }>
    ) => {
      state.canUndo = action.payload.canUndo;
      state.canRedo = action.payload.canRedo;
      state.historyCount = action.payload.count;
    },

    // UI 관련
    toggleSidebar: (state) => {
      state.showSidebar = !state.showSidebar;
    },
    toggleProperties: (state) => {
      state.showProperties = !state.showProperties;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    // 에러 관련
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isSaving = false;
    },
    clearError: (state) => {
      state.error = null;
    },

    // 리셋
    resetEditor: () => initialState,
  },
});

export const {
  setPdfFile,
  setPages,
  setCurrentPage,
  nextPage,
  previousPage,
  setTool,
  setDrawing,
  setSelectedShapeType,
  addElement,
  updateElement,
  deleteElement,
  deleteSelectedElements,
  setElements,
  selectElement,
  deselectElement,
  setSelectedElements,
  clearSelection,
  bringToFront,
  sendToBack,
  setZoom,
  zoomIn,
  zoomOut,
  resetZoom,
  setCanvasSize,
  setHistoryState,
  toggleSidebar,
  toggleProperties,
  setLoading,
  setSaving,
  setError,
  clearError,
  resetEditor,
} = editorSlice.actions;

export default editorSlice.reducer;

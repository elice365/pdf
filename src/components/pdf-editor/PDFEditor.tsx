'use client';

import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setPdfFile,
  setPages,
  setLoading,
  setError,
  setCanvasSize,
  deleteSelectedElements,
  addElement,
  updateElement,
  deleteElement,
  setHistoryState,
  resetEditor,
} from '@/store/slices/editorSlice';
import { PDFRenderer } from '@/lib/pdf-editor/renderer';
import { ElementManager } from '@/lib/pdf-editor/element-manager';
import { HistoryManager } from '@/lib/pdf-editor/history-manager';
import Toolbar from './Toolbar';
import PDFCanvas from './PDFCanvas';
import Sidebar from './Sidebar';
import PropertiesPanel from './PropertiesPanel';

interface PDFEditorProps {
  file: File;
  onBack?: () => void;
}

export default function PDFEditor({ file, onBack }: PDFEditorProps) {
  const dispatch = useAppDispatch();
  const {
    pages,
    currentPage,
    zoom,
    showSidebar,
    showProperties,
    isLoading,
    error,
    selectedElementIds,
    canUndo,
    canRedo,
  } = useAppSelector((state) => state.editor);

  const rendererRef = useRef<PDFRenderer>(new PDFRenderer());
  const elementManagerRef = useRef<ElementManager>(new ElementManager());
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager());

  const initializedRef = useRef(false);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 언마운트 시 store 초기화
      dispatch(resetEditor());
      initializedRef.current = false;
    };
  }, [dispatch]);

  // 키보드 단축키
  // Delete: 선택된 요소 삭제
  useHotkeys(
    'delete',
    (e) => {
      e.preventDefault();
      if (selectedElementIds.length > 0) {
        // 삭제 전에 선택된 요소들의 정보 가져오기
        const selectedElements = elementManagerRef.current.getAllElements().filter((el) =>
          selectedElementIds.includes(el.id)
        );

        // 각 요소를 히스토리에 기록
        selectedElements.forEach((element) => {
          historyManagerRef.current.recordDelete(element);
          elementManagerRef.current.deleteElement(element.id);
        });

        // Redux 상태에서 선택된 요소들 삭제
        dispatch(deleteSelectedElements());

        // 히스토리 상태 업데이트
        const historyState = historyManagerRef.current.getState();
        dispatch(setHistoryState({
          canUndo: historyState.canUndo,
          canRedo: historyState.canRedo,
          count: historyState.undoCount,
        }));
      }
    },
    { enableOnFormTags: false }
  );

  // Ctrl+Z: Undo
  useHotkeys(
    'ctrl+z, meta+z',
    (e) => {
      e.preventDefault();
      if (canUndo) {
        const action = historyManagerRef.current.getUndoAction();
        if (!action) return;

        // Undo 로직
        switch (action.type) {
          case 'add':
            if (action.after) {
              dispatch(deleteElement(action.elementId));
              elementManagerRef.current.deleteElement(action.elementId);
            }
            break;
          case 'delete':
            if (action.before) {
              dispatch(addElement(action.before));
              elementManagerRef.current.addElement(action.before);
            }
            break;
          case 'update':
            if (action.before) {
              dispatch(updateElement({ id: action.elementId, updates: action.before }));
              elementManagerRef.current.updateElement(action.elementId, action.before);
            }
            break;
        }

        // 히스토리 상태 업데이트
        const historyState = historyManagerRef.current.getState();
        dispatch(setHistoryState({
          canUndo: historyState.canUndo,
          canRedo: historyState.canRedo,
          count: historyState.undoCount,
        }));
      }
    },
    { enableOnFormTags: false },
    [canUndo]
  );

  // Ctrl+Shift+Z or Ctrl+Y: Redo
  useHotkeys(
    'ctrl+shift+z, meta+shift+z, ctrl+y, meta+y',
    (e) => {
      e.preventDefault();
      if (canRedo) {
        const action = historyManagerRef.current.getRedoAction();
        if (!action) return;

        // Redo 로직
        switch (action.type) {
          case 'add':
            if (action.after) {
              dispatch(addElement(action.after));
              elementManagerRef.current.addElement(action.after);
            }
            break;
          case 'delete':
            dispatch(deleteElement(action.elementId));
            elementManagerRef.current.deleteElement(action.elementId);
            break;
          case 'update':
            if (action.after) {
              dispatch(updateElement({ id: action.elementId, updates: action.after }));
              elementManagerRef.current.updateElement(action.elementId, action.after);
            }
            break;
        }

        // 히스토리 상태 업데이트
        const historyState = historyManagerRef.current.getState();
        dispatch(setHistoryState({
          canUndo: historyState.canUndo,
          canRedo: historyState.canRedo,
          count: historyState.undoCount,
        }));
      }
    },
    { enableOnFormTags: false },
    [canRedo]
  );

  // PDF 로드 및 초기화
  useEffect(() => {
    // 파일이 없으면 중단
    if (!file) {
      return;
    }

    // 이미 초기화되었으면 중단
    if (initializedRef.current) {
      return;
    }

    // 초기화 플래그 설정 및 상태 즉시 초기화
    initializedRef.current = true;
    dispatch(setPages([]));  // pages를 먼저 빈 배열로 초기화

    let cancelled = false;

    const loadPDF = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setPdfFile(file));

        // PDF 렌더러로 파일 로드
        await rendererRef.current.loadPDF(file);

        // 취소되었으면 중단
        if (cancelled) {
          dispatch(setLoading(false));
          return;
        }

        // 페이지 정보 가져오기
        const pdfPages = rendererRef.current.getPages();
        dispatch(setPages(pdfPages));

        // 썸네일 생성
        await rendererRef.current.generateAllThumbnails();

        // 취소되었으면 중단
        if (cancelled) {
          dispatch(setLoading(false));
          return;
        }

        const pagesWithThumbnails = rendererRef.current.getPages();
        dispatch(setPages(pagesWithThumbnails));

        dispatch(setLoading(false));
      } catch (err) {
        if (!cancelled) {
          console.error('PDF load error:', err);
          dispatch(
            setError(
              err instanceof Error ? err.message : 'Failed to load PDF'
            )
          );
        }
      }
    };

    loadPDF();

    // Cleanup: 진행 중인 로드 취소
    return () => {
      cancelled = true;
    };
  }, [file, dispatch]);

  // 캔버스 크기 조정
  useEffect(() => {
    const handleResize = () => {
      const mainContent = document.querySelector('.pdf-editor-main');
      if (mainContent) {
        const rect = mainContent.getBoundingClientRect();
        dispatch(
          setCanvasSize({
            width: rect.width,
            height: rect.height,
          })
        );
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch, showSidebar, showProperties]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">오류 발생</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !initializedRef.current) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">PDF 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 툴바 */}
      <Toolbar
        renderer={rendererRef.current}
        elementManager={elementManagerRef.current}
        historyManager={historyManagerRef.current}
        onBack={onBack}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 (페이지 썸네일) */}
        {showSidebar && (
          <Sidebar
            pages={pages}
            currentPage={currentPage}
            renderer={rendererRef.current}
          />
        )}

        {/* 캔버스 영역 */}
        <div className="flex-1 overflow-auto pdf-editor-main">
          <PDFCanvas
            renderer={rendererRef.current}
            elementManager={elementManagerRef.current}
            historyManager={historyManagerRef.current}
          />
        </div>

        {/* 속성 패널 */}
        {showProperties && (
          <PropertiesPanel
            elementManager={elementManagerRef.current}
          />
        )}
      </div>
    </div>
  );
}

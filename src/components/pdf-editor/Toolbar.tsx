"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  Image as ImageIcon,
  Minus,
  MousePointer2,
  Redo,
  Settings,
  SidebarIcon,
  Square,
  Trash2,
  Type,
  Undo,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ElementManager } from "@/lib/pdf-editor/element-manager";
import { downloadPDF, exportPDF } from "@/lib/pdf-editor/export";
import type {
  HistoryAction,
  HistoryManager,
} from "@/lib/pdf-editor/history-manager";
import type { PDFRenderer } from "@/lib/pdf-editor/renderer";
import type { TextElement, ToolType } from "@/lib/pdf-editor/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addElement,
  bringToFront,
  deleteElement,
  deleteSelectedElements,
  nextPage,
  previousPage,
  resetZoom,
  sendToBack,
  setError,
  setHistoryState,
  setSaving,
  setSelectedShapeType,
  setTool,
  toggleProperties,
  toggleSidebar,
  updateElement,
  zoomIn,
  zoomOut,
} from "@/store/slices/editorSlice";

interface ToolbarProps {
  renderer: PDFRenderer;
  elementManager: ElementManager;
  historyManager: HistoryManager;
  onBack?: () => void;
}

export default function Toolbar({
  renderer,
  elementManager,
  historyManager,
  onBack,
}: ToolbarProps) {
  const dispatch = useAppDispatch();
  const {
    currentTool,
    selectedShapeType,
    zoom,
    currentPage,
    totalPages,
    canUndo,
    canRedo,
    showSidebar,
    showProperties,
    pdfFile,
    elements,
    isSaving,
    selectedElementIds,
  } = useAppSelector((state) => state.editor);

  const tools: Array<{ type: ToolType; icon: React.ReactNode; label: string }> =
    [
      { type: "select", icon: <MousePointer2 size={18} />, label: "선택" },
      { type: "text", icon: <Type size={18} />, label: "텍스트" },
      { type: "image", icon: <ImageIcon size={18} />, label: "이미지" },
      { type: "shape", icon: <Square size={18} />, label: "도형" },
    ];

  const handleToolChange = (tool: ToolType) => {
    dispatch(setTool(tool));
  };

  // 선택된 텍스트 요소 가져오기
  const selectedTextElement =
    selectedElementIds.length === 1
      ? (elements.find(
          (el) => el.id === selectedElementIds[0] && el.type === "text",
        ) as TextElement | undefined)
      : undefined;

  // 텍스트 속성 업데이트 핸들러
  const handleTextPropertyUpdate = (updates: Partial<TextElement>) => {
    if (!selectedTextElement) return;

    dispatch(updateElement({ id: selectedTextElement.id, updates }));
    elementManager.updateElement(selectedTextElement.id, updates);
  };

  const handleUndo = () => {
    const action = historyManager.getUndoAction();
    if (!action) return;

    // Undo 로직: 액션 타입에 따라 역방향 처리
    switch (action.type) {
      case "add":
        // 추가된 요소를 삭제
        if (action.after) {
          dispatch(deleteElement(action.elementId));
          elementManager.deleteElement(action.elementId);
        }
        break;
      case "delete":
        // 삭제된 요소를 복원
        if (action.before) {
          dispatch(addElement(action.before));
          elementManager.addElement(action.before);
        }
        break;
      case "update":
        // 이전 상태로 복원
        if (action.before) {
          dispatch(
            updateElement({ id: action.elementId, updates: action.before }),
          );
          elementManager.updateElement(action.elementId, action.before);
        }
        break;
    }

    // 히스토리 상태 업데이트
    const historyState = historyManager.getState();
    dispatch(
      setHistoryState({
        canUndo: historyState.canUndo,
        canRedo: historyState.canRedo,
        count: historyState.undoCount,
      }),
    );
  };

  const handleRedo = () => {
    const action = historyManager.getRedoAction();
    if (!action) return;

    // Redo 로직: 액션 타입에 따라 정방향 처리
    switch (action.type) {
      case "add":
        // 요소를 다시 추가
        if (action.after) {
          dispatch(addElement(action.after));
          elementManager.addElement(action.after);
        }
        break;
      case "delete":
        // 요소를 다시 삭제
        dispatch(deleteElement(action.elementId));
        elementManager.deleteElement(action.elementId);
        break;
      case "update":
        // 이후 상태로 적용
        if (action.after) {
          dispatch(
            updateElement({ id: action.elementId, updates: action.after }),
          );
          elementManager.updateElement(action.elementId, action.after);
        }
        break;
    }

    // 히스토리 상태 업데이트
    const historyState = historyManager.getState();
    dispatch(
      setHistoryState({
        canUndo: historyState.canUndo,
        canRedo: historyState.canRedo,
        count: historyState.undoCount,
      }),
    );
  };

  const handleDelete = () => {
    if (selectedElementIds.length === 0) return;

    // 삭제 전에 선택된 요소들의 정보 가져오기
    const selectedElements = elements.filter((el) =>
      selectedElementIds.includes(el.id),
    );

    // 각 요소를 히스토리에 기록
    selectedElements.forEach((element) => {
      historyManager.recordDelete(element);
      elementManager.deleteElement(element.id);
    });

    // Redux 상태에서 선택된 요소들 삭제
    dispatch(deleteSelectedElements());

    // 히스토리 상태 업데이트
    const historyState = historyManager.getState();
    dispatch(
      setHistoryState({
        canUndo: historyState.canUndo,
        canRedo: historyState.canRedo,
        count: historyState.undoCount,
      }),
    );
  };

  const handleDownload = async () => {
    if (!pdfFile) {
      alert("PDF 파일이 로드되지 않았습니다.");
      return;
    }

    console.log("=== 다운로드 시작 ===");
    console.log("Redux elements:", elements);
    console.log("ElementManager 전체 요소:", elementManager.getAllElements());
    console.log("현재 페이지:", currentPage);

    try {
      dispatch(setSaving(true));

      // PDF 파일을 Base64로 변환
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      );

      // ElementManager에서 최신 요소 가져오기 (Redux 대신)
      const currentElements = elementManager.getAllElements();

      console.log("=== 다운로드 시 ElementManager 요소 ===");
      console.log("총 요소 개수:", currentElements.length);
      console.log("요소 목록:", currentElements);

      // 각 요소의 상세 정보 출력
      currentElements.forEach((el, index) => {
        console.log(`요소 ${index + 1}:`, {
          id: el.id,
          type: el.type,
          pageNumber: el.pageNumber,
          ...(el.type === "text" ? { content: (el as any).content } : {}),
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
        });
      });

      // API 호출하여 편집 적용
      const result = await exportPDF(
        {
          originalPdfBase64: base64,
          elements: currentElements,
          pageCount: totalPages,
        },
        {
          fileName: pdfFile.name.replace(".pdf", "_edited.pdf"),
          quality: "high",
          format: "pdf",
        },
      );

      if (result.success && result.data) {
        // 다운로드
        downloadPDF(result.data, pdfFile.name.replace(".pdf", "_edited.pdf"));
      } else {
        throw new Error(result.error || "Failed to export PDF");
      }

      dispatch(setSaving(false));
    } catch (error) {
      console.error("Download error:", error);
      dispatch(setSaving(false));
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "PDF 다운로드에 실패했습니다.",
        ),
      );
      alert("PDF 다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="h-14 bg-background border-b border flex items-center px-4 gap-2">
      {/* 돌아가기 버튼 */}
      {onBack && (
        <>
          <Button variant="ghost" size="sm" onClick={onBack} title="돌아가기">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* 도구 선택 */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <Button
            key={tool.type}
            variant={currentTool === tool.type ? "default" : "ghost"}
            size="sm"
            onClick={() => handleToolChange(tool.type)}
            title={tool.label}
          >
            {tool.icon}
          </Button>
        ))}
      </div>

      {/* 도형 타입 선택 (도형 도구 선택 시에만 표시) */}
      {currentTool === "shape" && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            <Button
              variant={selectedShapeType === "rectangle" ? "default" : "ghost"}
              size="sm"
              onClick={() => dispatch(setSelectedShapeType("rectangle"))}
              title="사각형"
            >
              <Square size={18} />
            </Button>
            <Button
              variant={selectedShapeType === "circle" ? "default" : "ghost"}
              size="sm"
              onClick={() => dispatch(setSelectedShapeType("circle"))}
              title="원"
            >
              <Circle size={18} />
            </Button>
            <Button
              variant={selectedShapeType === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => dispatch(setSelectedShapeType("line"))}
              title="선"
            >
              <Minus size={18} />
            </Button>
          </div>
        </>
      )}

      <Separator orientation="vertical" className="h-6" />

      {/* Undo/Redo/Delete */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={!canUndo}
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo size={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={!canRedo}
          title="다시 실행 (Ctrl+Shift+Z)"
        >
          <Redo size={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={selectedElementIds.length === 0}
          title="삭제 (Delete)"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      {/* 텍스트 포맷팅 (텍스트 요소 선택 시에만 표시) */}
      {selectedTextElement && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            {/* 폰트 선택 */}
            <select
              value={selectedTextElement.fontFamily}
              onChange={(e) =>
                handleTextPropertyUpdate({ fontFamily: e.target.value })
              }
              className="h-8 px-2 text-xs border border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              title="폰트"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Noto Sans KR">Noto Sans KR</option>
            </select>

            {/* 폰트 크기 */}
            <input
              type="number"
              min="8"
              max="72"
              value={selectedTextElement.fontSize}
              onChange={(e) => {
                const fontSize = parseInt(e.target.value);
                if (fontSize >= 8 && fontSize <= 72) {
                  handleTextPropertyUpdate({ fontSize });
                }
              }}
              className="w-14 h-8 px-2 text-xs text-center border border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              title="폰트 크기"
            />

            {/* 색상 프리셋 */}
            <div className="flex gap-1">
              {["#000000", "#E5322D", "#4299E1", "#48BB78", "#F6BD60"].map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      handleTextPropertyUpdate({ fontColor: color })
                    }
                    className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                      selectedTextElement.fontColor === color
                        ? "border-foreground"
                        : "border"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ),
              )}
            </div>

            {/* B/I/U 버튼 */}
            <div className="flex gap-1">
              <Button
                variant={selectedTextElement.bold ? "default" : "ghost"}
                size="sm"
                onClick={() =>
                  handleTextPropertyUpdate({ bold: !selectedTextElement.bold })
                }
                className="w-7 h-7 p-0 font-bold"
                title="굵게"
              >
                B
              </Button>
              <Button
                variant={selectedTextElement.italic ? "default" : "ghost"}
                size="sm"
                onClick={() =>
                  handleTextPropertyUpdate({
                    italic: !selectedTextElement.italic,
                  })
                }
                className="w-7 h-7 p-0 italic"
                title="기울임"
              >
                I
              </Button>
              <Button
                variant={selectedTextElement.underline ? "default" : "ghost"}
                size="sm"
                onClick={() =>
                  handleTextPropertyUpdate({
                    underline: !selectedTextElement.underline,
                  })
                }
                className="w-7 h-7 p-0 underline"
                title="밑줄"
              >
                U
              </Button>
            </div>
          </div>
        </>
      )}

      {/* 레이어 순서 조정 */}
      {selectedElementIds.length === 1 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const elementId = selectedElementIds[0];
                dispatch(bringToFront(elementId));
              }}
              title="맨 앞으로"
            >
              <ArrowUp size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const elementId = selectedElementIds[0];
                dispatch(sendToBack(elementId));
              }}
              title="맨 뒤로"
            >
              <ArrowDown size={18} />
            </Button>
          </div>
        </>
      )}

      <Separator orientation="vertical" className="h-6" />

      {/* 페이지 네비게이션 */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(previousPage())}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={18} />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(nextPage())}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* 줌 컨트롤 */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(zoomOut())}
          title="축소 (Ctrl+-)"
        >
          <ZoomOut size={18} />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(zoomIn())}
          title="확대 (Ctrl++)"
        >
          <ZoomIn size={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(resetZoom())}
          className="text-xs"
        >
          100%
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* UI 토글 */}
      <div className="flex items-center gap-1">
        <Button
          variant={showSidebar ? "default" : "ghost"}
          size="sm"
          onClick={() => dispatch(toggleSidebar())}
          title="사이드바 토글"
        >
          <SidebarIcon size={18} />
        </Button>
        <Button
          variant={showProperties ? "default" : "ghost"}
          size="sm"
          onClick={() => dispatch(toggleProperties())}
          title="속성 패널 토글"
        >
          <Settings size={18} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* 다운로드 */}
      <Button
        onClick={handleDownload}
        size="sm"
        disabled={isSaving || !pdfFile}
      >
        <Download size={18} className="mr-2" />
        {isSaving ? "저장 중..." : "다운로드"}
      </Button>
    </div>
  );
}

// 편집 히스토리 관리자 (Undo/Redo)
import type { EditElement, HistoryItem } from "./types";

export interface HistoryAction {
  type: "add" | "update" | "delete";
  elementId: string;
  before?: EditElement;
  after?: EditElement;
}

export class HistoryManager {
  private undoStack: HistoryAction[] = [];
  private redoStack: HistoryAction[] = [];
  private maxHistorySize: number = 50;

  /**
   * 액션 기록
   */
  recordAction(action: HistoryAction): void {
    this.undoStack.push(action);
    this.redoStack = []; // 새 액션 시 redo 스택 초기화

    // 최대 히스토리 크기 초과 시 오래된 항목 제거
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }

  /**
   * 요소 추가 기록
   */
  recordAdd(element: EditElement): void {
    this.recordAction({
      type: "add",
      elementId: element.id,
      after: element,
    });
  }

  /**
   * 요소 업데이트 기록
   */
  recordUpdate(before: EditElement, after: EditElement): void {
    this.recordAction({
      type: "update",
      elementId: before.id,
      before,
      after,
    });
  }

  /**
   * 요소 삭제 기록
   */
  recordDelete(element: EditElement): void {
    this.recordAction({
      type: "delete",
      elementId: element.id,
      before: element,
    });
  }

  /**
   * Undo 가능 여부
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Redo 가능 여부
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Undo 액션 가져오기
   */
  getUndoAction(): HistoryAction | null {
    if (!this.canUndo()) return null;

    const action = this.undoStack.pop()!;
    this.redoStack.push(action);
    return action;
  }

  /**
   * Redo 액션 가져오기
   */
  getRedoAction(): HistoryAction | null {
    if (!this.canRedo()) return null;

    const action = this.redoStack.pop()!;
    this.undoStack.push(action);
    return action;
  }

  /**
   * 히스토리 초기화
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Undo 스택 크기
   */
  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Redo 스택 크기
   */
  getRedoStackSize(): number {
    return this.redoStack.length;
  }

  /**
   * 최대 히스토리 크기 설정
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    // 기존 스택이 새 최대값을 초과하면 자르기
    if (this.undoStack.length > size) {
      this.undoStack = this.undoStack.slice(-size);
    }
  }

  /**
   * 현재 히스토리 상태
   */
  getState(): {
    canUndo: boolean;
    canRedo: boolean;
    undoCount: number;
    redoCount: number;
  } {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    };
  }
}

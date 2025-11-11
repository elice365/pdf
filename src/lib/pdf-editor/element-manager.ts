// 편집 요소 관리자
import type { BaseElement, EditElement } from "./types";

export class ElementManager {
  private elements: Map<string, EditElement> = new Map();
  private selectedIds: Set<string> = new Set();

  /**
   * 요소 추가
   */
  addElement(element: EditElement): void {
    this.elements.set(element.id, element);
  }

  /**
   * 요소 업데이트
   */
  updateElement(id: string, updates: Partial<EditElement>): EditElement | null {
    const element = this.elements.get(id);
    if (!element) return null;

    const updated = { ...element, ...updates } as EditElement;
    this.elements.set(id, updated);
    return updated;
  }

  /**
   * 요소 삭제
   */
  deleteElement(id: string): boolean {
    this.selectedIds.delete(id);
    return this.elements.delete(id);
  }

  /**
   * 여러 요소 삭제
   */
  deleteElements(ids: string[]): void {
    ids.forEach((id) => this.deleteElement(id));
  }

  /**
   * 요소 가져오기
   */
  getElement(id: string): EditElement | undefined {
    return this.elements.get(id);
  }

  /**
   * 모든 요소 가져오기
   */
  getAllElements(): EditElement[] {
    return Array.from(this.elements.values());
  }

  /**
   * 특정 페이지의 요소 가져오기
   */
  getElementsByPage(pageNumber: number): EditElement[] {
    return this.getAllElements().filter((el) => el.pageNumber === pageNumber);
  }

  /**
   * 요소 선택
   */
  selectElement(id: string): void {
    if (this.elements.has(id)) {
      this.selectedIds.add(id);
    }
  }

  /**
   * 여러 요소 선택
   */
  selectElements(ids: string[]): void {
    ids.forEach((id) => this.selectElement(id));
  }

  /**
   * 요소 선택 해제
   */
  deselectElement(id: string): void {
    this.selectedIds.delete(id);
  }

  /**
   * 모든 선택 해제
   */
  clearSelection(): void {
    this.selectedIds.clear();
  }

  /**
   * 선택된 요소 가져오기
   */
  getSelectedElements(): EditElement[] {
    return Array.from(this.selectedIds)
      .map((id) => this.elements.get(id))
      .filter((el): el is EditElement => el !== undefined);
  }

  /**
   * 선택된 요소 ID 가져오기
   */
  getSelectedIds(): string[] {
    return Array.from(this.selectedIds);
  }

  /**
   * 요소가 선택되었는지 확인
   */
  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  /**
   * 요소 위치 변경
   */
  moveElement(id: string, x: number, y: number): EditElement | null {
    return this.updateElement(id, { x, y } as Partial<EditElement>);
  }

  /**
   * 요소 크기 변경
   */
  resizeElement(id: string, width: number, height: number): EditElement | null {
    return this.updateElement(id, { width, height } as Partial<EditElement>);
  }

  /**
   * 요소 회전
   */
  rotateElement(id: string, rotation: number): EditElement | null {
    return this.updateElement(id, { rotation } as Partial<EditElement>);
  }

  /**
   * 요소 투명도 변경
   */
  setElementOpacity(id: string, opacity: number): EditElement | null {
    return this.updateElement(id, { opacity } as Partial<EditElement>);
  }

  /**
   * 선택된 요소들 앞으로 가져오기
   */
  bringToFront(ids: string[]): void {
    const elements = this.getAllElements();
    const selected = ids
      .map((id) => this.elements.get(id))
      .filter((el): el is EditElement => el !== undefined);

    const others = elements.filter((el) => !ids.includes(el.id));

    this.elements.clear();
    [...others, ...selected].forEach((el) => this.elements.set(el.id, el));
  }

  /**
   * 선택된 요소들 뒤로 보내기
   */
  sendToBack(ids: string[]): void {
    const elements = this.getAllElements();
    const selected = ids
      .map((id) => this.elements.get(id))
      .filter((el): el is EditElement => el !== undefined);

    const others = elements.filter((el) => !ids.includes(el.id));

    this.elements.clear();
    [...selected, ...others].forEach((el) => this.elements.set(el.id, el));
  }

  /**
   * 모든 요소 제거
   */
  clear(): void {
    this.elements.clear();
    this.selectedIds.clear();
  }

  /**
   * 요소 개수
   */
  getCount(): number {
    return this.elements.size;
  }
}

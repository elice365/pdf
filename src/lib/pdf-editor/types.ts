// PDF Editor 타입 정의

export type ToolType = 'select' | 'text' | 'image' | 'shape' | 'annotation' | 'signature';
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

// 기본 편집 요소 인터페이스
export interface BaseElement {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
}

// 텍스트 요소
export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  alignment: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

// 이미지 요소
export interface ImageElement extends BaseElement {
  type: 'image';
  imageData: string; // Base64 또는 Blob URL
}

// 도형 요소
export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
}

// 주석 요소
export interface AnnotationElement extends BaseElement {
  type: 'annotation';
  annotationType: 'highlight' | 'underline' | 'strikethrough';
  color: string;
}

// 서명 요소
export interface SignatureElement extends BaseElement {
  type: 'signature';
  signatureData: string;
  signatureType: 'drawn' | 'image' | 'text';
}

// 통합 편집 요소 타입
export type EditElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | AnnotationElement
  | SignatureElement;

// PDF 페이지 정보
export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  thumbnail?: string;
}

// 편집 히스토리 항목
export interface HistoryItem {
  action: 'add' | 'update' | 'delete';
  element: EditElement;
  timestamp: number;
}

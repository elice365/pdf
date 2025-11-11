// PDF 내보내기 유틸리티
import type { EditElement, TextElement, ImageElement, ShapeElement } from './types';

export interface ExportOptions {
  fileName?: string;
  quality?: 'low' | 'medium' | 'high';
  format?: 'pdf' | 'png' | 'jpg';
}

export interface ExportData {
  originalPdfBase64: string;
  elements: EditElement[];
  pageCount: number;
}

/**
 * 편집된 PDF를 서버로 전송하여 내보내기
 */
export async function exportPDF(
  data: ExportData,
  options: ExportOptions = {}
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('pdfData', data.originalPdfBase64);
    formData.append('elements', JSON.stringify(data.elements));
    formData.append('pageCount', data.pageCount.toString());

    if (options.fileName) {
      formData.append('fileName', options.fileName);
    }
    if (options.quality) {
      formData.append('quality', options.quality);
    }
    if (options.format) {
      formData.append('format', options.format);
    }

    const response = await fetch('/api/pdf/editor/apply', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Export failed' };
    }

    const result = await response.json();
    return { success: true, data: result.pdf };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Base64를 Blob으로 변환
 */
export function base64ToBlob(base64: string, contentType = 'application/pdf'): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}

/**
 * 다운로드 트리거
 */
export function downloadPDF(base64: string, fileName: string = 'edited.pdf'): void {
  const blob = base64ToBlob(base64);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * 요소를 Fabric.js 객체로 변환하는 헬퍼
 */
export function elementToFabricObject(element: EditElement): any {
  // Fabric.js는 클라이언트 사이드에서만 사용 가능
  // 실제 구현은 PDFCanvas 컴포넌트에서 진행
  return null;
}

/**
 * Fabric.js 객체를 요소로 변환하는 헬퍼
 */
export function fabricObjectToElement(fabricObject: any): EditElement | null {
  // Fabric.js는 클라이언트 사이드에서만 사용 가능
  // 실제 구현은 PDFCanvas 컴포넌트에서 진행
  return null;
}

/**
 * 요소 검증
 */
export function validateElement(element: EditElement): boolean {
  // 기본 검증
  if (!element.id || !element.pageNumber) return false;
  if (element.width < 0 || element.height < 0) return false;
  if (element.opacity !== undefined && (element.opacity < 0 || element.opacity > 1)) {
    return false;
  }

  // 타입별 검증
  switch (element.type) {
    case 'text':
      return !!(element as TextElement).content;
    case 'image':
      return !!(element as ImageElement).imageData;
    case 'shape':
      return !!(element as ShapeElement).shapeType;
    default:
      return true;
  }
}

/**
 * 요소 목록 검증
 */
export function validateElements(elements: EditElement[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  elements.forEach((element, index) => {
    if (!validateElement(element)) {
      errors.push(`Element at index ${index} is invalid`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

import { type NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type {
  EditElement,
  TextElement,
  ImageElement,
  ShapeElement,
} from '@/lib/pdf-editor/types';

// 한글 감지 함수
function containsKorean(text: string): boolean {
  return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
}

// 한글 폰트 캐시
let koreanFontCache: ArrayBuffer | null = null;

// 한글 폰트 로드 (Noto Sans KR)
async function loadKoreanFont(): Promise<ArrayBuffer> {
  if (koreanFontCache) {
    return koreanFontCache;
  }

  try {
    // Google Fonts에서 Noto Sans KR 폰트 다운로드
    const response = await fetch(
      'https://github.com/google/fonts/raw/main/ofl/notosanskr/NotoSansKR-Regular.ttf'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Korean font');
    }

    const fontBuffer = await response.arrayBuffer();
    koreanFontCache = fontBuffer;
    return fontBuffer;
  } catch (error) {
    console.error('Failed to load Korean font:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfData = formData.get('pdfData') as string;
    const elementsData = formData.get('elements') as string;
    const pageCount = parseInt(formData.get('pageCount') as string);

    console.log('=== API 요청 수신 ===');
    console.log('pageCount:', pageCount);

    if (!pdfData || !elementsData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Base64 PDF 데이터를 디코드
    const pdfBytes = Buffer.from(pdfData, 'base64');

    // PDF 문서 로드
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // fontkit 등록 (커스텀 폰트 사용을 위해)
    pdfDoc.registerFontkit(fontkit);

    // 편집 요소 파싱
    const elements: EditElement[] = JSON.parse(elementsData);

    console.log('=== 수신된 요소 ===');
    console.log('요소 개수:', elements.length);
    elements.forEach((el, index) => {
      console.log(`요소 ${index + 1}:`, {
        id: el.id,
        type: el.type,
        pageNumber: el.pageNumber,
        ...(el.type === 'text' ? { content: (el as any).content } : {}),
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
      });
    });

    // 한글이 포함된 텍스트가 있는지 확인
    const hasKoreanText = elements.some(
      (el) => el.type === 'text' && containsKorean((el as TextElement).content)
    );

    // 한글 폰트 미리 로드
    let koreanFont: any = null;
    if (hasKoreanText) {
      try {
        const fontBytes = await loadKoreanFont();
        koreanFont = await pdfDoc.embedFont(fontBytes);
      } catch (error) {
        console.error('Failed to embed Korean font:', error);
        // 폰트 로드 실패 시 계속 진행 (기본 폰트 사용)
      }
    }

    // 페이지별로 요소 그룹화
    const elementsByPage = new Map<number, EditElement[]>();
    for (const element of elements) {
      if (!elementsByPage.has(element.pageNumber)) {
        elementsByPage.set(element.pageNumber, []);
      }
      elementsByPage.get(element.pageNumber)?.push(element);
    }

    // 각 페이지에 요소 추가
    for (const [pageNumber, pageElements] of elementsByPage.entries()) {
      const page = pdfDoc.getPage(pageNumber - 1); // 0-based index
      const { height } = page.getSize();

      for (const element of pageElements) {
        try {
          if (element.type === 'text') {
            await applyTextElement(pdfDoc, page, element as TextElement, height, koreanFont);
          } else if (element.type === 'image') {
            await applyImageElement(pdfDoc, page, element as ImageElement, height);
          } else if (element.type === 'shape') {
            await applyShapeElement(page, element as ShapeElement, height);
          }
        } catch (error) {
          console.error(`Failed to apply element ${element.id}:`, error);
          // Continue with other elements
        }
      }
    }

    // PDF 저장
    const modifiedPdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(modifiedPdfBytes).toString('base64');

    return NextResponse.json({
      success: true,
      pdf: base64,
    });
  } catch (error) {
    console.error('Apply edits error:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply edits',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 텍스트 요소 적용
async function applyTextElement(
  pdfDoc: any,
  page: any,
  element: TextElement,
  pageHeight: number,
  koreanFont: any = null
) {
  // PDF 좌표계는 하단 왼쪽이 원점이므로 Y 좌표 변환
  const y = pageHeight - element.y - element.height;

  // 폰트 선택: 한글이 포함되어 있고 한글 폰트가 있으면 사용, 아니면 기본 폰트
  let font;
  if (containsKorean(element.content) && koreanFont) {
    font = koreanFont;
  } else {
    font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  }

  // 색상 파싱
  const color = parseColor(element.fontColor);

  // 텍스트 그리기
  page.drawText(element.content, {
    x: element.x,
    y,
    size: element.fontSize,
    font,
    color,
    opacity: element.opacity ?? 1,
    rotate: element.rotation
      ? { type: 'degrees' as const, angle: element.rotation }
      : undefined,
  });
}

// 이미지 요소 적용
async function applyImageElement(
  pdfDoc: any,
  page: any,
  element: ImageElement,
  pageHeight: number
) {
  const y = pageHeight - element.y - element.height;

  // Base64 이미지 데이터 디코드
  const imageData = element.imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  const imageBytes = Buffer.from(imageData, 'base64');

  // 이미지 포맷 감지 및 임베드
  let image;
  try {
    image = await pdfDoc.embedPng(imageBytes);
  } catch {
    try {
      image = await pdfDoc.embedJpg(imageBytes);
    } catch (error) {
      console.error('Failed to embed image:', error);
      return;
    }
  }

  // 이미지 그리기
  page.drawImage(image, {
    x: element.x,
    y,
    width: element.width,
    height: element.height,
    opacity: element.opacity ?? 1,
    rotate: element.rotation
      ? { type: 'degrees' as const, angle: element.rotation }
      : undefined,
  });
}

// 도형 요소 적용
async function applyShapeElement(
  page: any,
  element: ShapeElement,
  pageHeight: number
) {
  const y = pageHeight - element.y - element.height;

  const strokeColor = parseColor(element.strokeColor);
  const fillColor = parseColor(element.fillColor);

  if (element.shapeType === 'rectangle') {
    // 채우기
    if (element.fillColor !== 'transparent') {
      page.drawRectangle({
        x: element.x,
        y,
        width: element.width,
        height: element.height,
        color: fillColor,
        opacity: element.opacity ?? 1,
        rotate: element.rotation
          ? { type: 'degrees' as const, angle: element.rotation }
          : undefined,
      });
    }

    // 테두리
    if (element.strokeWidth > 0) {
      page.drawRectangle({
        x: element.x,
        y,
        width: element.width,
        height: element.height,
        borderColor: strokeColor,
        borderWidth: element.strokeWidth,
        opacity: element.opacity ?? 1,
        rotate: element.rotation
          ? { type: 'degrees' as const, angle: element.rotation }
          : undefined,
      });
    }
  } else if (element.shapeType === 'circle') {
    const radius = Math.min(element.width, element.height) / 2;
    const centerX = element.x + element.width / 2;
    const centerY = y + element.height / 2;

    // 채우기
    if (element.fillColor !== 'transparent') {
      page.drawCircle({
        x: centerX,
        y: centerY,
        size: radius,
        color: fillColor,
        opacity: element.opacity ?? 1,
      });
    }

    // 테두리
    if (element.strokeWidth > 0) {
      page.drawCircle({
        x: centerX,
        y: centerY,
        size: radius,
        borderColor: strokeColor,
        borderWidth: element.strokeWidth,
        opacity: element.opacity ?? 1,
      });
    }
  } else if (element.shapeType === 'line') {
    page.drawLine({
      start: { x: element.x, y },
      end: { x: element.x + element.width, y: y + element.height },
      color: strokeColor,
      thickness: element.strokeWidth,
      opacity: element.opacity ?? 1,
    });
  }
}

// 색상 문자열을 RGB로 파싱
function parseColor(colorString: string) {
  // Hex 색상 파싱
  if (colorString.startsWith('#')) {
    const hex = colorString.substring(1);
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  }

  // RGB/RGBA 파싱
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return rgb(
      parseInt(rgbMatch[1]) / 255,
      parseInt(rgbMatch[2]) / 255,
      parseInt(rgbMatch[3]) / 255
    );
  }

  // 기본값 검은색
  return rgb(0, 0, 0);
}

export const runtime = 'nodejs';
export const maxDuration = 60;

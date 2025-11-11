'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addElement,
  updateElement,
  setSelectedElements,
  clearSelection,
  setDrawing,
  setTool,
} from '@/store/slices/editorSlice';
import type { PDFRenderer } from '@/lib/pdf-editor/renderer';
import type { ElementManager } from '@/lib/pdf-editor/element-manager';
import type { HistoryManager } from '@/lib/pdf-editor/history-manager';
import type { EditElement, TextElement, ImageElement, ShapeElement } from '@/lib/pdf-editor/types';

interface PDFCanvasProps {
  renderer: PDFRenderer;
  elementManager: ElementManager;
  historyManager: HistoryManager;
}

export default function PDFCanvas({
  renderer,
  elementManager,
  historyManager,
}: PDFCanvasProps) {
  const dispatch = useAppDispatch();
  const { currentPage, zoom, currentTool, selectedShapeType, elements } = useAppSelector(
    (state) => state.editor
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tempShapeRef = useRef<fabric.Object | null>(null);

  // 이벤트 핸들러의 stale closure 문제 방지를 위해 ref로 관리
  const currentToolRef = useRef(currentTool);
  const selectedShapeTypeRef = useRef(selectedShapeType);
  const isDrawingShapeRef = useRef(false);
  const shapeStartPointRef = useRef<{ x: number; y: number } | null>(null);

  const [pdfImage, setPdfImage] = useState<HTMLCanvasElement | null>(null);

  // ref 값 동기화
  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  useEffect(() => {
    selectedShapeTypeRef.current = selectedShapeType;
  }, [selectedShapeType]);

  // PDF 페이지 렌더링
  useEffect(() => {
    const renderPage = async () => {
      try {
        const canvas = await renderer.renderPage(currentPage, 2.0);
        setPdfImage(canvas);
      } catch (error) {
        console.error('Failed to render page:', error);
      }
    };

    renderPage();
  }, [currentPage, renderer]);

  // 도구 전환 시 그리기 상태 초기화
  useEffect(() => {
    if (fabricCanvasRef.current && tempShapeRef.current) {
      fabricCanvasRef.current.remove(tempShapeRef.current);
      tempShapeRef.current = null;
    }
    isDrawingShapeRef.current = false;
    shapeStartPointRef.current = null;
  }, [currentTool]);

  // Fabric.js 캔버스 초기화
  useEffect(() => {
    if (!canvasRef.current || !pdfImage) return;

    // 기존 캔버스 정리
    if (fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current.dispose();
      } catch (error) {
        console.warn('Failed to dispose canvas:', error);
      }
      fabricCanvasRef.current = null;
    }

    // 새 Fabric 캔버스 생성
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: pdfImage.width,
      height: pdfImage.height,
      selection: currentToolRef.current === 'select',
    });

    // PDF 이미지를 배경으로 설정
    canvas.setBackgroundImage(
      pdfImage.toDataURL(),
      canvas.renderAll.bind(canvas),
      {
        scaleX: 1,
        scaleY: 1,
      }
    );

    fabricCanvasRef.current = canvas;

    // 이벤트 리스너 설정
    setupEventListeners(canvas);

    // 현재 페이지의 요소들을 캔버스에 복원
    restoreElementsToCanvas(canvas);

    return () => {
      try {
        if (canvas) {
          canvas.dispose();
        }
      } catch (error) {
        console.warn('Failed to dispose canvas on cleanup:', error);
      }
    };
  }, [pdfImage, currentPage]);

  // 줌 적용
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      canvas.setZoom(zoom);
      canvas.setWidth((pdfImage?.width || 0) * zoom);
      canvas.setHeight((pdfImage?.height || 0) * zoom);
      canvas.renderAll();
    }
  }, [zoom, pdfImage]);

  // 도구 변경 시 선택 모드 업데이트
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.selection = currentTool === 'select';
    }
  }, [currentTool]);

  // Redux elements 상태와 Fabric.js 캔버스 동기화 (삭제 및 업데이트)
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const canvasObjects = canvas.getObjects();

    // Redux elements에 있는 ID 목록
    const elementIds = new Set(elements.map((el) => el.id));

    // 캔버스에는 있지만 Redux에는 없는 객체 제거
    // (임시 도형은 제외 - tempShapeRef와 일치하는 객체)
    canvasObjects.forEach((obj: any) => {
      if (obj.id && !elementIds.has(obj.id)) {
        // 임시 도형이 아닌 경우에만 제거
        if (obj !== tempShapeRef.current) {
          canvas.remove(obj);
        }
      }
    });

    // Redux 요소의 속성을 캔버스 객체에 반영 (색상, 텍스트 등)
    elements.forEach((element, index) => {
      const canvasObj = canvasObjects.find((obj: any) => obj.id === element.id);

      if (canvasObj) {
        // 레이어 순서 업데이트 (Redux elements 배열 순서 = z-index)
        const currentIndex = canvas.getObjects().indexOf(canvasObj);
        if (currentIndex !== index) {
          canvas.moveTo(canvasObj, index);
        }

        // 공통 위치 및 크기 업데이트
        if ((canvasObj as fabric.Object).left !== element.x) {
          (canvasObj as fabric.Object).set('left', element.x);
        }
        if ((canvasObj as fabric.Object).top !== element.y) {
          (canvasObj as fabric.Object).set('top', element.y);
        }
        if ((canvasObj as fabric.Object).width !== element.width) {
          (canvasObj as fabric.Object).set('width', element.width);
        }
        if ((canvasObj as fabric.Object).height !== element.height) {
          (canvasObj as fabric.Object).set('height', element.height);
        }

        // 회전 업데이트
        if (element.rotation !== undefined && (canvasObj as fabric.Object).angle !== element.rotation) {
          (canvasObj as fabric.Object).set('angle', element.rotation);
        }

        // 투명도 업데이트
        if (element.opacity !== undefined && (canvasObj as fabric.Object).opacity !== element.opacity) {
          (canvasObj as fabric.Object).set('opacity', element.opacity);
        }

        if (element.type === 'shape') {
          const shapeElement = element as ShapeElement;

          // 도형 색상 업데이트
          if ((canvasObj as fabric.Object).stroke !== shapeElement.strokeColor) {
            (canvasObj as fabric.Object).set('stroke', shapeElement.strokeColor);
          }
          if ((canvasObj as fabric.Object).fill !== shapeElement.fillColor) {
            (canvasObj as fabric.Object).set('fill', shapeElement.fillColor);
          }

          // 선 굵기 업데이트
          if ((canvasObj as fabric.Object).strokeWidth !== shapeElement.strokeWidth) {
            (canvasObj as fabric.Object).set('strokeWidth', shapeElement.strokeWidth);
          }

          // Circle 타입의 경우 radius 업데이트
          if (shapeElement.shapeType === 'circle' && 'radius' in canvasObj) {
            const radius = shapeElement.width / 2;
            if ((canvasObj as any).radius !== radius) {
              (canvasObj as any).set('radius', radius);
            }
          }
        }

        if (element.type === 'text') {
          const textElement = element as TextElement;
          const textObj = canvasObj as fabric.IText;

          // 텍스트 내용 업데이트
          if (textObj.text !== textElement.content) {
            textObj.set('text', textElement.content);
          }

          // 폰트 크기 업데이트
          if (textObj.fontSize !== textElement.fontSize) {
            textObj.set('fontSize', textElement.fontSize);
          }

          // 텍스트 색상 업데이트
          if (textObj.fill !== textElement.fontColor) {
            textObj.set('fill', textElement.fontColor);
          }

          // 폰트 패밀리 업데이트
          if (textObj.fontFamily !== textElement.fontFamily) {
            textObj.set('fontFamily', textElement.fontFamily);
          }

          // 볼드 업데이트
          const fontWeight = textElement.bold ? 'bold' : 'normal';
          if (textObj.fontWeight !== fontWeight) {
            textObj.set('fontWeight', fontWeight);
          }

          // 이탤릭 업데이트
          const fontStyle = textElement.italic ? 'italic' : 'normal';
          if (textObj.fontStyle !== fontStyle) {
            textObj.set('fontStyle', fontStyle);
          }

          // 밑줄 업데이트
          if (textObj.underline !== textElement.underline) {
            textObj.set('underline', textElement.underline);
          }
        }
      }
    });

    canvas.renderAll();
  }, [elements]);

  // 현재 페이지의 요소들을 캔버스에 복원
  const restoreElementsToCanvas = (canvas: fabric.Canvas) => {
    // ElementManager에서 현재 페이지의 요소들 가져오기
    const pageElements = elementManager.getElementsByPage(currentPage);

    console.log(`=== 페이지 ${currentPage} 복원 ===`);
    console.log('복원할 요소 개수:', pageElements.length);
    console.log('복원할 요소 목록:', pageElements);
    console.log('ElementManager 전체 요소 개수:', elementManager.getAllElements().length);

    // 각 요소를 타입에 따라 Fabric.js 객체로 변환하여 캔버스에 추가
    pageElements.forEach((element) => {
      if (element.type === 'text') {
        const textElement = element as TextElement;
        const textObj = new fabric.IText(textElement.content, {
          left: textElement.x,
          top: textElement.y,
          fontSize: textElement.fontSize,
          fill: textElement.fontColor,
          fontFamily: textElement.fontFamily || 'Arial',
          fontWeight: textElement.bold ? 'bold' : 'normal',
          fontStyle: textElement.italic ? 'italic' : 'normal',
          underline: textElement.underline,
        });

        (textObj as any).id = textElement.id;
        canvas.add(textObj);
      } else if (element.type === 'image') {
        const imageElement = element as ImageElement;
        fabric.Image.fromURL(imageElement.imageData, (img) => {
          // 저장된 크기를 사용하고 scaleX/scaleY를 1로 설정
          img.set({
            left: imageElement.x,
            top: imageElement.y,
            width: imageElement.width,
            height: imageElement.height,
            scaleX: 1,
            scaleY: 1,
            opacity: imageElement.opacity ?? 1,
            angle: imageElement.rotation ?? 0,
          });

          (img as any).id = imageElement.id;
          canvas.add(img);
          canvas.renderAll();
        });
      } else if (element.type === 'shape') {
        const shapeElement = element as ShapeElement;
        let shapeObj: fabric.Object;

        if (shapeElement.shapeType === 'rectangle') {
          shapeObj = new fabric.Rect({
            left: shapeElement.x,
            top: shapeElement.y,
            width: shapeElement.width,
            height: shapeElement.height,
            fill: shapeElement.fillColor,
            stroke: shapeElement.strokeColor,
            strokeWidth: shapeElement.strokeWidth,
            opacity: shapeElement.opacity ?? 1,
            angle: shapeElement.rotation ?? 0,
          });
        } else if (shapeElement.shapeType === 'circle') {
          const radius = shapeElement.width / 2;
          shapeObj = new fabric.Circle({
            left: shapeElement.x + radius,
            top: shapeElement.y + radius,
            radius,
            fill: shapeElement.fillColor,
            stroke: shapeElement.strokeColor,
            strokeWidth: shapeElement.strokeWidth,
            opacity: shapeElement.opacity ?? 1,
            angle: shapeElement.rotation ?? 0,
            originX: 'center',
            originY: 'center',
          });
        } else {
          // line
          shapeObj = new fabric.Line(
            [shapeElement.x, shapeElement.y, shapeElement.x + shapeElement.width, shapeElement.y + shapeElement.height],
            {
              stroke: shapeElement.strokeColor,
              strokeWidth: shapeElement.strokeWidth,
              opacity: shapeElement.opacity ?? 1,
            }
          );
        }

        (shapeObj as any).id = shapeElement.id;
        canvas.add(shapeObj);
      }
    });

    canvas.renderAll();
  };

  // 이벤트 리스너 설정
  const setupEventListeners = (canvas: fabric.Canvas) => {
    // 객체 선택
    canvas.on('selection:created', (e) => {
      const selected = e.selected?.map((obj: any) => obj.id).filter(Boolean) || [];
      dispatch(setSelectedElements(selected));
      // ElementManager 선택 상태도 동기화
      elementManager.clearSelection();
      elementManager.selectElements(selected);
    });

    canvas.on('selection:updated', (e) => {
      const selected = e.selected?.map((obj: any) => obj.id).filter(Boolean) || [];
      dispatch(setSelectedElements(selected));
      // ElementManager 선택 상태도 동기화
      elementManager.clearSelection();
      elementManager.selectElements(selected);
    });

    canvas.on('selection:cleared', () => {
      dispatch(clearSelection());
      // ElementManager 선택 상태도 동기화
      elementManager.clearSelection();
    });

    // 객체 이동/변형
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj && (obj as any).id) {
        const id = (obj as any).id;

        // 스케일을 실제 크기로 변환
        const actualWidth = (obj.width || 0) * (obj.scaleX || 1);
        const actualHeight = (obj.height || 0) * (obj.scaleY || 1);

        const updates = {
          x: obj.left || 0,
          y: obj.top || 0,
          width: actualWidth,
          height: actualHeight,
          rotation: obj.angle || 0,
        };

        // 스케일을 1로 리셋하여 다음 변형 시 정확한 계산 가능
        obj.set({
          width: actualWidth,
          height: actualHeight,
          scaleX: 1,
          scaleY: 1,
        });

        // Redux 상태 업데이트
        dispatch(updateElement({ id, updates }));

        // ElementManager 업데이트 (다운로드 시 필요)
        elementManager.updateElement(id, updates);

        console.log('=== 객체 이동/변형 ===');
        console.log('업데이트된 ID:', id);
        console.log('업데이트 내용:', updates);
        console.log('ElementManager 현재 요소 개수:', elementManager.getAllElements().length);
      }
    });

    // 텍스트 내용 변경
    canvas.on('text:changed', (e) => {
      const obj = e.target as fabric.IText;
      if (obj && (obj as any).id) {
        const id = (obj as any).id;
        const content = obj.text || '';

        dispatch(
          updateElement({
            id,
            updates: { content },
          })
        );

        elementManager.updateElement(id, { content });
      }
    });

    // 텍스트 편집 종료
    canvas.on('text:editing:exited', (e) => {
      const obj = e.target as fabric.IText;
      if (obj && (obj as any).id) {
        const id = (obj as any).id;
        const content = obj.text || '';

        // 히스토리에 기록 (업데이트 전에 beforeElement 가져오기)
        const element = elementManager.getElement(id);
        if (element && element.type === 'text') {
          const beforeElement = { ...element };
          const afterElement = { ...element, content };
          historyManager.recordUpdate(beforeElement, afterElement);
        }

        // Redux 상태 업데이트
        dispatch(updateElement({ id, updates: { content } }));

        // ElementManager 업데이트 (다운로드 시 필요)
        elementManager.updateElement(id, { content });

        console.log('=== 텍스트 편집 완료 ===');
        console.log('업데이트된 ID:', id);
        console.log('텍스트 내용:', content);
        console.log('ElementManager 전체 요소 개수:', elementManager.getAllElements().length);

        // 새로 생성한 텍스트 편집 완료 시 선택 도구로 전환
        if (currentToolRef.current === 'text') {
          dispatch(setTool('select'));
        }
      }
    });

    // 마우스 클릭 (텍스트/도형 추가용)
    canvas.on('mouse:down', (e) => {
      if (currentToolRef.current === 'text') {
        // 기존 텍스트 객체를 클릭한 경우 편집 모드로 전환
        if (e.target && e.target.type === 'i-text') {
          canvas.setActiveObject(e.target);
          (e.target as fabric.IText).enterEditing();
          canvas.renderAll();
        } else if (e.pointer) {
          // 빈 공간을 클릭한 경우에만 새 텍스트 추가하고 바로 편집 모드로 진입
          const textObj = handleAddText(canvas, e.pointer);
          if (textObj) {
            textObj.enterEditing();
            textObj.selectAll();
            // 도구 전환은 text:editing:exited에서 처리
          }
        }
      } else if (currentToolRef.current === 'shape' && e.pointer) {
        // 도형 그리기 시작 (기존 객체를 클릭하지 않은 경우에만)
        if (!e.target) {
          isDrawingShapeRef.current = true;
          shapeStartPointRef.current = { x: e.pointer.x, y: e.pointer.y };
          canvas.selection = false; // 그리기 중 선택 비활성화
        }
      }
    });

    // 마우스 이동 (도형 드래그 중)
    canvas.on('mouse:move', (e) => {
      // 도형 그리기 중일 때만 실행 (도구나 기존 객체 선택 상태와 무관하게)
      if (isDrawingShapeRef.current && shapeStartPointRef.current && e.pointer) {
        // 임시 도형 제거 (이전 프레임의 임시 도형)
        if (tempShapeRef.current) {
          canvas.remove(tempShapeRef.current);
          tempShapeRef.current = null;
        }

        const width = e.pointer.x - shapeStartPointRef.current.x;
        const height = e.pointer.y - shapeStartPointRef.current.y;

        // 최소 이동 거리 체크 (5px 이상 움직였을 때만 임시 도형 표시)
        const minDistance = 5;
        const distance = Math.sqrt(width * width + height * height);

        if (distance < minDistance) {
          return;
        }

        let shape: fabric.Object;

        // 선택된 도형 타입에 따라 다른 임시 도형 생성
        if (selectedShapeTypeRef.current === 'rectangle') {
          shape = new fabric.Rect({
            left: width > 0 ? shapeStartPointRef.current.x : e.pointer.x,
            top: height > 0 ? shapeStartPointRef.current.y : e.pointer.y,
            width: Math.abs(width),
            height: Math.abs(height),
            fill: 'transparent',
            stroke: '#E5322D',
            strokeWidth: 2,
            selectable: false,
            evented: false, // 이벤트 무시
          });
        } else if (selectedShapeTypeRef.current === 'circle') {
          const radius = Math.sqrt(width * width + height * height) / 2;
          shape = new fabric.Circle({
            left: shapeStartPointRef.current.x,
            top: shapeStartPointRef.current.y,
            radius: Math.max(radius, 1),
            fill: 'transparent',
            stroke: '#E5322D',
            strokeWidth: 2,
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'center',
          });
        } else {
          // line
          shape = new fabric.Line(
            [shapeStartPointRef.current.x, shapeStartPointRef.current.y, e.pointer.x, e.pointer.y],
            {
              stroke: '#E5322D',
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
        }

        canvas.add(shape);
        tempShapeRef.current = shape;
        canvas.renderAll();
      }
    });

    canvas.on('mouse:down:before', () => {
      dispatch(setDrawing(true));
    });

    canvas.on('mouse:up', (e) => {
      dispatch(setDrawing(false));

      // 도형 그리기 완료
      if (isDrawingShapeRef.current && shapeStartPointRef.current && e.pointer) {
        // 임시 도형 제거
        if (tempShapeRef.current) {
          canvas.remove(tempShapeRef.current);
          tempShapeRef.current = null;
        }

        const width = Math.abs(e.pointer.x - shapeStartPointRef.current.x);
        const height = Math.abs(e.pointer.y - shapeStartPointRef.current.y);

        // 최소 크기 체크 (Line은 10px 이상, 나머지는 10x10 이상)
        const minSize = 10;
        const sizeValid = selectedShapeTypeRef.current === 'line'
          ? Math.sqrt(width * width + height * height) > minSize
          : width > minSize && height > minSize;

        if (sizeValid) {
          handleAddShape(
            canvas,
            shapeStartPointRef.current,
            e.pointer,
            selectedShapeTypeRef.current
          );
        }

        // 그리기 상태 초기화
        isDrawingShapeRef.current = false;
        shapeStartPointRef.current = null;
        canvas.selection = true; // 선택 모드 복원
      }
    });
  };

  // 텍스트 추가 핸들러
  const handleAddText = (canvas: fabric.Canvas, pointer: any): fabric.IText | null => {
    if (!pointer) return null;

    const text = new fabric.IText('텍스트를 입력하세요', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 20,
      fill: '#000000',
      fontFamily: 'Arial',
    });

    const id = `text-${Date.now()}`;
    (text as any).id = id;

    canvas.add(text);
    canvas.setActiveObject(text);

    // Redux 상태에 추가
    const textElement: TextElement = {
      id,
      type: 'text',
      pageNumber: currentPage,
      x: pointer.x,
      y: pointer.y,
      width: text.width || 100,
      height: text.height || 30,
      content: '텍스트를 입력하세요',
      fontFamily: 'Arial',
      fontSize: 20,
      fontColor: '#000000',
      alignment: 'left',
      bold: false,
      italic: false,
      underline: false,
    };

    dispatch(addElement(textElement));
    elementManager.addElement(textElement);
    historyManager.recordAdd(textElement);

    console.log('=== 텍스트 추가 ===');
    console.log('추가된 텍스트:', textElement);
    console.log('ElementManager 전체 요소 개수:', elementManager.getAllElements().length);

    // 텍스트 추가 후 즉시 편집 모드로 진입
    text.enterEditing();
    text.selectAll();
    canvas.renderAll();

    return text;
  };

  // 도형 추가 핸들러
  const handleAddShape = (
    canvas: fabric.Canvas,
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    shapeType: 'rectangle' | 'circle' | 'line'
  ) => {
    let shape: fabric.Object;
    let shapeElement: ShapeElement;
    const id = `shape-${Date.now()}`;

    if (shapeType === 'rectangle') {
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      const left = Math.min(startPoint.x, endPoint.x);
      const top = Math.min(startPoint.y, endPoint.y);

      shape = new fabric.Rect({
        left,
        top,
        width,
        height,
        fill: 'transparent',
        stroke: '#E5322D',
        strokeWidth: 2,
      });

      shapeElement = {
        id,
        type: 'shape',
        pageNumber: currentPage,
        x: left,
        y: top,
        width,
        height,
        shapeType: 'rectangle',
        strokeColor: '#E5322D',
        strokeWidth: 2,
        fillColor: 'transparent',
      };
    } else if (shapeType === 'circle') {
      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;
      const radius = Math.sqrt(width * width + height * height) / 2;

      shape = new fabric.Circle({
        left: startPoint.x,
        top: startPoint.y,
        radius,
        fill: 'transparent',
        stroke: '#E5322D',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
      });

      shapeElement = {
        id,
        type: 'shape',
        pageNumber: currentPage,
        x: startPoint.x - radius,
        y: startPoint.y - radius,
        width: radius * 2,
        height: radius * 2,
        shapeType: 'circle',
        strokeColor: '#E5322D',
        strokeWidth: 2,
        fillColor: 'transparent',
      };
    } else {
      // line
      shape = new fabric.Line(
        [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
        {
          stroke: '#E5322D',
          strokeWidth: 2,
        }
      );

      const left = Math.min(startPoint.x, endPoint.x);
      const top = Math.min(startPoint.y, endPoint.y);
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);

      shapeElement = {
        id,
        type: 'shape',
        pageNumber: currentPage,
        x: left,
        y: top,
        width: Math.max(width, 1),
        height: Math.max(height, 1),
        shapeType: 'line',
        strokeColor: '#E5322D',
        strokeWidth: 2,
        fillColor: 'transparent',
      };
    }

    (shape as any).id = id;
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();

    dispatch(addElement(shapeElement));
    elementManager.addElement(shapeElement);
    historyManager.recordAdd(shapeElement);

    console.log('=== 도형 추가 ===');
    console.log('추가된 도형:', shapeElement);
    console.log('ElementManager 전체 요소 개수:', elementManager.getAllElements().length);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    // 이미지 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      // 파일을 Base64로 변환
      const base64 = await fileToBase64(file);

      // Fabric Image 객체 생성
      fabric.Image.fromURL(base64, (img) => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;

        // 이미지 크기 조정 (최대 400px)
        const maxSize = 400;
        const scale = Math.min(maxSize / (img.width || 1), maxSize / (img.height || 1), 1);

        const scaledWidth = (img.width || 0) * scale;
        const scaledHeight = (img.height || 0) * scale;

        img.set({
          left: 100,
          top: 100,
          width: scaledWidth,
          height: scaledHeight,
          scaleX: 1,
          scaleY: 1,
        });

        const id = `image-${Date.now()}`;
        (img as any).id = id;

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();

        // Redux 상태에 추가
        const imageElement: ImageElement = {
          id,
          type: 'image',
          pageNumber: currentPage,
          x: 100,
          y: 100,
          width: scaledWidth,
          height: scaledHeight,
          imageData: base64,
        };

        dispatch(addElement(imageElement));
        elementManager.addElement(imageElement);
        historyManager.recordAdd(imageElement);

        console.log('=== 이미지 추가 ===');
        console.log('추가된 이미지:', imageElement);
        console.log('ElementManager 전체 요소 개수:', elementManager.getAllElements().length);
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다.');
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 도구 선택 시 파일 선택 트리거
  useEffect(() => {
    if (currentTool === 'image' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [currentTool]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center p-8 min-h-full"
    >
      {/* 숨겨진 파일 입력 (이미지 업로드용) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="shadow-2xl">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// 파일을 Base64로 변환하는 유틸리티 함수
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

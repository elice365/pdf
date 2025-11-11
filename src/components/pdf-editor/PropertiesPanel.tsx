'use client';

import { useState } from 'react';
import { ChromePicker } from 'react-color';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateElement } from '@/store/slices/editorSlice';
import type { ElementManager } from '@/lib/pdf-editor/element-manager';
import type { TextElement, ImageElement, ShapeElement } from '@/lib/pdf-editor/types';

interface PropertiesPanelProps {
  elementManager: ElementManager;
}

export default function PropertiesPanel({ elementManager }: PropertiesPanelProps) {
  const dispatch = useAppDispatch();
  const { selectedElementIds } = useAppSelector((state) => state.editor);

  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [showFillPicker, setShowFillPicker] = useState(false);

  const selectedElements = elementManager.getSelectedElements();
  const hasSelection = selectedElements.length > 0;

  // 색상 변경 핸들러
  const handleStrokeColorChange = (color: any) => {
    if (selectedElements.length === 0) return;
    const element = selectedElements[0];

    if (element.type === 'shape') {
      const updates = { strokeColor: color.hex };

      // Redux 상태 업데이트
      dispatch(updateElement({ id: element.id, updates }));

      // ElementManager 업데이트
      elementManager.updateElement(element.id, updates);
    }
  };

  const handleFillColorChange = (color: any) => {
    if (selectedElements.length === 0) return;
    const element = selectedElements[0];

    if (element.type === 'shape') {
      const updates = { fillColor: color.hex };

      // Redux 상태 업데이트
      dispatch(updateElement({ id: element.id, updates }));

      // ElementManager 업데이트
      elementManager.updateElement(element.id, updates);
    }
  };

  if (!hasSelection) {
    return (
      <div className="w-64 bg-background border-l border p-4">
        <div className="text-center text-muted-foreground text-sm">
          요소를 선택하세요
        </div>
      </div>
    );
  }

  const element = selectedElements[0]; // 첫 번째 선택된 요소만 표시

  return (
    <div className="w-64 bg-background border-l border overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* 헤더 */}
        <div className="pb-2 border-b border">
          <h3 className="font-semibold text-foreground">속성</h3>
          {selectedElements.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedElements.length}개 선택됨
            </p>
          )}
        </div>

        {/* 공통 속성 */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              타입
            </label>
            <div className="text-sm text-foreground capitalize">{element.type}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                X
              </label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => {
                  const x = parseInt(e.target.value);
                  if (!isNaN(x)) {
                    const updates = { x };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }
                }}
                className="w-full px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Y
              </label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => {
                  const y = parseInt(e.target.value);
                  if (!isNaN(y)) {
                    const updates = { y };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }
                }}
                className="w-full px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                너비
              </label>
              <input
                type="number"
                min="1"
                value={Math.round(element.width)}
                onChange={(e) => {
                  const width = parseInt(e.target.value);
                  if (!isNaN(width) && width > 0) {
                    const updates = { width };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }
                }}
                className="w-full px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                높이
              </label>
              <input
                type="number"
                min="1"
                value={Math.round(element.height)}
                onChange={(e) => {
                  const height = parseInt(e.target.value);
                  if (!isNaN(height) && height > 0) {
                    const updates = { height };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }
                }}
                className="w-full px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {element.rotation !== undefined && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                회전 (도)
              </label>
              <input
                type="number"
                min="0"
                max="360"
                value={Math.round(element.rotation)}
                onChange={(e) => {
                  const rotation = parseInt(e.target.value);
                  if (!isNaN(rotation) && rotation >= 0 && rotation <= 360) {
                    const updates = { rotation };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }
                }}
                className="w-full px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {element.opacity !== undefined && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                투명도
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.opacity}
                  onChange={(e) => {
                    const opacity = parseFloat(e.target.value);
                    if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
                      const updates = { opacity };
                      dispatch(updateElement({ id: element.id, updates }));
                      elementManager.updateElement(element.id, updates);
                    }
                  }}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.opacity}
                  onChange={(e) => {
                    const opacity = parseFloat(e.target.value);
                    if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
                      const updates = { opacity };
                      dispatch(updateElement({ id: element.id, updates }));
                      elementManager.updateElement(element.id, updates);
                    }
                  }}
                  className="w-16 px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* 타입별 속성 */}
        {element.type === 'text' && (
          <div className="space-y-3 pt-3 border-t border">
            <h4 className="font-medium text-foreground text-sm">텍스트 속성</h4>

            {/* 텍스트 내용 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                내용
              </label>
              <textarea
                value={(element as TextElement).content}
                onChange={(e) => {
                  const updates = { content: e.target.value };
                  dispatch(updateElement({ id: element.id, updates }));
                  elementManager.updateElement(element.id, updates);
                }}
                rows={3}
                className="w-full px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 폰트 패밀리 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                폰트
              </label>
              <select
                value={(element as TextElement).fontFamily}
                onChange={(e) => {
                  const updates = { fontFamily: e.target.value };
                  dispatch(updateElement({ id: element.id, updates }));
                  elementManager.updateElement(element.id, updates);
                }}
                className="w-full px-2 py-1.5 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Impact">Impact</option>
                <option value="Noto Sans KR">Noto Sans KR</option>
              </select>
            </div>

            {/* 폰트 크기 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                폰트 크기
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={(element as TextElement).fontSize}
                  onChange={(e) => {
                    const fontSize = parseInt(e.target.value);
                    if (fontSize >= 8 && fontSize <= 72) {
                      const updates = { fontSize };
                      dispatch(updateElement({ id: element.id, updates }));
                      elementManager.updateElement(element.id, updates);
                    }
                  }}
                  className="w-20 px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>

            {/* 텍스트 스타일 버튼 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                스타일
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const updates = { bold: !(element as TextElement).bold };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }}
                  className={`px-3 py-1.5 text-sm font-bold border rounded transition-colors ${
                    (element as TextElement).bold
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background text-foreground border hover:border-foreground'
                  }`}
                  title="굵게"
                >
                  B
                </button>
                <button
                  onClick={() => {
                    const updates = { italic: !(element as TextElement).italic };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }}
                  className={`px-3 py-1.5 text-sm italic border rounded transition-colors ${
                    (element as TextElement).italic
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background text-foreground border hover:border-foreground'
                  }`}
                  title="기울임"
                >
                  I
                </button>
                <button
                  onClick={() => {
                    const updates = { underline: !(element as TextElement).underline };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }}
                  className={`px-3 py-1.5 text-sm underline border rounded transition-colors ${
                    (element as TextElement).underline
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background text-foreground border hover:border-foreground'
                  }`}
                  title="밑줄"
                >
                  U
                </button>
              </div>
            </div>

            {/* 텍스트 색상 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                텍스트 색상
              </label>

              {/* 색상 프리셋 */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                {['#000000', '#FFFFFF', '#E5322D', '#4299E1', '#48BB78', '#F6BD60', '#9F7AEA', '#F56565'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const updates = { fontColor: color };
                      dispatch(updateElement({ id: element.id, updates }));
                      elementManager.updateElement(element.id, updates);
                    }}
                    className="w-6 h-6 rounded border-2 border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowStrokePicker(false);
                    setShowFillPicker(!showFillPicker);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 border border rounded hover:border-foreground transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded border border"
                    style={{
                      backgroundColor: (element as TextElement).fontColor,
                    }}
                  />
                  <span className="text-sm text-foreground">
                    {(element as TextElement).fontColor}
                  </span>
                </button>

                {showFillPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowFillPicker(false)}
                    />
                    <div className="absolute z-20 mt-2">
                      <ChromePicker
                        color={(element as TextElement).fontColor}
                        onChange={(color) => {
                          const updates = { fontColor: color.hex };
                          dispatch(updateElement({ id: element.id, updates }));
                          elementManager.updateElement(element.id, updates);
                        }}
                        disableAlpha={false}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {element.type === 'shape' && (
          <div className="space-y-3 pt-3 border-t border">
            <h4 className="font-medium text-foreground text-sm">도형 속성</h4>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                도형 타입
              </label>
              <div className="text-sm text-foreground capitalize">
                {(element as ShapeElement).shapeType}
              </div>
            </div>

            {/* 선 굵기 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                선 굵기
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={(element as ShapeElement).strokeWidth}
                  onChange={(e) => {
                    const strokeWidth = parseInt(e.target.value);
                    const updates = { strokeWidth };
                    dispatch(updateElement({ id: element.id, updates }));
                    elementManager.updateElement(element.id, updates);
                  }}
                  className="flex-1"
                />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={(element as ShapeElement).strokeWidth}
                  onChange={(e) => {
                    const strokeWidth = parseInt(e.target.value);
                    if (strokeWidth >= 1 && strokeWidth <= 20) {
                      const updates = { strokeWidth };
                      dispatch(updateElement({ id: element.id, updates }));
                      elementManager.updateElement(element.id, updates);
                    }
                  }}
                  className="w-16 px-2 py-1 text-sm border border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>

            {/* 테두리 색상 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                테두리 색상
              </label>

              {/* 색상 프리셋 */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                {['#000000', '#FFFFFF', '#E5322D', '#4299E1', '#48BB78', '#F6BD60', '#9F7AEA', '#F56565'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const updates = { strokeColor: color };
                      dispatch(updateElement({ id: element.id, updates }));
                      elementManager.updateElement(element.id, updates);
                    }}
                    className="w-6 h-6 rounded border-2 border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowStrokePicker(!showStrokePicker)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 border border rounded hover:border-foreground transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded border border"
                    style={{
                      backgroundColor: (element as ShapeElement).strokeColor,
                    }}
                  />
                  <span className="text-sm text-foreground">
                    {(element as ShapeElement).strokeColor}
                  </span>
                </button>

                {showStrokePicker && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStrokePicker(false)}
                    />
                    <div className="absolute z-20 mt-2">
                      <ChromePicker
                        color={(element as ShapeElement).strokeColor}
                        onChange={handleStrokeColorChange}
                        disableAlpha={false}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 채우기 색상 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                채우기 색상
              </label>

              {/* 색상 프리셋 */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                {['#000000', '#FFFFFF', '#E5322D', '#4299E1', '#48BB78', '#F6BD60', '#9F7AEA', '#F56565'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const updates = { fillColor: color };
                      dispatch(updateElement({ id: element.id, updates }));
                      elementManager.updateElement(element.id, updates);
                    }}
                    className="w-6 h-6 rounded border-2 border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowFillPicker(!showFillPicker)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 border border rounded hover:border-foreground transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded border border"
                    style={{
                      backgroundColor: (element as ShapeElement).fillColor,
                    }}
                  />
                  <span className="text-sm text-foreground">
                    {(element as ShapeElement).fillColor}
                  </span>
                </button>

                {showFillPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowFillPicker(false)}
                    />
                    <div className="absolute z-20 mt-2">
                      <ChromePicker
                        color={(element as ShapeElement).fillColor}
                        onChange={handleFillColorChange}
                        disableAlpha={false}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

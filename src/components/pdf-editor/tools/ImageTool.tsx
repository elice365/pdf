'use client';

import { useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addElement } from '@/store/slices/editorSlice';
import type { ImageElement } from '@/lib/pdf-editor/types';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';

interface ImageToolProps {
  currentPage: number;
  onImageAdded?: (imageElement: ImageElement) => void;
}

export default function ImageTool({ currentPage, onImageAdded }: ImageToolProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      // 이미지를 Base64로 변환
      const base64 = await fileToBase64(file);

      // 이미지 크기 계산 (실제 이미지 크기 가져오기)
      const { width, height } = await getImageDimensions(base64);

      // 이미지 요소 생성
      const imageElement: ImageElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        pageNumber: currentPage,
        x: 100, // 기본 위치
        y: 100,
        width: Math.min(width, 400), // 최대 400px
        height: Math.min(height, 400),
        imageData: base64,
      };

      // Redux 상태에 추가
      dispatch(addElement(imageElement));

      // 콜백 호출 (PDFCanvas에서 Fabric 객체로 추가)
      if (onImageAdded) {
        onImageAdded(imageElement);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다.');
    }

    // 파일 입력 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleButtonClick}
        title="이미지 업로드"
      >
        <ImageIcon size={18} />
      </Button>
    </>
  );
}

// 파일을 Base64로 변환
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

// 이미지 크기 가져오기
function getImageDimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
}

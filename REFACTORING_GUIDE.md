# React & Next.js 리팩토링 가이드

이 문서는 iLovePDF 클론 프로젝트의 리팩토링 작업을 설명합니다.

## 🎯 리팩토링 목표

1. **코드 중복 제거**: 36개 PDF 도구 페이지의 공통 로직 추상화
2. **컴포넌트 분리**: 단일 책임 원칙 적용
3. **Custom Hooks**: 비즈니스 로직과 UI 분리
4. **타입 안전성**: TypeScript strict mode 준수
5. **유지보수성**: 코드 가독성 및 재사용성 향상

---

## 📁 새로운 구조

```
src/
├── hooks/                        # Custom Hooks
│   ├── use-pdf-tool.ts           # 공통 PDF 도구 로직
│   ├── use-form-analyzer.ts      # 양식 분석 로직
│   └── use-html-to-pdf.ts        # HTML to PDF 변환 로직
├── components/
│   └── pdf-tool/                 # 공통 컴포넌트
│       ├── pdf-tool-layout.tsx   # 레이아웃 컴포넌트
│       ├── info-card.tsx         # 정보 카드
│       ├── result-card.tsx       # 결과 카드
│       ├── action-buttons.tsx    # 액션 버튼
│       ├── form-field.tsx        # 폼 필드
│       └── index.ts              # Export barrel
└── types/
    └── pdf-tool.ts               # 공통 타입 정의
```

---

## 🔧 핵심 컴포넌트 및 Hooks

### 1. `usePdfTool` Hook

**목적**: 모든 PDF 도구 페이지에서 공통으로 사용하는 상태 관리 및 파일 검증 로직 제공

**기능**:
- Redux 상태 관리 추상화
- 파일 업로드 검증
- 진행률 관리
- 에러 처리

**사용 예제**:
```typescript
const {
  files,
  hasFiles,
  isProcessing,
  progress,
  startProcessing,
  updateProgress,
  finishProcessing,
  setError,
  validateFiles,
  reset,
} = usePdfTool({ operationName: "PDF 압축" });
```

### 2. `PdfToolLayout` 컴포넌트

**목적**: 모든 PDF 도구 페이지의 공통 레이아웃 제공

**특징**:
- 일관된 헤더 (아이콘, 제목, 설명)
- 홈으로 돌아가기 링크
- 반응형 컨테이너

**사용 예제**:
```tsx
<PdfToolLayout
  title="PDF 압축"
  description="PDF 파일 크기를 줄이세요"
  icon={FileZip}
>
  {/* 페이지 콘텐츠 */}
</PdfToolLayout>
```

### 3. `InfoCard` 컴포넌트

**목적**: 도구 사용 정보를 일관된 형식으로 표시

**사용 예제**:
```tsx
<InfoCard
  title="압축 정보"
  items={[
    "이미지 해상도를 최적화합니다",
    "품질 저하를 최소화합니다",
    "파일 크기가 최대 70% 감소합니다",
  ]}
/>
```

### 4. `ResultCard` 컴포넌트

**목적**: 처리 완료 결과를 표시

**사용 예제**:
```tsx
<ResultCard
  icon={CheckCircle}
  title="압축 완료!"
  subtitle="파일 크기가 65% 감소했습니다"
  description="원본 품질을 유지하면서 파일 크기를 줄였습니다."
>
  <ActionButtons ... />
</ResultCard>
```

### 5. `ActionButtons` 컴포넌트

**목적**: 액션 버튼을 일관된 형식으로 표시

**사용 예제**:
```tsx
<ActionButtons
  primaryAction={{
    label: "PDF 다운로드",
    icon: Download,
    onClick: handleDownload,
  }}
  secondaryAction={{
    label: "다시 시작",
    onClick: reset,
  }}
/>
```

---

## 📊 리팩토링 결과

### Before & After 비교

#### Form 페이지
- **Before**: 432 lines
- **After**: 133 lines
- **감소율**: 69% ↓

#### HTML to PDF 페이지
- **Before**: 250 lines (추정)
- **After**: 95 lines
- **감소율**: 62% ↓

### 주요 개선사항

1. **코드 재사용성**
   - 공통 로직을 Custom Hooks로 추출
   - UI 컴포넌트를 재사용 가능한 단위로 분리

2. **가독성 향상**
   - 선언적 코드 스타일
   - 명확한 컴포넌트 계층 구조

3. **유지보수성**
   - 단일 책임 원칙 적용
   - 관심사의 분리

4. **타입 안전성**
   - 명시적 타입 정의
   - TypeScript strict mode 준수

---

## 🚀 리팩토링 패턴

### 패턴 1: Custom Hook으로 비즈니스 로직 추출

**Before**:
```tsx
export default function MyPage() {
  const dispatch = useAppDispatch();
  const { files } = useAppSelector(state => state.pdf);

  const handleProcess = async () => {
    dispatch(setProcessing(true));
    dispatch(setProgress(0));
    // 복잡한 비즈니스 로직...
  };

  return (
    // 긴 JSX...
  );
}
```

**After**:
```tsx
export default function MyPage() {
  const { files, convert, reset } = useMyCustomHook();

  return (
    <PdfToolLayout title="My Tool" icon={Icon}>
      {/* 간결한 JSX */}
    </PdfToolLayout>
  );
}
```

### 패턴 2: 공통 UI 컴포넌트 재사용

**Before**:
```tsx
<div className="p-4 bg-surface rounded-lg space-y-2">
  <p className="text-sm font-medium">정보</p>
  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
    <li>항목 1</li>
    <li>항목 2</li>
  </ul>
</div>
```

**After**:
```tsx
<InfoCard
  title="정보"
  items={["항목 1", "항목 2"]}
/>
```

### 패턴 3: 조건부 렌더링 개선

**Before**:
```tsx
{files.length > 0 && !completed && (
  <Card>
    <Button onClick={handleConvert}>변환</Button>
  </Card>
)}
```

**After**:
```tsx
{hasFiles && !completed && (
  <Card>
    <ActionButtons
      primaryAction={{
        label: "변환",
        onClick: convert,
      }}
    />
  </Card>
)}
```

---

## 📋 리팩토링 체크리스트

### 완료된 작업
- [x] 공통 타입 정의 (`types/pdf-tool.ts`)
- [x] `usePdfTool` Custom Hook 생성
- [x] `PdfToolLayout` 컴포넌트 생성
- [x] `InfoCard` 컴포넌트 생성
- [x] `ResultCard` 컴포넌트 생성
- [x] `ActionButtons` 컴포넌트 생성
- [x] `FormField` 컴포넌트 생성
- [x] `useFormAnalyzer` Custom Hook 생성
- [x] `useHtmlToPdf` Custom Hook 생성
- [x] Form 페이지 리팩토링
- [x] HTML to PDF 페이지 리팩토링
- [x] TypeScript 타입 체크 통과

### 추가 개선 권장사항

#### 우선순위 높음
- [ ] PDF to Word 페이지 리팩토링 (`usePdfToWord` hook 생성)
- [ ] PDF to Excel 페이지 리팩토링 (`usePdfToExcel` hook 생성)
- [ ] PDF to PowerPoint 페이지 리팩토링 (`usePdfToPowerPoint` hook 생성)
- [ ] OCR 페이지 리팩토링 (`useOcrProcessor` hook 생성)
- [ ] Sign 페이지 리팩토링 (`useSignature` hook 생성)

#### 우선순위 중간
- [ ] 에러 바운더리 추가
- [ ] 로딩 스켈레톤 컴포넌트 추가
- [ ] Toast 알림 시스템 통합
- [ ] Progress indicator 개선

#### 우선순위 낮음
- [ ] 성능 최적화 (React.memo, useMemo, useCallback)
- [ ] 접근성 개선 (ARIA 속성, 키보드 네비게이션)
- [ ] 국제화 (i18n) 지원
- [ ] 단위 테스트 작성

---

## 🎓 Best Practices

### 1. Custom Hooks 네이밍

- `use` 접두사 사용
- 명확한 기능 설명
- 예: `usePdfTool`, `useFormAnalyzer`, `useHtmlToPdf`

### 2. 컴포넌트 분리 기준

- 100줄 이상의 컴포넌트는 분리 고려
- 재사용 가능한 UI는 별도 컴포넌트로
- 비즈니스 로직은 Custom Hook으로

### 3. Props 인터페이스

- 명시적 타입 정의
- Optional props에 기본값 제공
- JSDoc 주석으로 설명 추가

### 4. 파일 구조

- 관련 파일을 같은 디렉토리에 배치
- `index.ts`로 export 관리
- 명확한 네이밍 컨벤션 유지

---

## 📚 참고 자료

- [React Hooks 공식 문서](https://react.dev/reference/react)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clean Code in React](https://react.dev/learn/thinking-in-react)

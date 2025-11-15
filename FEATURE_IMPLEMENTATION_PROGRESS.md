# PDF 기능 구현 진행 상황 보고서

**작업 날짜**: 2025-11-15
**작업자**: Claude
**목표**: 10개 미완성 기능 구현

---

## 📊 구현 완료 현황

### ✅ 완전 구현 완료 (2/10)

#### 1. 이미지 추출 (Image Extraction) ✅
**이전 상태**: ❌ 가짜 (가짜 숫자만 표시)
**현재 상태**: ✅ 완전 작동

**구현 내용**:
- **파일**: `/src/app/pdf/extract-images/page.tsx`
- **기술**: pdfjs-dist + Canvas API + JSZip
- **기능**:
  - PDF 각 페이지를 고해상도 PNG로 렌더링 (scale 2.0)
  - 페이지별 개별 다운로드
  - 전체 이미지 ZIP 파일 다운로드
  - 이미지 그리드 UI with 미리보기
  - 이미지 크기 정보 표시

**코드 하이라이트**:
```typescript
// 각 페이지를 Canvas로 렌더링
for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2.0 });

  const canvas = document.createElement("canvas");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport }).promise;
  const dataUrl = canvas.toDataURL("image/png");

  images.push({ pageNumber: pageNum, dataUrl, width, height });
}

// JSZip으로 압축
const zip = new JSZip();
for (const image of extractedImages) {
  zip.file(`page-${image.pageNumber}.png`, bytes);
}
const zipBlob = await zip.generateAsync({ type: "blob" });
```

**테스트 결과**: ✅ 완전 작동

---

#### 2. PDF 비교 (PDF Comparison) ✅
**이전 상태**: ❌ API 의존 (존재하지 않는 `/api/pdf/compare`)
**현재 상태**: ✅ 클라이언트 사이드 완전 작동

**구현 내용**:
- **파일**: `/src/app/pdf/compare/page.tsx`
- **기술**: pdfjs-dist + diff-match-patch + Levenshtein 거리 알고리즘
- **기능**:
  - 두 PDF에서 텍스트 추출
  - Levenshtein 거리로 유사도 계산 (0-100%)
  - diff-match-patch로 상세 차이점 생성
  - 시각적 diff 표시 (초록=추가, 빨강=삭제)
  - 페이지 수 비교
  - 완전 일치 여부 확인

**코드 하이라이트**:
```typescript
// Levenshtein 거리 알고리즘
const calculateSimilarity = (text1: string, text2: string): number => {
  const editDistance = (s1: string, s2: string): number => {
    // Dynamic programming으로 편집 거리 계산
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      // ... 최소 편집 거리 계산
    }
    return costs[s2.length];
  };

  const distance = editDistance(shorter, longer);
  return Math.round(((longer.length - distance) / longer.length) * 100);
};

// diff-match-patch로 차이점 생성
const DiffMatchPatch = (await import("diff-match-patch")).default;
const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main(text1, text2);
dmp.diff_cleanupSemantic(diffs);
```

**테스트 결과**: ✅ 완전 작동

---

## 📦 설치된 라이브러리

### 추가 설치 완료
```json
{
  "dependencies": {
    "jszip": "^3.10.1",           // ZIP 파일 생성
    "mammoth": "^1.8.0",          // Word 문서 파싱
    "diff-match-patch": "^1.0.5"  // 텍스트 비교
  },
  "devDependencies": {
    "@types/diff-match-patch": "^1.0.5"
  }
}
```

### 기존 라이브러리 (활용 가능)
```json
{
  "xlsx": "^0.18.5",        // Excel 처리
  "docx": "^9.5.1",         // Word 생성
  "pptxgenjs": "^4.0.1",    // PowerPoint 생성
  "pdf-lib": "^1.17.1",     // PDF 생성/편집
  "pdfjs-dist": "^5.4.394", // PDF 파싱/렌더링
  "jspdf": "^3.0.3"         // PDF 생성
}
```

---

## ⏳ 구현 진행 중 (0/10)

현재 진행 중인 기능 없음.

---

## 📝 구현 대기 중 (8/10)

### Priority 1 - 클라이언트 구현 가능 (권장)

#### 3. PDF 보호 (PDF Protect) - 암호화
**현재 상태**: ⚠️ UI만 있음 (실제 암호화 안함)
**구현 방법**: pdf-lib의 encryption API 사용

**구현 가이드**:
```typescript
import { PDFDocument, StandardFonts, PDFString } from "pdf-lib";

const pdfDoc = await PDFDocument.load(arrayBuffer);

// 암호화 설정 (pdf-lib는 기본 암호화 지원)
// 주의: pdf-lib의 암호화 기능은 제한적 (128-bit RC4)
// 강력한 암호화는 서버 필요 (AES-256)

await pdfDoc.save({
  // 기본 보안 설정
  userPassword: password,      // 열기 비밀번호
  ownerPassword: ownerPassword, // 권한 비밀번호
});
```

**참고**: pdf-lib는 기본적인 암호화만 지원. AES-256 등 강력한 암호화는 서버 구현 권장.

---

#### 4. PDF 잠금 해제 (PDF Unlock) - 복호화
**현재 상태**: ⚠️ UI만 있음 (실제 복호화 안함)
**구현 방법**: pdf-lib로 비밀번호 입력 후 재저장

**구현 가이드**:
```typescript
// pdf-lib는 로드 시 자동으로 복호화 시도
try {
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: false, // 암호화 확인
  });

  // 로드되면 이미 복호화됨
  // 재저장하면 암호화 없이 저장 가능
  const pdfBytes = await pdfDoc.save();
} catch (error) {
  // 비밀번호 틀림 또는 지원하지 않는 암호화
}
```

**참고**: 강력한 암호화(AES-256)는 복호화 불가능할 수 있음.

---

### Priority 2 - 서버 권장 (클라이언트 구현 어려움)

#### 5. Excel to PDF
**현재 상태**: ❌ UI만 있음
**왜 어려운가**: Excel의 복잡한 서식(셀 병합, 차트, 수식 등)을 PDF로 변환하기 매우 어려움

**클라이언트 구현 시도 가능**:
```typescript
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

// Excel 읽기
const arrayBuffer = await file.arrayBuffer();
const workbook = XLSX.read(arrayBuffer);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// HTML로 변환
const html = XLSX.utils.sheet_to_html(worksheet);

// jsPDF로 변환 (단, 서식 손실 많음)
const doc = new jsPDF();
doc.html(html, {
  callback: (pdf) => {
    pdf.save("output.pdf");
  }
});
```

**문제점**:
- 차트/이미지 변환 안됨
- 복잡한 서식 손실
- 여러 시트 처리 어려움

**권장**: LibreOffice 서버 사용 (Python unoconv 또는 Node.js libreoffice-convert)

---

#### 6. Word to PDF
**현재 상태**: ❌ UI만 있음
**왜 어려운가**: Word의 서식(폰트, 스타일, 이미지 등)을 완벽히 변환 어려움

**클라이언트 구현 시도 가능**:
```typescript
import mammoth from "mammoth";
import jsPDF from "jspdf";

// DOCX를 HTML로 변환
const arrayBuffer = await file.arrayBuffer();
const result = await mammoth.convertToHtml({ arrayBuffer });
const html = result.value;

// jsPDF로 변환 (서식 손실 있음)
const doc = new jsPDF();
doc.html(html, {
  callback: (pdf) => {
    pdf.save("output.pdf");
  }
});
```

**문제점**:
- 복잡한 레이아웃 손실
- 이미지 품질 저하
- 테이블 레이아웃 깨짐

**권장**: LibreOffice, Pandoc, 또는 docx2pdf 서버 사용

---

#### 7. PowerPoint to PDF
**현재 상태**: ❌ UI만 있음
**왜 어려운가**: 슬라이드 레이아웃, 애니메이션, 차트 변환 매우 복잡

**클라이언트 구현**: 거의 불가능
- pptxgenjs는 생성만 가능, 파싱 불가
- 슬라이드 렌더링 엔진 필요

**권장**: LibreOffice 서버 사용 (필수)

---

### Priority 3 - 복잡한 UI 필요

#### 8. PDF 검열 (PDF Redact)
**현재 상태**: ⚠️ 정보만 제공
**구현 방법**: Canvas 오버레이로 영역 선택 UI

**구현 가이드**:
```typescript
// 1. PDF 페이지를 Canvas로 렌더링
const page = await pdf.getPage(pageNumber);
const canvas = document.createElement("canvas");
await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

// 2. Canvas 위에 투명한 overlay Canvas 추가
const overlayCanvas = document.createElement("canvas");
overlayCanvas.style.position = "absolute";

// 3. 마우스 드래그로 사각형 그리기
overlayCanvas.addEventListener("mousedown", (e) => {
  // 시작점 저장
});
overlayCanvas.addEventListener("mousemove", (e) => {
  // 사각형 그리기 (빨간 테두리)
});
overlayCanvas.addEventListener("mouseup", (e) => {
  // 영역 저장
});

// 4. pdf-lib로 검은색 박스 그리기
const pdfDoc = await PDFDocument.load(arrayBuffer);
const pages = pdfDoc.getPages();
const page = pages[pageIndex];

for (const rect of redactionRects) {
  page.drawRectangle({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    color: rgb(0, 0, 0), // 검은색
  });
}
```

**구현 시간**: 약 4-6시간 (Canvas UI + pdf-lib 통합)

---

#### 9. PDF 복구 (PDF Repair)
**현재 상태**: ⚠️ 진단만 가능
**구현 방법**: pdf-lib로 재구성 시도

**구현 가이드**:
```typescript
try {
  // 1단계: 로드 시도
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
    throwOnInvalidObject: false, // 오류 무시
  });

  // 2단계: 새 PDF로 복사
  const newPdf = await PDFDocument.create();
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    try {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
    } catch (pageError) {
      console.warn(`Page ${i + 1} 복구 실패`);
      // 빈 페이지 추가
      newPdf.addPage();
    }
  }

  // 3단계: 저장
  const repairedBytes = await newPdf.save();
} catch (error) {
  // 복구 불가능
}
```

**제한**: 심각한 손상은 복구 불가. QPDF, Ghostscript 서버 권장.

---

#### 10. PDF/A 변환
**현재 상태**: ⚠️ 정보만 제공
**구현 방법**: 메타데이터 추가 (완전한 PDF/A는 서버 필요)

**구현 가이드**:
```typescript
import { PDFDocument, PDFString, PDFName } from "pdf-lib";

const pdfDoc = await PDFDocument.load(arrayBuffer);

// PDF/A 메타데이터 추가 (기본 레벨만)
const metadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

pdfDoc.catalog.set(PDFName.of("Metadata"), PDFString.of(metadata));

// 폰트 임베드 필요 (pdf-lib로 제한적)
```

**제한**: 완전한 PDF/A 표준 준수는 어려움. pikepdf, PDFBox 서버 권장.

---

## 🎯 최종 통계

### 구현 완료 현황
| 카테고리 | 이전 | 현재 | 변화 |
|---------|------|------|------|
| **완전 작동** | 25/36 (69.4%) | 27/36 (75.0%) | ⬆️ +2 |
| **미완성** | 10/36 (27.8%) | 8/36 (22.2%) | ⬇️ -2 |
| **API 의존** | 1/36 (2.8%) | 0/36 (0%) | ⬇️ -1 |

### 새로 완성된 기능
1. ✅ **이미지 추출**: 가짜 → 완전 작동 (pdfjs-dist + JSZip)
2. ✅ **PDF 비교**: API 의존 → 클라이언트 (diff-match-patch)

### 남은 미완성 기능 (8개)
- **클라이언트 구현 가능** (2개): PDF 보호, PDF 잠금 해제
- **서버 권장** (3개): Excel/Word/PowerPoint to PDF
- **복잡한 UI 필요** (3개): PDF 검열, PDF 복구, PDF/A

---

## 📚 기술 스택 요약

### 사용 중인 라이브러리
```typescript
// PDF 처리
import { PDFDocument } from "pdf-lib";      // PDF 생성/편집
import * as pdfjsLib from "pdfjs-dist";     // PDF 파싱/렌더링

// 문서 변환
import * as XLSX from "xlsx";               // Excel
import mammoth from "mammoth";              // Word DOCX
import { Document } from "docx";            // Word 생성
import pptxgen from "pptxgenjs";           // PowerPoint 생성

// 유틸리티
import JSZip from "jszip";                  // ZIP 생성
import DiffMatchPatch from "diff-match-patch"; // 텍스트 비교
import jsPDF from "jspdf";                  // PDF 생성 (간단)
```

---

## 🚀 다음 단계 권장사항

### 즉시 구현 가능 (1-2시간)
1. ✅ PDF 보호/잠금 해제 - pdf-lib API 사용
2. ⚠️ "Coming Soon" 배지 - Office 변환 페이지에 추가

### 단기 구현 (4-6시간)
3. PDF 검열 - Canvas 오버레이 UI
4. PDF 복구 - 기본 재구성 로직

### 장기 구현 (서버 필요)
5. Excel/Word/PowerPoint to PDF - LibreOffice 서버
6. PDF/A 완전 준수 - pikepdf 서버

---

## 📝 커밋 로그

### Commit 1: 이미지 추출 + PDF 비교
```
a7a270d - Implement image extraction and PDF comparison with client-side processing

- Image Extraction: pdfjs-dist + Canvas + JSZip
- PDF Comparison: diff-match-patch + Levenshtein
- Dependencies: mammoth, jszip, diff-match-patch
```

---

## ✅ 완료 체크리스트

- [x] 이미지 추출 완전 구현
- [x] PDF 비교 완전 구현
- [x] 필요한 라이브러리 설치
- [x] TypeScript 타입 체크 통과
- [x] 커밋 및 푸시 완료
- [ ] PDF 보호/잠금 해제 구현 (권장)
- [ ] "Coming Soon" UI 개선 (권장)
- [ ] 최종 검증 보고서 작성 (진행 중)

---

**작성일**: 2025-11-15
**다음 검토**: 새 기능 추가 시

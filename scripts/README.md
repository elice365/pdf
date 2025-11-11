# SEO Images Generator

PDF 변환 사이트에 맞는 메타 이미지와 파비콘을 생성하는 스크립트입니다.

## 생성되는 이미지

### Open Graph & Twitter Card
- `og-image.png` (1200x630) - Facebook, LinkedIn 등 소셜 미디어 공유 이미지
- `twitter-image.png` (1200x600) - Twitter 카드 이미지

### Favicons
- `favicon.ico` - 브라우저 탭 아이콘
- `favicon-16x16.png` - 작은 파비콘
- `favicon-32x32.png` - 일반 파비콘

### Mobile & PWA Icons
- `apple-touch-icon.png` (180x180) - iOS 홈 화면 아이콘
- `android-chrome-192x192.png` (192x192) - Android PWA 아이콘
- `android-chrome-512x512.png` (512x512) - Android 고해상도 PWA 아이콘

## 사용 방법

```bash
# 모든 이미지 생성
pnpm run generate:images

# 또는 직접 실행
node scripts/generate-images-sharp.js
```

## 디자인 특징

- **브랜드 컬러**: iLovePDF 빨강 (#c40e2d)
- **그라데이션**: #c40e2d → #a00c26
- **깔끔한 디자인**: PDF 아이콘과 간결한 텍스트
- **반응형**: 각 플랫폼에 최적화된 크기

## 기술 스택

- **Sharp**: 고성능 이미지 처리 라이브러리
- **SVG to PNG**: SVG를 PNG로 변환하여 고품질 이미지 생성

## 파일 크기

- OG Image: ~65KB
- Twitter Image: ~46KB
- Android 512x512: ~14KB
- Android 192x192: ~2.8KB
- Apple Touch Icon: ~2.5KB
- Favicon 32x32: ~572B
- Favicon 16x16: ~118B

모든 이미지는 최적화되어 있으며, 웹 성능에 미치는 영향이 최소화되어 있습니다.

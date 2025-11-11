import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // PDF 처리 관련 네이티브 모듈을 서버 외부 패키지로 설정
  serverExternalPackages: [
    'canvas',
    '@napi-rs/canvas',
    'pdf-lib',
    'pdfjs-dist',
    'fabric',
    'jsdom'
  ],
};

export default nextConfig;

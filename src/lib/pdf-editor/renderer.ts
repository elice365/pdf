// PDF 렌더링 엔진
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import type { PDFPageInfo } from "./types";

// PDF.js 워커 설정
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export class PDFRenderer {
  private pdf: pdfjsLib.PDFDocumentProxy | null = null;
  private pages: PDFPageInfo[] = [];

  /**
   * PDF 파일 로드
   */
  async loadPDF(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    this.pdf = await loadingTask.promise;

    // 모든 페이지 정보 추출
    this.pages = [];
    for (let i = 1; i <= this.pdf.numPages; i++) {
      const page = await this.pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });

      this.pages.push({
        pageNumber: i,
        width: viewport.width,
        height: viewport.height,
      });
    }
  }

  /**
   * 특정 페이지 렌더링
   */
  async renderPage(
    pageNumber: number,
    scale: number = 1.0,
    canvas?: HTMLCanvasElement,
  ): Promise<HTMLCanvasElement> {
    if (!this.pdf) {
      throw new Error("PDF not loaded");
    }

    const page = await this.pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const renderCanvas = canvas || document.createElement("canvas");
    renderCanvas.width = viewport.width;
    renderCanvas.height = viewport.height;

    const context = renderCanvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: renderCanvas,
    }).promise;

    return renderCanvas;
  }

  /**
   * 썸네일 생성
   */
  async generateThumbnail(pageNumber: number): Promise<string> {
    const canvas = await this.renderPage(pageNumber, 0.2);
    return canvas.toDataURL("image/jpeg", 0.7);
  }

  /**
   * 모든 페이지 썸네일 생성
   */
  async generateAllThumbnails(): Promise<PDFPageInfo[]> {
    const pagesWithThumbnails = await Promise.all(
      this.pages.map(async (page) => ({
        ...page,
        thumbnail: await this.generateThumbnail(page.pageNumber),
      })),
    );

    this.pages = pagesWithThumbnails;
    return pagesWithThumbnails;
  }

  /**
   * 페이지 정보 가져오기
   */
  getPages(): PDFPageInfo[] {
    return this.pages;
  }

  /**
   * 총 페이지 수 가져오기
   */
  getPageCount(): number {
    return this.pdf?.numPages || 0;
  }

  /**
   * 특정 페이지 정보 가져오기
   */
  getPageInfo(pageNumber: number): PDFPageInfo | undefined {
    return this.pages.find((p) => p.pageNumber === pageNumber);
  }
}

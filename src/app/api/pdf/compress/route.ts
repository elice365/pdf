import { createCanvas } from "@napi-rs/canvas";
import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const quality = (formData.get("quality") as string) || "medium";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const qualityMap = { low: 50, medium: 75, high: 90 };
    const jpegQuality = qualityMap[quality as keyof typeof qualityMap] || 75;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const originalSize = arrayBuffer.byteLength;

    // Load PDF with pdfjs-dist
    const uint8Array = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;

    // Create new PDF document
    const pdfDoc = await PDFDocument.create();

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });

      // Create canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      // Render page to canvas
      await page.render({
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport: viewport,
        canvas: canvas as unknown as HTMLCanvasElement,
      }).promise;

      // Convert canvas to buffer
      const buffer = canvas.toBuffer("image/png");

      // Compress with sharp
      const compressedBuffer = await sharp(buffer)
        .jpeg({ quality: jpegQuality })
        .toBuffer();

      // Embed compressed image in new PDF
      const image = await pdfDoc.embedJpg(compressedBuffer);
      const pdfPage = pdfDoc.addPage([viewport.width, viewport.height]);
      pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const compressedSize = pdfBytes.byteLength;
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      originalSize,
      compressedSize,
      compressionRatio: `${((1 - compressedSize / originalSize) * 100).toFixed(2)}%`,
    });
  } catch (error) {
    console.error("Compress PDF error:", error);
    return NextResponse.json(
      {
        error: "Failed to compress PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

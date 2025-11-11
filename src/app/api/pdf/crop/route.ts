import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const cropBoxStr = formData.get("cropBox") as string;
    const marginStr = formData.get("margin") as string;

    if (!file) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 },
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    if (pages.length === 0) {
      return NextResponse.json({ error: "PDF has no pages" }, { status: 400 });
    }

    // Determine cropping method: specific cropBox or uniform margin
    if (cropBoxStr) {
      // Parse cropBox JSON
      let cropBox: CropBox;
      try {
        cropBox = JSON.parse(cropBoxStr);
      } catch {
        return NextResponse.json(
          { error: "Invalid cropBox JSON format" },
          { status: 400 },
        );
      }

      // Validate cropBox values
      if (
        typeof cropBox.x !== "number" ||
        typeof cropBox.y !== "number" ||
        typeof cropBox.width !== "number" ||
        typeof cropBox.height !== "number"
      ) {
        return NextResponse.json(
          { error: "cropBox must contain numeric x, y, width, height" },
          { status: 400 },
        );
      }

      // Apply specific crop box to all pages
      for (const page of pages) {
        page.setCropBox(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
      }

      // Save cropped PDF
      const pdfBytes = await pdfDoc.save();
      const base64 = Buffer.from(pdfBytes).toString("base64");

      return NextResponse.json({
        success: true,
        pdf: base64,
        pageCount: pages.length,
        cropBox,
        method: "specific",
      });
    }

    if (marginStr) {
      // Parse margin value
      const margin = Number.parseInt(marginStr, 10);

      if (Number.isNaN(margin) || margin < 0) {
        return NextResponse.json(
          { error: "margin must be a non-negative number" },
          { status: 400 },
        );
      }

      // Apply uniform margin to all pages
      for (const page of pages) {
        const { width, height } = page.getSize();
        const newWidth = width - margin * 2;
        const newHeight = height - margin * 2;

        if (newWidth <= 0 || newHeight <= 0) {
          return NextResponse.json(
            {
              error: "Margin too large for page size",
              details: `Page size: ${width}x${height}, margin: ${margin}`,
            },
            { status: 400 },
          );
        }

        page.setCropBox(margin, margin, newWidth, newHeight);
      }

      // Save cropped PDF
      const pdfBytes = await pdfDoc.save();
      const base64 = Buffer.from(pdfBytes).toString("base64");

      return NextResponse.json({
        success: true,
        pdf: base64,
        pageCount: pages.length,
        margin,
        method: "margin",
      });
    }

    // Neither cropBox nor margin provided
    return NextResponse.json(
      { error: "Either cropBox or margin must be provided" },
      { status: 400 },
    );
  } catch (error) {
    console.error("PDF crop error:", error);
    return NextResponse.json(
      {
        error: "Failed to crop PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

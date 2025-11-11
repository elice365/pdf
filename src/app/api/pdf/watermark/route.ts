import { type NextRequest, NextResponse } from "next/server";
import { degrees, PDFDocument, rgb } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;
    const opacity = Number.parseFloat(
      (formData.get("opacity") as string) || "0.3",
    );
    const fontSize = Number.parseInt(
      (formData.get("fontSize") as string) || "60",
      10,
    );
    const color = (formData.get("color") as string) || "#CCCCCC";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json(
        { error: "Watermark text is required" },
        { status: 400 },
      );
    }

    // Convert hex color to RGB
    const r = Number.parseInt(color.slice(1, 3), 16) / 255;
    const g = Number.parseInt(color.slice(3, 5), 16) / 255;
    const b = Number.parseInt(color.slice(5, 7), 16) / 255;

    // Load PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Draw diagonal watermark in center
      page.drawText(text, {
        x: width / 2 - text.length * fontSize * 0.3,
        y: height / 2,
        size: fontSize,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(-45),
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      watermarkText: text,
      totalPages: pages.length,
      opacity,
      fontSize,
      color,
    });
  } catch (error) {
    console.error("Add watermark error:", error);
    return NextResponse.json(
      {
        error: "Failed to add watermark",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

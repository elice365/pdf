import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";

type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const position = (formData.get("position") as Position) || "bottom-center";
    const fontSize = Number.parseInt(
      (formData.get("fontSize") as string) || "12",
      10,
    );
    const format = (formData.get("format") as string) || "{page}/{total}";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Load PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    // Add page numbers to each page
    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      const pageNumber = i + 1;
      const text = format
        .replace("{page}", pageNumber.toString())
        .replace("{total}", totalPages.toString());

      // Calculate text width (approximate)
      const textWidth = fontSize * text.length * 0.6;
      let x: number;
      let y: number;

      // Calculate position
      switch (position) {
        case "top-left":
          x = 50;
          y = height - 50;
          break;
        case "top-center":
          x = (width - textWidth) / 2;
          y = height - 50;
          break;
        case "top-right":
          x = width - textWidth - 50;
          y = height - 50;
          break;
        case "bottom-left":
          x = 50;
          y = 50;
          break;
        case "bottom-center":
          x = (width - textWidth) / 2;
          y = 50;
          break;
        case "bottom-right":
          x = width - textWidth - 50;
          y = 50;
          break;
        default:
          x = (width - textWidth) / 2;
          y = 50;
      }

      // Draw page number
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      totalPages,
      position,
      format,
    });
  } catch (error) {
    console.error("Add page numbers error:", error);
    return NextResponse.json(
      {
        error: "Failed to add page numbers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

import { type NextRequest, NextResponse } from "next/server";
import { degrees, PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get file and parameters
    const file = formData.get("file") as File | null;
    const rotationStr = formData.get("rotation") as string | null;
    const pagesStr = formData.get("pages") as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 },
      );
    }

    if (!rotationStr) {
      return NextResponse.json(
        { error: "rotation parameter is required (90, 180, or 270)" },
        { status: 400 },
      );
    }

    // Parse rotation angle
    const rotation = Number.parseInt(rotationStr, 10);
    if (![90, 180, 270].includes(rotation)) {
      return NextResponse.json(
        { error: "rotation must be 90, 180, or 270 degrees" },
        { status: 400 },
      );
    }

    // Load PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    // Determine which pages to rotate
    let pageIndices: number[];
    if (!pagesStr || pagesStr === "all") {
      // Rotate all pages
      pageIndices = pdfDoc.getPageIndices();
    } else {
      // Rotate specific pages (convert to 0-based index)
      pageIndices = pagesStr
        .split(",")
        .map((p) => Number.parseInt(p.trim(), 10) - 1)
        .filter((p) => p >= 0 && p < totalPages);
    }

    // Validate page indices
    if (pageIndices.length === 0) {
      return NextResponse.json(
        { error: "No valid pages to rotate" },
        { status: 400 },
      );
    }

    // Rotate specified pages
    for (const pageIndex of pageIndices) {
      const page = pdfDoc.getPage(pageIndex);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotation) % 360));
    }

    // Save rotated PDF
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      totalPages,
      rotatedPages: pageIndices.length,
      rotation,
      affectedPages: pageIndices.map((i) => i + 1),
    });
  } catch (error) {
    console.error("Rotate PDF error:", error);
    return NextResponse.json(
      {
        error: "Failed to rotate PDF pages",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

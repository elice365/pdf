import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get file and parameters
    const file = formData.get("file") as File | null;
    const startPageStr = formData.get("startPage") as string | null;
    const endPageStr = formData.get("endPage") as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 },
      );
    }

    if (!startPageStr || !endPageStr) {
      return NextResponse.json(
        { error: "startPage and endPage are required" },
        { status: 400 },
      );
    }

    // Parse page numbers (convert to 0-based index)
    const startPage = Number.parseInt(startPageStr, 10) - 1;
    const endPage = Number.parseInt(endPageStr, 10) - 1;

    // Load source PDF
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();

    // Validate page range
    if (startPage < 0 || endPage >= totalPages || startPage > endPage) {
      return NextResponse.json(
        {
          error: "Invalid page range",
          details: `Valid range: 1-${totalPages}, requested: ${startPage + 1}-${endPage + 1}`,
        },
        { status: 400 },
      );
    }

    // Create new PDF with selected pages
    const newPdf = await PDFDocument.create();
    const pagesToCopy = [];

    for (let i = startPage; i <= endPage; i++) {
      pagesToCopy.push(i);
    }

    const copiedPages = await newPdf.copyPages(sourcePdf, pagesToCopy);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    // Save split PDF
    const pdfBytes = await newPdf.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      originalPageCount: totalPages,
      extractedPageCount: pagesToCopy.length,
      pageRange: `${startPage + 1}-${endPage + 1}`,
    });
  } catch (error) {
    console.error("Split PDF error:", error);
    return NextResponse.json(
      {
        error: "Failed to split PDF file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

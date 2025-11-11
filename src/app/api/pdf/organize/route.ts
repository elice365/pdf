import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get file and parameters
    const file = formData.get("file") as File | null;
    const pageOrderStr = formData.get("pageOrder") as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 },
      );
    }

    if (!pageOrderStr) {
      return NextResponse.json(
        { error: "pageOrder parameter is required (e.g., [2,1,3,5])" },
        { status: 400 },
      );
    }

    // Parse page order
    let pageOrder: number[];
    try {
      pageOrder = JSON.parse(pageOrderStr);
      if (!Array.isArray(pageOrder) || pageOrder.length === 0) {
        throw new Error("pageOrder must be a non-empty array");
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Invalid pageOrder format",
          details:
            "pageOrder must be a JSON array of page numbers (e.g., [2,1,3,5])",
        },
        { status: 400 },
      );
    }

    // Load source PDF
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();

    // Convert to 0-based indices and validate
    const pageIndices = pageOrder.map((p) => p - 1);
    const invalidPages = pageIndices.filter((p) => p < 0 || p >= totalPages);

    if (invalidPages.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid page numbers in pageOrder",
          details: `Valid range: 1-${totalPages}, invalid pages: ${invalidPages.map((p) => p + 1).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Create new PDF with reordered pages
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);

    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    // Save organized PDF
    const pdfBytes = await newPdf.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      originalPageCount: totalPages,
      newPageCount: pageOrder.length,
      deletedPages: totalPages - pageOrder.length,
      pageOrder: pageOrder,
    });
  } catch (error) {
    console.error("Organize PDF error:", error);
    return NextResponse.json(
      {
        error: "Failed to organize PDF pages",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

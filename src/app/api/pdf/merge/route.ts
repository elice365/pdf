import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Collect all files from FormData (file1, file2, file3, ...)
    const files: File[] = [];
    for (let i = 1; i <= 10; i++) {
      const file = formData.get(`file${i}`) as File | null;
      if (file) {
        files.push(file);
      }
    }

    // Validate minimum files
    if (files.length < 2) {
      return NextResponse.json(
        { error: "At least 2 PDF files are required for merging" },
        { status: 400 },
      );
    }

    // Create new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each file and copy pages
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    // Save merged PDF
    const pdfBytes = await mergedPdf.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      pageCount: mergedPdf.getPageCount(),
      fileCount: files.length,
    });
  } catch (error) {
    console.error("Merge PDF error:", error);
    return NextResponse.json(
      {
        error: "Failed to merge PDF files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

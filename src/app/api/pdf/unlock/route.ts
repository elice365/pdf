import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

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

    // Load PDF document with ignoreEncryption to remove restrictions
    // Note: This only works for PDFs with permission restrictions,
    // NOT for password-encrypted PDFs
    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
    } catch (loadError) {
      // If loading fails, the PDF might be password-protected
      return NextResponse.json(
        {
          error: "Failed to unlock PDF",
          details:
            "This PDF appears to be password-encrypted. pdf-lib cannot unlock password-protected PDFs, only permission-restricted PDFs.",
        },
        { status: 400 },
      );
    }

    // Collect document information
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const creator = pdfDoc.getCreator();

    // Save PDF without restrictions
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      pageCount,
      metadata: {
        title: title || undefined,
        author: author || undefined,
        subject: subject || undefined,
        creator: creator || undefined,
      },
      message:
        "PDF restrictions removed successfully. Note: Password-encrypted PDFs cannot be unlocked with this tool.",
    });
  } catch (error) {
    console.error("PDF unlock error:", error);
    return NextResponse.json(
      {
        error: "Failed to unlock PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

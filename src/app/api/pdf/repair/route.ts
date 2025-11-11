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

    // Attempt to load PDF document with ignoreEncryption to handle corrupted PDFs
    let originalPdf: PDFDocument;
    let loadError: Error | null = null;

    try {
      originalPdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
    } catch (error) {
      loadError = error instanceof Error ? error : new Error("Unknown error");

      // If standard loading fails, try alternative repair approach
      try {
        // Create a new PDF document
        originalPdf = await PDFDocument.create();

        // Attempt to parse pages from corrupted PDF
        const corruptedPdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
          throwOnInvalidObject: false,
        });

        // Copy all accessible pages
        const pageIndices = Array.from(
          { length: corruptedPdf.getPageCount() },
          (_, i) => i,
        );

        const copiedPages = await originalPdf.copyPages(
          corruptedPdf,
          pageIndices,
        );

        for (const page of copiedPages) {
          originalPdf.addPage(page);
        }
      } catch (repairError) {
        return NextResponse.json(
          {
            error: "Failed to repair PDF",
            details:
              "The PDF is too severely corrupted to be repaired. Original error: " +
              (loadError?.message || "Unknown error"),
          },
          { status: 400 },
        );
      }
    }

    // Get page count
    const pageCount = originalPdf.getPageCount();

    if (pageCount === 0) {
      return NextResponse.json(
        {
          error: "Failed to repair PDF",
          details: "No pages could be recovered from the PDF",
        },
        { status: 400 },
      );
    }

    // Create new repaired PDF
    const repairedPdf = await PDFDocument.create();

    // Copy metadata if available
    try {
      const title = originalPdf.getTitle();
      const author = originalPdf.getAuthor();
      const subject = originalPdf.getSubject();
      const creator = originalPdf.getCreator();
      const producer = originalPdf.getProducer();

      if (title) repairedPdf.setTitle(title);
      if (author) repairedPdf.setAuthor(author);
      if (subject) repairedPdf.setSubject(subject);
      if (creator) repairedPdf.setCreator(creator);
      if (producer) repairedPdf.setProducer(producer);
    } catch (metadataError) {
      // Metadata might be corrupted, continue without it
      console.warn("Could not copy metadata:", metadataError);
    }

    // Copy all pages to new document
    let repairedPageCount = 0;
    const failedPages: number[] = [];

    for (let i = 0; i < pageCount; i++) {
      try {
        const [copiedPage] = await repairedPdf.copyPages(originalPdf, [i]);
        repairedPdf.addPage(copiedPage);
        repairedPageCount++;
      } catch (pageError) {
        console.warn(`Failed to copy page ${i + 1}:`, pageError);
        failedPages.push(i + 1);
      }
    }

    if (repairedPageCount === 0) {
      return NextResponse.json(
        {
          error: "Failed to repair PDF",
          details: "No pages could be successfully copied to the repaired PDF",
        },
        { status: 400 },
      );
    }

    // Save repaired PDF
    const pdfBytes = await repairedPdf.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    // Determine repair status
    const status =
      repairedPageCount === pageCount ? "fully_repaired" : "partially_repaired";

    return NextResponse.json({
      success: true,
      pdf: base64,
      repairedPages: repairedPageCount,
      totalPages: pageCount,
      failedPages: failedPages.length > 0 ? failedPages : undefined,
      status,
      message:
        status === "fully_repaired"
          ? "PDF successfully repaired"
          : `PDF partially repaired: ${repairedPageCount} of ${pageCount} pages recovered`,
    });
  } catch (error) {
    console.error("PDF repair error:", error);
    return NextResponse.json(
      {
        error: "Failed to repair PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load PDF document with pdfjs-dist (disable worker for Node.js environment)
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;

    const totalPages = pdf.numPages;
    const nonBlankPages: number[] = [];
    const removedPages: number[] = [];

    // Analyze each page to determine if it's blank
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      // Extract text from page
      const pageText = content.items
        .map((item: any) => {
          return "str" in item ? item.str : "";
        })
        .join(" ")
        .trim();

      // Check if page is blank (no text or only whitespace)
      if (pageText.length === 0) {
        removedPages.push(pageNum);
      } else {
        nonBlankPages.push(pageNum);
      }
    }

    // If all pages are blank, return error
    if (nonBlankPages.length === 0) {
      return NextResponse.json(
        {
          error: "All pages are blank",
          details: "The PDF contains no text content",
        },
        { status: 400 },
      );
    }

    // If no blank pages found, return original PDF
    if (removedPages.length === 0) {
      const base64 = Buffer.from(uint8Array).toString("base64");
      return NextResponse.json({
        success: true,
        pdf: base64,
        removedPages: [],
        totalPages,
        remainingPages: totalPages,
      });
    }

    // Create new PDF with only non-blank pages using pdf-lib
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    // Convert to 0-based indices for pdf-lib
    const pageIndices = nonBlankPages.map((p) => p - 1);
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);

    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    // Save new PDF
    const pdfBytes = await newPdf.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      removedPages,
      totalPages,
      remainingPages: nonBlankPages.length,
    });
  } catch (error) {
    console.error("Remove blank pages error:", error);
    return NextResponse.json(
      {
        error: "Failed to remove blank pages from PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

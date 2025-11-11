import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

interface ValidationResult {
  isValid: boolean;
  version: string | null;
  pageCount: number;
  isEncrypted: boolean;
  hasMetadata: boolean;
  isPDFA: boolean;
  issues: string[];
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}

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

    const validation: ValidationResult = {
      isValid: true,
      version: null,
      pageCount: 0,
      isEncrypted: false,
      hasMetadata: false,
      isPDFA: false,
      issues: [],
    };

    // Validate with pdf-lib
    let pdfLibDoc: PDFDocument | null = null;
    try {
      pdfLibDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      validation.pageCount = pdfLibDoc.getPageCount();

      // Check metadata
      const title = pdfLibDoc.getTitle();
      const author = pdfLibDoc.getAuthor();
      const subject = pdfLibDoc.getSubject();
      const creator = pdfLibDoc.getCreator();
      const producer = pdfLibDoc.getProducer();
      const creationDate = pdfLibDoc.getCreationDate();
      const modificationDate = pdfLibDoc.getModificationDate();

      validation.hasMetadata = !!(
        title ||
        author ||
        subject ||
        creator ||
        producer
      );

      if (validation.hasMetadata) {
        validation.metadata = {
          title: title || undefined,
          author: author || undefined,
          subject: subject || undefined,
          creator: creator || undefined,
          producer: producer || undefined,
          creationDate: creationDate?.toString(),
          modificationDate: modificationDate?.toString(),
        };
      }

      // Check page count validity
      if (validation.pageCount === 0) {
        validation.issues.push("PDF has no pages");
        validation.isValid = false;
      }
    } catch (error) {
      validation.issues.push(
        `Failed to load PDF with pdf-lib: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      validation.isValid = false;
    }

    // Validate with pdfjs-dist for additional checks
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdfjsDoc = await loadingTask.promise;

      // Get PDF version
      const metadata = await pdfjsDoc.getMetadata();
      const info = metadata.info as Record<string, unknown>;
      validation.version = (info?.PDFFormatVersion as string) || null;

      // Check encryption
      validation.isEncrypted = info?.IsEncrypted === "yes";

      if (validation.isEncrypted) {
        validation.issues.push("PDF is encrypted or password-protected");
      }

      // Check PDF/A compliance (basic check)
      // PDF/A typically has specific metadata entries
      if (info && typeof info === "object") {
        // Check for PDF/A identifier in metadata
        validation.isPDFA = !!(
          info.GTS_PDFA1Version ||
          info.GTS_PDFAVersion ||
          (typeof info.Producer === "string" &&
            info.Producer.toLowerCase().includes("pdf/a"))
        );
      }

      // Verify page count matches
      if (pdfLibDoc && pdfjsDoc.numPages !== validation.pageCount) {
        validation.issues.push(
          `Page count mismatch: pdf-lib reports ${validation.pageCount}, pdfjs reports ${pdfjsDoc.numPages}`,
        );
      }

      // Check for corruption by attempting to read first and last page
      if (pdfjsDoc.numPages > 0) {
        try {
          await pdfjsDoc.getPage(1);
          if (pdfjsDoc.numPages > 1) {
            await pdfjsDoc.getPage(pdfjsDoc.numPages);
          }
        } catch (pageError) {
          validation.issues.push(
            `PDF pages may be corrupted: ${pageError instanceof Error ? pageError.message : "Unknown error"}`,
          );
          validation.isValid = false;
        }
      }

      // Check PDF version validity
      if (validation.version) {
        const versionNum = Number.parseFloat(validation.version);
        if (Number.isNaN(versionNum) || versionNum < 1.0 || versionNum > 2.0) {
          validation.issues.push(
            `Unusual PDF version: ${validation.version} (expected 1.0-2.0)`,
          );
        }
      } else {
        validation.issues.push("PDF version could not be determined");
      }
    } catch (error) {
      validation.issues.push(
        `Failed to validate PDF with pdfjs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      validation.isValid = false;
    }

    // Additional validation checks
    if (validation.pageCount > 10000) {
      validation.issues.push(
        `Unusually high page count: ${validation.pageCount} pages`,
      );
    }

    // Final validation status
    if (validation.issues.length > 0 && validation.isValid) {
      // Has warnings but still valid
      validation.isValid = !validation.issues.some((issue) =>
        issue.toLowerCase().includes("failed"),
      );
    }

    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (error) {
    console.error("PDF validation error:", error);
    return NextResponse.json(
      {
        error: "Failed to validate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

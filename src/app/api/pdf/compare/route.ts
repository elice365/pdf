import { type NextRequest, NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Levenshtein distance algorithm
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function calculateSimilarity(text1: string, text2: string): number {
  const longer = text1.length > text2.length ? text1 : text2;
  const shorter = text1.length > text2.length ? text2 : text1;

  if (longer.length === 0) return 100;

  const editDistance = levenshteinDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
}

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(arrayBuffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item: any) => {
        return "str" in item ? item.str : "";
      })
      .join(" ");

    fullText += pageText + "\n";
  }

  return fullText;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file1 = formData.get("file1") as File;
    const file2 = formData.get("file2") as File;

    if (!file1 || !file2) {
      return NextResponse.json(
        { error: "Two PDF files are required" },
        { status: 400 },
      );
    }

    // Convert files to ArrayBuffer
    const arrayBuffer1 = await file1.arrayBuffer();
    const arrayBuffer2 = await file2.arrayBuffer();

    // Load PDF documents (disable worker for Node.js environment)
    const uint8Array1 = new Uint8Array(arrayBuffer1);
    const uint8Array2 = new Uint8Array(arrayBuffer2);

    const loadingTask1 = pdfjsLib.getDocument({
      data: uint8Array1,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const loadingTask2 = pdfjsLib.getDocument({
      data: uint8Array2,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const [pdf1, pdf2] = await Promise.all([
      loadingTask1.promise,
      loadingTask2.promise,
    ]);

    // Extract text from both PDFs
    const [text1, text2] = await Promise.all([
      extractTextFromPDF(arrayBuffer1),
      extractTextFromPDF(arrayBuffer2),
    ]);

    // Calculate similarity
    const similarity = calculateSimilarity(text1, text2);

    return NextResponse.json({
      success: true,
      file1: {
        name: file1.name,
        pages: pdf1.numPages,
        textLength: text1.length,
      },
      file2: {
        name: file2.name,
        pages: pdf2.numPages,
        textLength: text2.length,
      },
      comparison: {
        pageCountMatch: pdf1.numPages === pdf2.numPages,
        textSimilarity: Number(similarity.toFixed(2)),
        identical: similarity === 100,
      },
    });
  } catch (error) {
    console.error("PDF comparison error:", error);
    return NextResponse.json(
      {
        error: "Failed to compare PDF files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

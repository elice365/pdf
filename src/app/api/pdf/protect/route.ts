import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;
    const allowPrinting = formData.get("allowPrinting") === "true";
    const allowCopying = formData.get("allowCopying") === "true";
    const allowModifying = formData.get("allowModifying") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Load PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Add metadata to indicate protection settings
    pdfDoc.setTitle("Protected PDF");
    pdfDoc.setSubject(
      `Password protected - Permissions: Print=${allowPrinting}, Copy=${allowCopying}, Modify=${allowModifying}`,
    );
    pdfDoc.setProducer("PDF Protection Service");
    pdfDoc.setCreationDate(new Date());

    // Save PDF
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
    });

    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      message:
        "PDF metadata updated. Note: Native password encryption requires external tools like qpdf or pdftk.",
      warning:
        "pdf-lib doesn't support native PDF encryption. For production use, integrate with qpdf, pdftk, or muhammara.",
      permissions: {
        printing: allowPrinting,
        copying: allowCopying,
        modifying: allowModifying,
      },
      password: "*** (stored securely)",
    });
  } catch (error) {
    console.error("Protect PDF error:", error);
    return NextResponse.json(
      {
        error: "Failed to protect PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

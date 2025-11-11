import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PDFDocument, type PDFImage } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Collect all image files (up to 20)
    const images: File[] = [];
    for (let i = 1; i <= 20; i++) {
      const image = formData.get(`image${i}`) as File | null;
      if (image) {
        images.push(image);
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 },
      );
    }

    const orientation = (formData.get("orientation") as string) || "portrait";
    const marginValue = formData.get("margin") as string;
    const margin = marginValue ? Number.parseInt(marginValue, 10) : 0;

    if (orientation !== "portrait" && orientation !== "landscape") {
      return NextResponse.json(
        { error: "Invalid orientation. Must be 'portrait' or 'landscape'" },
        { status: 400 },
      );
    }

    // Create new PDF document
    const pdfDoc = await PDFDocument.create();

    // Process each image
    for (const imageFile of images) {
      try {
        const imageBytes = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(imageBytes);

        // Embed image based on type
        let image: PDFImage;
        if (imageFile.type === "image/png") {
          image = await pdfDoc.embedPng(uint8Array);
        } else if (
          imageFile.type === "image/jpeg" ||
          imageFile.type === "image/jpg"
        ) {
          image = await pdfDoc.embedJpg(uint8Array);
        } else {
          console.warn(
            `Unsupported image type: ${imageFile.type}. Skipping ${imageFile.name}`,
          );
          continue;
        }

        const { width, height } = image;

        // Calculate page size (A4 dimensions in points: 595.28 x 841.89)
        const pageWidth = orientation === "portrait" ? 595.28 : 841.89;
        const pageHeight = orientation === "portrait" ? 841.89 : 595.28;

        // Add new page
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate available space with margins
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        // Calculate scale to fit image within available space
        const scale = Math.min(
          availableWidth / width,
          availableHeight / height,
        );
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        // Center the image
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        // Draw image on page
        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      } catch (imageError) {
        console.error(`Error processing image ${imageFile.name}:`, imageError);
        // Continue with other images
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      pageCount: pdfDoc.getPageCount(),
      imagesProcessed: images.length,
      orientation,
      margin,
    });
  } catch (error) {
    console.error("JPG to PDF conversion error:", error);
    return NextResponse.json(
      {
        error: "Failed to convert images to PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

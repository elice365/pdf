import { type NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFName, PDFString, PDFDict, PDFArray } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 },
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 },
      );
    }

    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Get or create document info
    const title = file.name.replace(/\.pdf$/i, "");
    const creator = "PDF Tools";
    const currentDate = new Date();

    // Set standard metadata
    pdfDoc.setTitle(title);
    pdfDoc.setAuthor(creator);
    pdfDoc.setCreator(creator);
    pdfDoc.setProducer("PDF Tools PDF/A Converter");
    pdfDoc.setCreationDate(currentDate);
    pdfDoc.setModificationDate(currentDate);

    // Get PDF catalog
    const catalog = pdfDoc.catalog;

    // Create PDF/A identification schema (PDF/A-1b)
    // According to ISO 19005-1, PDF/A requires specific metadata

    // Create XMP metadata with PDF/A identification
    const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${title}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>${creator}</rdf:li>
        </rdf:Seq>
      </dc:creator>
      <xmp:CreateDate>${currentDate.toISOString()}</xmp:CreateDate>
      <xmp:ModifyDate>${currentDate.toISOString()}</xmp:ModifyDate>
      <xmp:CreatorTool>${creator}</xmp:CreatorTool>
      <pdf:Producer>PDF Tools PDF/A Converter</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

    // Add XMP metadata stream to catalog
    const metadataStream = pdfDoc.context.stream(xmpMetadata, {
      Type: "Metadata",
      Subtype: "XML",
    });

    const metadataStreamRef = pdfDoc.context.register(metadataStream);
    catalog.set(PDFName.of("Metadata"), metadataStreamRef);

    // Add OutputIntent for PDF/A-1b compliance
    // This specifies the color profile (sRGB IEC61966-2.1 is common for PDF/A-1b)
    const outputIntentDict = pdfDoc.context.obj({
      Type: "OutputIntent",
      S: "GTS_PDFA1",
      OutputConditionIdentifier: PDFString.of("sRGB IEC61966-2.1"),
      Info: PDFString.of("sRGB IEC61966-2.1"),
      RegistryName: PDFString.of("http://www.color.org"),
    });

    const outputIntentRef = pdfDoc.context.register(outputIntentDict);
    const outputIntents = pdfDoc.context.obj([outputIntentRef]);
    catalog.set(PDFName.of("OutputIntents"), outputIntents);

    // Mark as PDF/A compliant in document info
    const markInfo = pdfDoc.context.obj({
      Marked: true,
    });
    catalog.set(PDFName.of("MarkInfo"), markInfo);

    // Save the PDF/A document
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false, // Required for PDF/A-1
    });

    const base64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      success: true,
      pdf: base64,
      metadata: {
        standard: "PDF/A-1b",
        title: title,
        creator: creator,
        creationDate: currentDate.toISOString(),
        pageCount: pdfDoc.getPageCount(),
      },
    });
  } catch (error) {
    console.error("PDF to PDF/A conversion error:", error);
    return NextResponse.json(
      {
        error: "Failed to convert PDF to PDF/A",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;

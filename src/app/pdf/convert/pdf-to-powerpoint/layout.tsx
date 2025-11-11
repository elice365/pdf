import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.pdfToPowerpoint);

export default function PdfToPowerPointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

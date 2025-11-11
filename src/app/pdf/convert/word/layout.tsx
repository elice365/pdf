import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.pdfToWord);

export default function PdfToWordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

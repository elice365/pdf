import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.ocr);

export default function OcrLayout({ children }: { children: React.ReactNode }) {
  return children;
}

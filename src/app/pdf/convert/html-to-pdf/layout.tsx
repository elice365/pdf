import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.htmlToPdf);

export default function HtmlToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

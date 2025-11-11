import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.merge);

export default function MergeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

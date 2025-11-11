import { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.compress);

export default function CompressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

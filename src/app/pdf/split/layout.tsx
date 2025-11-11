import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.split);

export default function SplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

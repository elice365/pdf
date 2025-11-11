import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.protect);

export default function ProtectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

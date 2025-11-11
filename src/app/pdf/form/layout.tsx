import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.form);

export default function FormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

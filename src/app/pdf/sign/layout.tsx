import type { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.sign);

export default function SignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

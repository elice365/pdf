import { Metadata } from "next";
import { generateToolMetadata, toolsMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata(toolsMetadata.rotate);

export default function RotateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

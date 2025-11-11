import { Heart } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity"
      aria-label="iLovePDF 홈으로 이동"
    >
      <span className="text-2xl font-bold">i</span>
      <Heart className="w-5 h-5 fill-primary" aria-hidden="true" />
      <span className="text-2xl font-bold">PDF</span>
    </Link>
  );
}

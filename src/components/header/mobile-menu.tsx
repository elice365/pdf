"use client";

import { ChevronRight, Globe } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const tools = [
  { name: "PDF 합치기", href: "/ko/merge_pdf" },
  { name: "PDF 나누기", href: "/ko/split_pdf" },
  { name: "PDF 압축", href: "/ko/compress_pdf" },
  { name: "PDF 변환", href: "/ko/pdf_to_word" },
  { name: "모든 PDF 도구", href: "/ko/tools" },
];

const languages = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "ja", name: "日本語" },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 dark:bg-black/50 z-[1040] transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <aside
        className={cn(
          "fixed top-[60px] right-0 bottom-0 w-[280px] bg-background dark:bg-surface z-[1040]",
          "border-l border-border dark:border-border shadow-lg",
          "transform transition-transform duration-300 ease-in-out lg:hidden",
          "overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="모바일 네비게이션"
      >
        <nav className="p-4 space-y-6">
          {/* Auth Buttons */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/login" onClick={onClose}>
                로그인
              </Link>
            </Button>
            <Button
              className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link href="/register" onClick={onClose}>
                무료 가입
              </Link>
            </Button>
          </div>

          <Separator />

          {/* Main Navigation */}
          <div className="space-y-1">
            <Link
              href="/features"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-md hover:bg-surface dark:hover:bg-surface/50 transition-colors"
            >
              <span className="font-medium">기능</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link
              href="/pricing"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-md hover:bg-surface dark:hover:bg-surface/50 transition-colors"
            >
              <span className="font-medium">가격</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>

          <Separator />

          {/* Tools Section */}
          <div className="space-y-2">
            <h3 className="px-3 text-sm font-semibold text-muted-foreground uppercase">
              PDF 도구
            </h3>
            <div className="space-y-1">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={onClose}
                  className="block p-3 rounded-md hover:bg-surface dark:hover:bg-surface/50 transition-colors"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          {/* Language Selector */}
          <div className="space-y-2">
            <h3 className="px-3 text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Globe className="w-4 h-4" />
              언어
            </h3>
            <div className="space-y-1">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={`/${lang.code}`}
                  onClick={onClose}
                  className={cn(
                    "block p-3 rounded-md hover:bg-surface dark:hover:bg-surface/50 transition-colors",
                    lang.code === "ko" &&
                      "bg-surface dark:bg-surface/50 font-medium",
                  )}
                >
                  {lang.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

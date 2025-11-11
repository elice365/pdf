"use client";

import { Globe } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const tools = [
  {
    category: "모든 PDF 도구",
    items: [
      {
        name: "PDF 합치기",
        href: "/pdf/merge",
        description: "여러 PDF 파일을 하나로 병합",
      },
      {
        name: "PDF 나누기",
        href: "/pdf/split",
        description: "PDF를 여러 파일로 분할",
      },
      {
        name: "PDF 압축",
        href: "/pdf/compress",
        description: "PDF 파일 크기 줄이기",
      },
      { name: "PDF 회전", href: "/pdf/rotate", description: "PDF 페이지 회전" },
      { name: "PDF 편집", href: "/pdf/edit", description: "PDF 내용 편집" },
      {
        name: "PDF 보호",
        href: "/pdf/protect",
        description: "암호로 PDF 보호",
      },
      {
        name: "Word → PDF",
        href: "/pdf/convert/word-to-pdf",
        description: "Word를 PDF로 변환",
      },
      {
        name: "PDF → JPG",
        href: "/pdf/convert/pdf-to-jpg",
        description: "PDF를 이미지로 변환",
      },
    ],
  },
];

const languages = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
];

export function Navigation() {
  return (
    <nav aria-label="메인 네비게이션">
      <NavigationMenu>
        <NavigationMenuList>
          {/* Tools Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="h-10 px-4 py-2">
              <span>모든 PDF 도구</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-2">
                {tools[0].items.map((tool) => (
                  <ListItem key={tool.href} title={tool.name} href={tool.href}>
                    {tool.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Features Link */}
          <NavigationMenuItem>
            <Link
              href="/#tools-grid"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md",
                "px-4 py-2 text-sm font-medium transition-colors",
                "hover:bg-surface hover:text-foreground dark:hover:bg-surface/70",
                "focus:bg-surface focus:text-foreground dark:focus:bg-surface/70 focus:outline-none",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              기능
            </Link>
          </NavigationMenuItem>

          {/* Pricing Link */}
          <NavigationMenuItem>
            <Link
              href="/#pricing"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md",
                "px-4 py-2 text-sm font-medium transition-colors",
                "hover:bg-surface hover:text-foreground dark:hover:bg-surface/70",
                "focus:bg-surface focus:text-foreground dark:focus:bg-surface/70 focus:outline-none",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              가격
            </Link>
          </NavigationMenuItem>

          {/* Language Selector */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="h-10 px-4 py-2">
              <Globe className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>한국어</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-1 p-2 w-[200px]">
                {languages.map((lang) => (
                  <li key={lang.code}>
                    <Link
                      href="/"
                      className={cn(
                        "block select-none rounded-md p-3 leading-none no-underline",
                        "outline-none transition-colors",
                        "hover:bg-surface/80 hover:text-foreground dark:hover:bg-surface/50",
                        "focus:bg-surface/80 focus:text-foreground dark:focus:bg-surface/50",
                        lang.code === "ko" &&
                          "bg-surface/60 dark:bg-surface/40 font-medium",
                      )}
                      onClick={(e) => {
                        // 언어 변경 로직은 추후 구현
                        if (lang.code !== "ko") {
                          e.preventDefault();
                        }
                      }}
                    >
                      {lang.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || "#"}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline",
            "outline-none transition-colors",
            "hover:bg-surface/80 hover:text-foreground dark:hover:bg-surface/50",
            "focus:bg-surface/80 focus:text-foreground dark:focus:bg-surface/50",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground dark:text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

"use client";

import { cn } from "@/lib/utils";
import type { ToolCategory } from "./tools-data";

const categories = [
  { id: "all", label: "전체", color: null },
  { id: "organize", label: "PDF 구성", color: "#E5322D" },
  { id: "convert", label: "PDF 변환", color: "#F6BD60" },
  { id: "edit", label: "PDF 편집", color: "#F7B801" },
  { id: "security", label: "PDF 보안", color: "#AE7FA7" },
  { id: "optimize", label: "PDF 관리", color: "#98D8C8" },
] as const;

interface FilterTabsProps {
  activeCategory: ToolCategory;
  onCategoryChange: (category: ToolCategory) => void;
}

export function FilterTabs({
  activeCategory,
  onCategoryChange,
}: FilterTabsProps) {
  return (
    <div
      className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide"
      role="tablist"
      aria-label="PDF 도구 카테고리 필터"
    >
      {categories.map((category) => {
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="tools-grid"
            onClick={() => onCategoryChange(category.id as ToolCategory)}
            className={cn(
              "px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isActive
                ? "shadow-md"
                : "bg-surface dark:bg-surface/50 hover:bg-surface/80 dark:hover:bg-surface/70 text-foreground dark:text-foreground",
            )}
            style={
              isActive && category.color
                ? { backgroundColor: category.color, color: "#ffffff" }
                : isActive && !category.color
                  ? {
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-primary-foreground)",
                    }
                  : undefined
            }
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

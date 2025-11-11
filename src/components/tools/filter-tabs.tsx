"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";
import type { ToolCategory } from "./tools-data";

const categoryColors = {
  all: null,
  organize: "#E5322D",
  convert: "#F6BD60",
  edit: "#F7B801",
  security: "#AE7FA7",
  optimize: "#98D8C8",
  other: "#68D391",
} as const;

interface FilterTabsProps {
  activeCategory: ToolCategory;
  onCategoryChange: (category: ToolCategory) => void;
}

export function FilterTabs({
  activeCategory,
  onCategoryChange,
}: FilterTabsProps) {
  const { t } = useLocale();
  const categories = Object.keys(categoryColors) as ToolCategory[];

  return (
    <div
      className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide"
      role="tablist"
      aria-label="PDF tool category filter"
    >
      {categories.map((categoryId) => {
        const isActive = activeCategory === categoryId;
        const color = categoryColors[categoryId];
        const label = t.categories[categoryId as keyof typeof t.categories];

        return (
          <button
            key={categoryId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="tools-grid"
            onClick={() => onCategoryChange(categoryId)}
            className={cn(
              "px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isActive
                ? "shadow-md"
                : "bg-surface dark:bg-surface/50 hover:bg-surface/80 dark:hover:bg-surface/70 text-foreground dark:text-foreground",
            )}
            style={
              isActive && color
                ? { backgroundColor: color, color: "#ffffff" }
                : isActive && !color
                  ? {
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-primary-foreground)",
                    }
                  : undefined
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

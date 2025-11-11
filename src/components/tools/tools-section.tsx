"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { FilterTabs } from "./filter-tabs";
import { ToolCard } from "./tool-card";
import type { ToolCategory } from "./tools-data";
import { getLocalizedTools } from "@/lib/get-localized-tools";
import { useLocale } from "@/components/providers/locale-provider";

// 애니메이션 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function ToolsSection() {
  const { locale } = useLocale();
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("all");

  // Get localized tools based on current locale
  const tools = useMemo(() => getLocalizedTools(locale), [locale]);

  const filteredTools =
    activeCategory === "all"
      ? tools
      : tools.filter((tool) => tool.category === activeCategory);

  return (
    <section
      className="py-8 md:py-12 bg-background dark:bg-background"
      aria-label="PDF 도구"
    >
      <div className="container mx-auto px-4">
        {/* 필터 탭 */}
        <div className="mb-6">
          <FilterTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* 도구 그리드 */}
        <motion.div
          key={activeCategory}
          id="tools-grid"
          aria-live="polite"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredTools.map((tool) => (
            <motion.div key={tool.id} variants={itemVariants}>
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Tool } from "./tools-data";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={tool.href}
      className={cn(
        "group block",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg",
      )}
      aria-label={`${tool.name} 도구 페이지로 이동`}
    >
      <motion.div
        className={cn(
          "p-4 rounded-lg bg-white dark:bg-surface",
          "border border-[#E2E8F0] dark:border-border",
          "shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-md",
        )}
        whileHover={{
          y: -2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={{
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1] as const,
        }}
      >
        <div className="flex flex-col items-center text-center gap-2">
          {/* 아이콘 */}
          <motion.div
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${tool.color}15` }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <FileText
              className="w-5 h-5"
              style={{ color: tool.color }}
              aria-hidden="true"
            />
          </motion.div>

          {/* 제목 */}
          <h3 className="text-xs font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
}

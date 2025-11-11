"use client";

import type { PDFRenderer } from "@/lib/pdf-editor/renderer";
import type { PDFPageInfo } from "@/lib/pdf-editor/types";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentPage } from "@/store/slices/editorSlice";

interface SidebarProps {
  pages: PDFPageInfo[];
  currentPage: number;
  renderer: PDFRenderer;
}

export default function Sidebar({
  pages,
  currentPage,
  renderer,
}: SidebarProps) {
  const dispatch = useAppDispatch();

  const handlePageClick = (pageNumber: number) => {
    dispatch(setCurrentPage(pageNumber));
  };

  // 페이지를 pageNumber 순서대로 정렬
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

  return (
    <div className="w-48 bg-background border-r border overflow-y-auto">
      <div className="p-2 space-y-2">
        {sortedPages.map((page, index) => (
          <button
            key={`page-${index}-${page.pageNumber}`}
            type="button"
            onClick={() => handlePageClick(page.pageNumber)}
            className={cn(
              "w-full rounded-lg border-2 overflow-hidden transition-all",
              "hover:border-primary hover:shadow-md",
              currentPage === page.pageNumber
                ? "border-primary shadow-md"
                : "border",
            )}
          >
            {/* 썸네일 이미지 */}
            {page.thumbnail ? (
              <img
                src={page.thumbnail}
                alt={`Page ${page.pageNumber}`}
                className="w-full h-auto"
              />
            ) : (
              <div className="w-full aspect-[8.5/11] bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Loading...</span>
              </div>
            )}

            {/* 페이지 번호 */}
            <div className="py-1 text-center text-sm text-muted-foreground">
              {page.pageNumber}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HospitalPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export function HospitalPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: HospitalPaginationProps) {
  // 計算顯示的頁碼範圍
  const getVisiblePages = () => {
    const delta = 2; // 當前頁面前後顯示的頁碼數量
    const range = [];
    const rangeWithDots = [];

    // 計算範圍
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // 添加第一頁和省略號
    if (start > 2) {
      rangeWithDots.push(1);
      if (start > 3) {
        rangeWithDots.push('...');
      }
    } else if (start === 2) {
      rangeWithDots.push(1);
    }

    // 添加中間範圍
    rangeWithDots.push(...range);

    // 添加最後一頁和省略號
    if (end < totalPages - 1) {
      if (end < totalPages - 2) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    } else if (end === totalPages - 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  // 計算顯示範圍
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* 顯示資訊 */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          顯示 {startItem}-{endItem} 項，共 {totalItems} 間醫院
        </span>

        {/* 每頁顯示數量選擇 */}
        <div className="flex items-center gap-2">
          <span>每頁</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-16 justify-center"
                disabled={isLoading}
              >
                {pageSize}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => onPageSizeChange(size)}
                  className="cursor-pointer"
                >
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span>項</span>
        </div>
      </div>

      {/* 分頁控制 */}
      <div className="flex items-center gap-1">
        {/* 第一頁 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isLoading}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 上一頁 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">上一頁</span>
        </Button>

        {/* 頁碼按鈕 */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="px-2 py-1 text-muted-foreground">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isCurrentPage = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={`min-w-[40px] ${
                  isCurrentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* 下一頁 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          <span className="hidden sm:inline mr-1">下一頁</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 最後一頁 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
"use client";

import { cn } from "@/lib/utils";

// 費用分類定義
export const ExpenseCategories = {
  medical: "醫療",
  food: "飼料",
  supplement: "保健品",
  daily: "日用品",
  other: "其他",
} as const;

export type ExpenseCategory = keyof typeof ExpenseCategories;

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  // 根據分類獲取顏色樣式
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "醫療":
      case "medical":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "飼料":
      case "food":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "保健品":
      case "supplement":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "日用品":
      case "daily":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
      case "其他":
      case "other":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
      default:
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getCategoryColor(category),
        className
      )}
    >
      {category}
    </span>
  );
}
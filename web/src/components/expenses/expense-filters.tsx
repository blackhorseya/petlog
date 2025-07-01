"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePets } from '@/hooks/use-pets';
import { useCategories } from '@/hooks/use-expenses';
import type { ExpenseFilters } from '@/lib/types/expense';

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function ExpenseFilters({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false,
}: ExpenseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 獲取寵物和分類資料
  const { data: pets = [] } = usePets();
  const { data: categories = [] } = useCategories();

  // 查找選中的寵物和分類
  const selectedPet = pets.find(pet => pet.id === filters.pet_id);
  const selectedCategory = categories.find(cat => cat.name === filters.category);

  // 更新篩選條件的通用函數
  const updateFilter = useCallback((key: keyof ExpenseFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }, [filters, onFiltersChange]);

  // 檢查是否有活動的篩選條件
  const hasActiveFilters = Boolean(
    filters.pet_id || 
    filters.category || 
    filters.start_date || 
    filters.end_date
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            篩選條件
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {Object.values(filters).filter(Boolean).length} 項已設定
              </span>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                清除篩選
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`space-y-4 ${!isExpanded ? 'hidden md:block' : ''}`}>
        {/* 寵物和分類選擇 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 寵物選擇器 */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              寵物
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  {selectedPet ? selectedPet.name : '選擇寵物'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                <DropdownMenuItem
                  onClick={() => updateFilter('pet_id', undefined)}
                  className="cursor-pointer"
                >
                  全部寵物
                </DropdownMenuItem>
                {pets.map((pet) => (
                  <DropdownMenuItem
                    key={pet.id}
                    onClick={() => updateFilter('pet_id', pet.id)}
                    className="cursor-pointer"
                  >
                    {pet.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 分類選擇器 */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              分類
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  {selectedCategory ? selectedCategory.name : '選擇分類'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                <DropdownMenuItem
                  onClick={() => updateFilter('category', undefined)}
                  className="cursor-pointer"
                >
                  全部分類
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => updateFilter('category', category.name)}
                    className="cursor-pointer"
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 第三行：日期範圍 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              開始日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => updateFilter('start_date', e.target.value || undefined)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              結束日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => updateFilter('end_date', e.target.value || undefined)}
                className="pl-10"
                disabled={isLoading}
                min={filters.start_date}
              />
            </div>
          </div>
        </div>

        {/* 快速日期篩選 */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">快速篩選：</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              onFiltersChange({
                ...filters,
                start_date: today,
                end_date: today,
              });
            }}
            disabled={isLoading}
            className="h-7 px-3 text-xs"
          >
            今天
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastWeek = new Date(today);
              lastWeek.setDate(today.getDate() - 7);
              onFiltersChange({
                ...filters,
                start_date: lastWeek.toISOString().split('T')[0],
                end_date: today.toISOString().split('T')[0],
              });
            }}
            disabled={isLoading}
            className="h-7 px-3 text-xs"
          >
            最近一週
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date(today);
              lastMonth.setMonth(today.getMonth() - 1);
              onFiltersChange({
                ...filters,
                start_date: lastMonth.toISOString().split('T')[0],
                end_date: today.toISOString().split('T')[0],
              });
            }}
            disabled={isLoading}
            className="h-7 px-3 text-xs"
          >
            最近一個月
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
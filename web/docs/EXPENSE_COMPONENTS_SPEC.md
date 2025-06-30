# 費用紀錄元件規格

## ExpenseCard 費用卡片元件

### Props 定義

```typescript
interface ExpenseCardProps {
  expense: Expense;           // 必填：費用資料
  onEdit?: (expense: Expense) => void;    // 可選：編輯回調函式
  onDelete?: (expenseId: string) => void; // 可選：刪除回調函式
  loading?: boolean;          // 可選：載入狀態，預設 false
}

interface Expense {
  id: string;          // 費用 ID
  pet_id: string;      // 寵物 ID
  pet_name: string;    // 寵物名稱
  category: string;    // 費用分類
  amount: number;      // 金額（整數，單位：元）
  description?: string; // 描述（可選）
  date: string;        // 日期（ISO 8601 格式）
  created_at: string;  // 建立時間
  updated_at: string;  // 更新時間
}
```

### 使用範例

```tsx
import { ExpenseCard } from '@/components/expenses';

const expense = {
  id: "1",
  pet_id: "pet-1",
  pet_name: "小白",
  category: "醫療",
  amount: 1200,
  description: "定期健康檢查",
  date: "2024-01-15T10:00:00Z",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
};

<ExpenseCard
  expense={expense}
  onEdit={(expense) => console.log('編輯:', expense)}
  onDelete={(id) => console.log('刪除:', id)}
  loading={false}
/>
```

### 設計特點

- 金額使用台幣格式顯示 (NT$1,200)
- 分類標籤使用 CategoryBadge 元件
- 懸停時顯示陰影效果
- 操作按鈕僅在懸停時顯示

---

## CategoryBadge 分類標籤元件

### Props 定義

```typescript
interface CategoryBadgeProps {
  category: string;    // 必填：分類名稱
  className?: string;  // 可選：額外的 CSS 類別
}

// 預設分類定義
export const ExpenseCategories = {
  medical: "醫療",
  food: "飼料", 
  supplement: "保健品",
  daily: "日用品",
  other: "其他",
} as const;

export type ExpenseCategory = keyof typeof ExpenseCategories;
```

### 使用範例

```tsx
import { CategoryBadge, ExpenseCategories } from '@/components/expenses';

// 基本使用
<CategoryBadge category="醫療" />

// 自訂樣式
<CategoryBadge category="飼料" className="mx-2" />

// 使用預設分類
<CategoryBadge category={ExpenseCategories.medical} />
```

### 色彩配置

| 分類 | 配色方案 |
|------|----------|
| 醫療 | 紅色系 (red) |
| 飼料 | 綠色系 (green) |
| 保健品 | 藍色系 (blue) |
| 日用品 | 紫色系 (purple) |
| 其他 | 灰色系 (gray) |
| 未知分類 | 橙色系 (orange) |

---

## SummaryPanel 摘要面板元件

### Props 定義

```typescript
interface SummaryPanelProps {
  summary: ExpenseSummary; // 必填：摘要資料
  loading?: boolean;       // 可選：載入狀態，預設 false
}

interface ExpenseSummary {
  totalAmount: number;     // 總支出金額
  monthlyAmount: number;   // 本月支出金額
  lastMonthAmount: number; // 上月支出金額
  categoryBreakdown: {     // 分類統計
    category: string;      // 分類名稱
    amount: number;        // 分類總金額
    count: number;         // 分類筆數
  }[];
  recentExpenses: {        // 最近費用
    id: string;            // 費用 ID
    amount: number;        // 金額
    category: string;      // 分類
    date: string;          // 日期
  }[];
}
```

### 使用範例

```tsx
import { SummaryPanel } from '@/components/expenses';

const summaryData = {
  totalAmount: 15000,
  monthlyAmount: 3500,
  lastMonthAmount: 3200,
  categoryBreakdown: [
    { category: "醫療", amount: 8000, count: 4 },
    { category: "飼料", amount: 5000, count: 8 },
    { category: "保健品", amount: 2000, count: 3 },
  ],
  recentExpenses: [
    { id: "1", amount: 500, category: "飼料", date: "2024-01-15" },
    { id: "2", amount: 1200, category: "醫療", date: "2024-01-14" },
  ],
};

<SummaryPanel 
  summary={summaryData}
  loading={false}
/>
```

### 功能特點

- 自動計算月度變化百分比
- 趨勢指示器 (上升/下降)
- 分類統計含百分比計算
- 最近費用預設顯示 5 筆
- 載入狀態骨架屏動畫

---

## ExpenseCharts 圖表元件

### Props 定義

```typescript
interface ExpenseChartsProps {
  data: ChartData;     // 必填：圖表資料
  loading?: boolean;   // 可選：載入狀態，預設 false
}

interface ChartData {
  trendData: {         // 趨勢資料
    date: string;      // 日期
    amount: number;    // 當日金額
  }[];
  categoryData: {      // 分類資料
    category: string;  // 分類名稱
    amount: number;    // 分類金額
    percentage: number; // 佔比百分比
    color: string;     // 顯示顏色
  }[];
}
```

### 使用範例

```tsx
import { ExpenseCharts, getCategoryColor } from '@/components/expenses';

const chartData = {
  trendData: [
    { date: "2024-01-10", amount: 200 },
    { date: "2024-01-11", amount: 500 },
    { date: "2024-01-12", amount: 300 },
    { date: "2024-01-13", amount: 800 },
    { date: "2024-01-14", amount: 400 },
    { date: "2024-01-15", amount: 600 },
    { date: "2024-01-16", amount: 350 },
  ],
  categoryData: [
    { 
      category: "醫療", 
      amount: 8000, 
      percentage: 53.3,
      color: getCategoryColor("醫療")
    },
    { 
      category: "飼料", 
      amount: 5000, 
      percentage: 33.3,
      color: getCategoryColor("飼料")
    },
    { 
      category: "保健品", 
      amount: 2000, 
      percentage: 13.3,
      color: getCategoryColor("保健品")
    },
  ],
};

<ExpenseCharts 
  data={chartData}
  loading={false}
/>
```

### 設計實現

#### 趨勢圖
- 使用 CSS 寬度比例實現條狀圖效果
- 顯示過去 7 日資料
- 自動計算最大值進行比例縮放

#### 圓餅圖
- 使用 CSS `conic-gradient` 實現分段效果
- 固定尺寸 192x192px
- 包含完整圖例說明

### 工具函式

```typescript
// 取得分類對應顏色
export const getCategoryColor = (category: string) => string;

// 支援的分類對應色彩
// 醫療: #ef4444 (red-500)
// 飼料: #22c55e (green-500)  
// 保健品: #3b82f6 (blue-500)
// 日用品: #a855f7 (purple-500)
// 其他: #6b7280 (gray-500)
// 預設: #f97316 (orange-500)
```

---

## 通用設計規範

### 金額格式化

所有元件都使用統一的金額格式化函式：

```typescript
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(amount);
};

// 輸出範例: NT$1,200
```

### 日期格式化

```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
  });
};

// 輸出範例: 2024年1月15日
```

### 響應式類別

常用的響應式 Tailwind 類別：

```css
/* 網格布局 */
.grid.gap-4.md:grid-cols-2.lg:grid-cols-3

/* 間距調整 */
.space-y-4.md:space-y-6

/* 字體大小 */
.text-sm.md:text-base

/* 內距調整 */
.p-4.md:p-6
```

### 暗色主題支援

所有元件都支援暗色主題，使用 Tailwind 的 `dark:` 前綴：

```css
/* 背景色 */
.bg-red-100.dark:bg-red-900/20

/* 文字色 */
.text-red-800.dark:text-red-300

/* 邊框色 */
.border-red-200.dark:border-red-800
```

## 效能考量

### React.memo 優化

建議對大列表中的元件使用 React.memo：

```tsx
import React from 'react';

export const ExpenseCard = React.memo(function ExpenseCard(props) {
  // 元件實現
});
```

### 虛擬化建議

當費用列表超過 100 筆時，建議使用虛擬化：

```tsx
import { FixedSizeList as List } from 'react-window';

const ExpenseList = ({ expenses }) => (
  <List
    height={600}
    itemCount={expenses.length}
    itemSize={120}
    itemData={expenses}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <ExpenseCard expense={data[index]} />
      </div>
    )}
  </List>
);
```
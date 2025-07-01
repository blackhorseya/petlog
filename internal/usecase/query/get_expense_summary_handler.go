package query

import (
	"context"
	"errors"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// GetExpenseSummaryQuery 封裝查詢費用摘要的請求參數
type GetExpenseSummaryQuery struct {
	PetID string `json:"pet_id,omitempty"`
}

// ExpenseSummary 費用摘要結構
type ExpenseSummary struct {
	TotalAmount   int              `json:"total_amount"`
	CategoryStats map[string]int   `json:"category_stats"`
	Recent        []*model.Expense `json:"recent,omitempty"`
}

// GetExpenseSummaryHandler 處理查詢費用摘要的業務邏輯
type GetExpenseSummaryHandler struct {
	expenseRepo repository.ExpenseRepository
}

// NewGetExpenseSummaryHandler 建立新的 handler 實例
func NewGetExpenseSummaryHandler(expenseRepo repository.ExpenseRepository) *GetExpenseSummaryHandler {
	if expenseRepo == nil {
		panic("expenseRepo is required")
	}
	return &GetExpenseSummaryHandler{expenseRepo: expenseRepo}
}

// Handle 執行查詢費用摘要的流程
func (h *GetExpenseSummaryHandler) Handle(c context.Context, query GetExpenseSummaryQuery) (*ExpenseSummary, error) {
	// ctx := contextx.WithContext(c)

	// 查詢所有費用紀錄（如果有指定 PetID 則篩選）
	// TODO: 實作查詢費用摘要的業務邏輯
	// var opts []repository.ExpenseQueryOption
	// if query.PetID != "" {
	// 	opts = append(opts, repository.WithPetID(query.PetID))
	// }

	// expenses, _, err := h.expenseRepo.FindAll(ctx, opts...)
	// if err != nil {
	// 	ctx.Error("failed to get expenses for summary", "error", err)
	// 	return nil, err
	// }

	// // 計算統計資料
	// summary := &ExpenseSummary{
	// 	TotalAmount:   0,
	// 	CategoryStats: make(map[string]int),
	// 	Recent:        make([]*model.Expense, 0),
	// }

	// // 計算總金額和分類統計
	// for _, expense := range expenses {
	// 	summary.TotalAmount += expense.Amount
	// 	summary.CategoryStats[expense.Category] += expense.Amount
	// }

	// // 取最近 5 筆紀錄
	// recentCount := 5
	// if len(expenses) < recentCount {
	// 	recentCount = len(expenses)
	// }
	// summary.Recent = expenses[:recentCount]

	// ctx.Info("expense summary retrieved successfully", "total_amount", summary.TotalAmount, "categories", len(summary.CategoryStats))
	return nil, errors.New("not implemented")
}

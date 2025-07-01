package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// GetExpenseByIDQuery 封裝根據 ID 查詢費用的請求參數
type GetExpenseByIDQuery struct {
	ID string `json:"id"`
}

// GetExpenseByIDHandler 處理根據 ID 查詢費用的業務邏輯
type GetExpenseByIDHandler struct {
	expenseRepo repository.ExpenseRepository
}

// NewGetExpenseByIDHandler 建立新的 handler 實例
func NewGetExpenseByIDHandler(expenseRepo repository.ExpenseRepository) *GetExpenseByIDHandler {
	return &GetExpenseByIDHandler{
		expenseRepo: expenseRepo,
	}
}

// Handle 執行根據 ID 查詢費用的業務邏輯
func (h *GetExpenseByIDHandler) Handle(c context.Context, query GetExpenseByIDQuery) (*model.Expense, error) {
	ctx := contextx.WithContext(c)

	ctx.Info("開始根據 ID 查詢費用", "expense_id", query.ID)

	// TODO: 驗證 ID 格式

	expense, err := h.expenseRepo.FindByID(c, query.ID)
	if err != nil {
		ctx.Error("查詢費用失敗", "expense_id", query.ID, "error", err)
		return nil, fmt.Errorf("根據 ID 查詢費用失敗: %w", err)
	}

	ctx.Info("成功查詢費用", "expense_id", query.ID)
	return expense, nil
}

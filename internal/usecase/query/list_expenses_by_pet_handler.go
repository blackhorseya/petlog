package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// ListExpensesByPetQuery 封裝根據寵物 ID 查詢費用列表的請求參數
type ListExpensesByPetQuery struct {
	PetID   string                          `json:"pet_id"`
	Options []repository.ExpenseQueryOption `json:"-"`
}

// ListExpensesByPetHandler 處理查詢費用列表的業務邏輯
type ListExpensesByPetHandler struct {
	expenseRepo repository.ExpenseRepository
}

// NewListExpensesByPetHandler 建立新的 handler 實例
func NewListExpensesByPetHandler(expenseRepo repository.ExpenseRepository) *ListExpensesByPetHandler {
	return &ListExpensesByPetHandler{
		expenseRepo: expenseRepo,
	}
}

// Handle 執行根據寵物 ID 查詢費用列表的業務邏輯
func (h *ListExpensesByPetHandler) Handle(c context.Context, query ListExpensesByPetQuery) ([]*model.Expense, int, error) {
	ctx := contextx.WithContext(c)

	ctx.Info("開始根據寵物 ID 查詢費用列表", "pet_id", query.PetID)

	// TODO: 驗證 PetID 格式

	// 組合查詢選項，加上 PetID 篩選
	opts := append(query.Options, repository.WithPetID(query.PetID))

	expenses, total, err := h.expenseRepo.FindAll(c, opts...)
	if err != nil {
		ctx.Error("查詢費用列表失敗", "pet_id", query.PetID, "error", err)
		return nil, 0, fmt.Errorf("根據寵物 ID 查詢費用列表失敗: %w", err)
	}

	ctx.Info("成功查詢費用列表", "pet_id", query.PetID, "total", total, "count", len(expenses))
	return expenses, total, nil
}

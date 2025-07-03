package command

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// DeleteExpenseCommand 封裝刪除費用的請求參數
type DeleteExpenseCommand struct {
	ID string `json:"id"`
}

// DeleteExpenseHandler 處理刪除費用的業務邏輯
type DeleteExpenseHandler struct {
	expenseRepo repository.ExpenseRepository
}

// NewDeleteExpenseHandler 建立新的 handler 實例
func NewDeleteExpenseHandler(expenseRepo repository.ExpenseRepository) *DeleteExpenseHandler {
	return &DeleteExpenseHandler{
		expenseRepo: expenseRepo,
	}
}

// Handle 執行刪除費用的業務邏輯
func (h *DeleteExpenseHandler) Handle(c context.Context, cmd DeleteExpenseCommand) error {
	ctx := contextx.WithContext(c)

	ctx.Info("開始刪除費用", "expense_id", cmd.ID)

	// 驗證 ID 格式
	if cmd.ID == "" {
		ctx.Warn("費用 ID 為必填欄位", "expense_id", cmd.ID)
		return fmt.Errorf("費用 ID 為必填欄位")
	}

	// 先檢查費用是否存在
	_, err := h.expenseRepo.FindByID(ctx, cmd.ID)
	if err != nil {
		ctx.Error("查詢費用失敗", "expense_id", cmd.ID, "error", err)
		return fmt.Errorf("查詢費用失敗: %w", err)
	}

	// 執行刪除
	err = h.expenseRepo.Delete(ctx, cmd.ID)
	if err != nil {
		ctx.Error("刪除費用失敗", "expense_id", cmd.ID, "error", err)
		return fmt.Errorf("刪除費用失敗: %w", err)
	}

	ctx.Info("成功刪除費用", "expense_id", cmd.ID)
	return nil
}

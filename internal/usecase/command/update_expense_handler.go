package command

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// UpdateExpenseCommand 封裝更新費用的請求參數
type UpdateExpenseCommand struct {
	ID          string    `json:"id"`
	PetID       string    `json:"pet_id"`
	Amount      int       `json:"amount"`
	Description string    `json:"description,omitempty"`
	Date        time.Time `json:"date"`
}

// UpdateExpenseHandler 處理更新費用的業務邏輯
type UpdateExpenseHandler struct {
	expenseRepo repository.ExpenseRepository
}

// NewUpdateExpenseHandler 建立新的 handler 實例
func NewUpdateExpenseHandler(expenseRepo repository.ExpenseRepository) *UpdateExpenseHandler {
	if expenseRepo == nil {
		panic("expenseRepo is required")
	}
	return &UpdateExpenseHandler{expenseRepo: expenseRepo}
}

// Handle 執行更新費用的流程
func (h *UpdateExpenseHandler) Handle(c context.Context, cmd UpdateExpenseCommand) (*model.Expense, error) {
	ctx := contextx.WithContext(c)

	// TODO: 欄位驗證（如金額 > 0、必填欄位等）

	// 取得原始資料，僅允許更新部分欄位，category 不可變更
	existing, err := h.expenseRepo.FindByID(ctx, cmd.ID)
	if err != nil {
		ctx.Error("expense not found", "id", cmd.ID, "error", err)
		return nil, fmt.Errorf("expense not found: %w", err)
	}

	existing.PetID = cmd.PetID
	existing.Amount = cmd.Amount
	existing.Description = cmd.Description
	existing.Date = cmd.Date
	existing.UpdatedAt = time.Now()
	// existing.Category 不可變更

	if err := h.expenseRepo.Update(ctx, existing); err != nil {
		ctx.Error("failed to update expense", "error", err)
		return nil, fmt.Errorf("failed to update expense: %w", err)
	}

	ctx.Info("expense updated successfully", "id", existing.ID)
	return existing, nil
}

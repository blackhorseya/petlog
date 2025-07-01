package command

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// CreateExpenseCommand 封裝建立費用的請求參數
type CreateExpenseCommand struct {
	PetID       string    `json:"pet_id"`
	Category    string    `json:"category"`
	Amount      int       `json:"amount"`
	Description string    `json:"description,omitempty"`
	Date        time.Time `json:"date"`
}

// CreateExpenseHandler 處理建立費用的業務邏輯
type CreateExpenseHandler struct {
	expenseRepo repository.ExpenseRepository
}

// NewCreateExpenseHandler 建立新的 handler 實例
func NewCreateExpenseHandler(expenseRepo repository.ExpenseRepository) *CreateExpenseHandler {
	if expenseRepo == nil {
		panic("expenseRepo is required")
	}
	return &CreateExpenseHandler{expenseRepo: expenseRepo}
}

// Handle 執行建立費用的流程
func (h *CreateExpenseHandler) Handle(c context.Context, cmd CreateExpenseCommand) (*model.Expense, error) {
	ctx := contextx.WithContext(c)

	// TODO: 欄位驗證（如金額 > 0、必填欄位等）

	exp := &model.Expense{
		PetID:       cmd.PetID,
		Category:    cmd.Category,
		Amount:      cmd.Amount,
		Description: cmd.Description,
		Date:        cmd.Date,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.expenseRepo.Create(ctx, exp); err != nil {
		ctx.Error("failed to create expense", "error", err)
		return nil, fmt.Errorf("failed to create expense: %w", err)
	}

	ctx.Info("expense created successfully", "pet_id", exp.PetID, "amount", exp.Amount)
	return exp, nil
}

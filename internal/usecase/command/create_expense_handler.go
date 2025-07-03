package command

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/internal/usecase/behavior"
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
	petRepo     repository.PetRepository
}

// NewCreateExpenseHandler 建立新的 handler 實例
func NewCreateExpenseHandler(expenseRepo repository.ExpenseRepository, petRepo repository.PetRepository) *CreateExpenseHandler {
	if expenseRepo == nil || petRepo == nil {
		panic("expenseRepo and petRepo are required")
	}
	return &CreateExpenseHandler{expenseRepo: expenseRepo, petRepo: petRepo}
}

// Handle 執行建立費用的流程
func (h *CreateExpenseHandler) Handle(c context.Context, cmd CreateExpenseCommand) (*model.Expense, error) {
	ctx := contextx.WithContext(c)

	// 檢查 Pet 是否存在
	_, err := h.petRepo.FindByID(ctx, cmd.PetID)
	if err != nil {
		ctx.Warn("查無此寵物", "pet_id", cmd.PetID)
		return nil, fmt.Errorf("查無此寵物，請確認寵物 ID 是否正確")
	}

	exp := &model.Expense{
		PetID:       cmd.PetID,
		Category:    cmd.Category,
		Amount:      cmd.Amount,
		Description: cmd.Description,
		Date:        cmd.Date,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	validator := behavior.NewExpenseValidator()
	if err := validator.ValidateCreateExpense(exp); err != nil {
		ctx.Warn("費用驗證失敗", "error", err, "pet_id", exp.PetID)
		return nil, fmt.Errorf("費用驗證失敗: %w", err)
	}

	if err := h.expenseRepo.Create(ctx, exp); err != nil {
		ctx.Error("failed to create expense", "error", err)
		return nil, fmt.Errorf("failed to create expense: %w", err)
	}

	ctx.Info("expense created successfully", "pet_id", exp.PetID, "amount", exp.Amount)
	return exp, nil
}

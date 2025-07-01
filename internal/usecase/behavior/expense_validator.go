package behavior

import (
	"errors"
	"strings"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// ExpenseValidator 提供費用資料驗證功能
type ExpenseValidator struct{}

// NewExpenseValidator 建立新的驗證器實例
func NewExpenseValidator() *ExpenseValidator {
	return &ExpenseValidator{}
}

// ValidateExpense 驗證費用資料的完整性與合法性
func (v *ExpenseValidator) ValidateExpense(expense *model.Expense) error {
	if expense == nil {
		return errors.New("費用資料不可為空")
	}

	// 驗證 PetID
	if strings.TrimSpace(expense.PetID) == "" {
		return errors.New("寵物 ID 為必填欄位")
	}

	// 驗證 Category
	if strings.TrimSpace(expense.Category) == "" {
		return errors.New("分類為必填欄位")
	}

	// 驗證 Amount
	if expense.Amount <= 0 {
		return errors.New("金額必須大於 0")
	}

	// 驗證 Date
	if expense.Date.IsZero() {
		return errors.New("日期為必填欄位")
	}

	// 驗證日期不可為未來
	if expense.Date.After(time.Now()) {
		return errors.New("日期不可為未來時間")
	}

	return nil
}

// ValidateCreateExpense 驗證建立費用時的特定規則
func (v *ExpenseValidator) ValidateCreateExpense(expense *model.Expense) error {
	if err := v.ValidateExpense(expense); err != nil {
		return err
	}

	// 建立時的額外驗證邏輯（如有需要）
	// 例如：檢查重複記錄等

	return nil
}

// ValidateUpdateExpense 驗證更新費用時的特定規則
func (v *ExpenseValidator) ValidateUpdateExpense(expense *model.Expense) error {
	if err := v.ValidateExpense(expense); err != nil {
		return err
	}

	// 驗證 ID
	if strings.TrimSpace(expense.ID) == "" {
		return errors.New("費用 ID 為必填欄位")
	}

	// 更新時的額外驗證邏輯（如有需要）

	return nil
}

package endpoint

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// CreateExpenseRequest 建立費用紀錄的請求結構
// 只需填寫必要欄位
// 金額 amount 為正整數，category 為預設分類之一
// 日期 date 採 RFC3339 字串
// 描述 description 可為空
// PetID 必填
// Example: {"pet_id":"xxx","category":"飼料","amount":100,"description":"買飼料","date":"2024-07-01"}
type CreateExpenseRequest struct {
	PetID       string    `json:"pet_id" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	Amount      int       `json:"amount" binding:"required,min=1"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" binding:"required"`
}

// CreateExpenseResponse 建立費用紀錄的回應結構
// 回傳完整 Expense
type CreateExpenseResponse struct {
	Expense *model.Expense `json:"expense,omitempty"`
	Err     error          `json:"error,omitempty"`
}

func (r CreateExpenseResponse) Failed() error { return r.Err }

// GetExpenseRequest 取得單筆費用紀錄的請求結構
type GetExpenseRequest struct {
	ID string `json:"id"`
}

// GetExpenseResponse 取得單筆費用紀錄的回應結構
type GetExpenseResponse struct {
	Expense *model.Expense `json:"expense,omitempty"`
	Err     error          `json:"error,omitempty"`
}

func (r GetExpenseResponse) Failed() error { return r.Err }

// ListExpensesRequest 查詢費用紀錄的請求結構
type ListExpensesRequest struct {
	PetID     string    `json:"pet_id,omitempty"`
	Category  string    `json:"category,omitempty"`
	StartDate time.Time `json:"start_date,omitempty"`
	EndDate   time.Time `json:"end_date,omitempty"`
}

// ListExpensesResponse 查詢費用紀錄的回應結構
type ListExpensesResponse struct {
	Expenses []*model.Expense `json:"expenses,omitempty"`
	Err      error            `json:"error,omitempty"`
}

func (r ListExpensesResponse) Failed() error { return r.Err }

// UpdateExpenseRequest 編輯費用紀錄的請求結構
type UpdateExpenseRequest struct {
	ID          string    `json:"id"`
	PetID       string    `json:"pet_id" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	Amount      int       `json:"amount" binding:"required,min=1"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" binding:"required"`
}

// UpdateExpenseResponse 編輯費用紀錄的回應結構
type UpdateExpenseResponse struct {
	Expense *model.Expense `json:"expense,omitempty"`
	Err     error          `json:"error,omitempty"`
}

func (r UpdateExpenseResponse) Failed() error { return r.Err }

// DeleteExpenseRequest 刪除費用紀錄的請求結構
type DeleteExpenseRequest struct {
	ID string `json:"id"`
}

// DeleteExpenseResponse 刪除費用紀錄的回應結構
type DeleteExpenseResponse struct {
	Err error `json:"error,omitempty"`
}

func (r DeleteExpenseResponse) Failed() error { return r.Err }

// GetExpenseSummaryRequest 查詢費用摘要的請求結構
type GetExpenseSummaryRequest struct {
	PetID string `json:"pet_id,omitempty"`
}

// GetExpenseSummaryResponse 查詢費用摘要的回應結構
type GetExpenseSummaryResponse struct {
	TotalAmount   int              `json:"total_amount"`
	CategoryStats map[string]int   `json:"category_stats"`
	Recent        []*model.Expense `json:"recent,omitempty"`
	Err           error            `json:"error,omitempty"`
}

func (r GetExpenseSummaryResponse) Failed() error { return r.Err }

//go:generate mockgen -destination=./mock_expense.go -package=repository -source=expense.go
package repository

import (
	"context"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// ExpenseQueryOptions 用於 options pattern 查詢條件
// 可依需求擴充更多欄位
type ExpenseQueryOptions struct {
	PetID     *string
	Category  *string
	StartDate *time.Time
	EndDate   *time.Time
	// ...可擴充其他查詢條件
}

type ExpenseQueryOption func(*ExpenseQueryOptions)

// Option function 範例
func WithPetID(id string) ExpenseQueryOption {
	return func(o *ExpenseQueryOptions) {
		o.PetID = &id
	}
}

func WithCategory(category string) ExpenseQueryOption {
	return func(o *ExpenseQueryOptions) {
		o.Category = &category
	}
}

func WithDateRange(start, end time.Time) ExpenseQueryOption {
	return func(o *ExpenseQueryOptions) {
		o.StartDate = &start
		o.EndDate = &end
	}
}

// ExpenseRepository 定義費用紀錄的資料存取介面
// id 型別統一為 string
type ExpenseRepository interface {
	Create(c context.Context, expense *model.Expense) error
	FindByID(c context.Context, id string) (*model.Expense, error)
	Update(c context.Context, expense *model.Expense) error
	Delete(c context.Context, id string) error
	FindAll(c context.Context, opts ...ExpenseQueryOption) (expenses []*model.Expense, total int, err error)
}

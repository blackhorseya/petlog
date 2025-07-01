package mongodb

import (
	"context"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// expenseRepository 為 ExpenseRepository 的 MongoDB 實作
// 實際內容待後續補齊
// 符合 Clean Architecture 的 repository 實作慣例

type expenseRepository struct {
	// TODO: 注入 MongoDB client 或 collection
}

// NewExpenseRepository 建立新的 expenseRepository 實例
func NewExpenseRepository( /* TODO: 需要的參數 */ ) repository.ExpenseRepository {
	return &expenseRepository{}
}

// Create 新增費用紀錄
func (r *expenseRepository) Create(c context.Context, expense *model.Expense) error {
	// TODO: implement
	return nil
}

// FindByID 依 ID 查詢費用紀錄
func (r *expenseRepository) FindByID(c context.Context, id string) (*model.Expense, error) {
	// TODO: implement
	return nil, nil
}

// Update 更新費用紀錄
func (r *expenseRepository) Update(c context.Context, expense *model.Expense) error {
	// TODO: implement
	return nil
}

// Delete 刪除費用紀錄
func (r *expenseRepository) Delete(c context.Context, id string) error {
	// TODO: implement
	return nil
}

// FindAll 查詢費用紀錄（支援 options pattern）
func (r *expenseRepository) FindAll(c context.Context, opts ...repository.ExpenseQueryOption) ([]*model.Expense, int, error) {
	// TODO: implement
	return nil, 0, nil
}

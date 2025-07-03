package mongodb

import (
	"context"
	"time"

	"errors"

	"github.com/blackhorseya/petlog/internal/domain"
	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const expenseCollectionName = "expenses"

// expenseRepository 為 ExpenseRepository 的 MongoDB 實作
// 實際內容待後續補齊
// 符合 Clean Architecture 的 repository 實作慣例

type expenseRepository struct {
	db *mongo.Database
}

// NewExpenseRepository 建立新的 expenseRepository 實例
func NewExpenseRepository(db *mongo.Database) repository.ExpenseRepository {
	return &expenseRepository{db: db}
}

func (r *expenseRepository) collection() *mongo.Collection {
	return r.db.Collection(expenseCollectionName)
}

// Create 新增費用紀錄
func (r *expenseRepository) Create(c context.Context, expense *model.Expense) error {
	ctx := contextx.WithContext(c)
	doc, err := expenseMongoFromDomain(expense)
	if err != nil {
		ctx.Error("領域模型轉換失敗", "error", err)
		return err
	}
	now := time.Now()
	doc.CreatedAt = now
	doc.UpdatedAt = now
	result, err := r.collection().InsertOne(ctx, doc)
	if err != nil {
		ctx.Error("建立費用紀錄失敗", "error", err)
		return convertMongoError(err)
	}
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		expense.ID = oid.Hex()
	}
	ctx.Info("成功建立費用紀錄", "expense_id", expense.ID)
	return nil
}

// FindByID 依 ID 查詢費用紀錄
func (r *expenseRepository) FindByID(c context.Context, id string) (*model.Expense, error) {
	ctx := contextx.WithContext(c)
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		ctx.Warn("無效的費用紀錄 ID 格式", "expense_id", id, "error", err)
		return nil, domain.ErrInvalidID
	}
	filter := bson.M{"_id": objectID}
	var doc expenseMongo
	err = r.collection().FindOne(ctx, filter).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			ctx.Warn("找不到指定的費用紀錄", "expense_id", id)
			return nil, domain.ErrNotFound
		}
		ctx.Error("查找費用紀錄時發生錯誤", "error", err, "expense_id", id)
		return nil, convertMongoError(err)
	}
	expense := doc.toDomain()
	ctx.Info("成功找到費用紀錄", "expense_id", expense.ID)
	return expense, nil
}

// Update 更新費用紀錄
func (r *expenseRepository) Update(c context.Context, expense *model.Expense) error {
	ctx := contextx.WithContext(c)
	doc, err := expenseMongoFromDomain(expense)
	if err != nil {
		ctx.Error("領域模型轉換失敗", "error", err, "expense_id", expense.ID)
		return err
	}
	filter := bson.M{"_id": doc.ID}
	doc.UpdatedAt = time.Now()
	update := bson.M{"$set": doc}
	result, err := r.collection().UpdateOne(ctx, filter, update)
	if err != nil {
		ctx.Error("更新費用紀錄失敗", "error", err, "expense_id", expense.ID)
		return convertMongoError(err)
	}
	if result.MatchedCount == 0 {
		ctx.Warn("找不到要更新的費用紀錄", "expense_id", expense.ID)
		return domain.ErrNotFound
	}
	ctx.Info("成功更新費用紀錄", "expense_id", expense.ID)
	return nil
}

// Delete 刪除費用紀錄
func (r *expenseRepository) Delete(c context.Context, id string) error {
	ctx := contextx.WithContext(c)
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		ctx.Warn("無效的費用紀錄 ID 格式", "expense_id", id, "error", err)
		return domain.ErrInvalidID
	}
	filter := bson.M{"_id": objectID}
	result, err := r.collection().DeleteOne(ctx, filter)
	if err != nil {
		ctx.Error("刪除費用紀錄失敗", "error", err, "expense_id", id)
		return convertMongoError(err)
	}
	if result.DeletedCount == 0 {
		ctx.Warn("找不到要刪除的費用紀錄", "expense_id", id)
		return domain.ErrNotFound
	}
	ctx.Info("成功刪除費用紀錄", "expense_id", id)
	return nil
}

// FindAll 查詢費用紀錄（支援 options pattern）
func (r *expenseRepository) FindAll(c context.Context, opts ...repository.ExpenseQueryOption) ([]*model.Expense, int, error) {
	ctx := contextx.WithContext(c)
	// 預設查詢條件
	queryOpts := &repository.ExpenseQueryOptions{}
	for _, opt := range opts {
		opt(queryOpts)
	}
	filter := bson.M{}
	if queryOpts.PetID != nil {
		filter["pet_id"] = *queryOpts.PetID
	}
	if queryOpts.Category != nil {
		filter["category"] = *queryOpts.Category
	}
	if queryOpts.StartDate != nil || queryOpts.EndDate != nil {
		dateCond := bson.M{}
		if queryOpts.StartDate != nil {
			dateCond["$gte"] = *queryOpts.StartDate
		}
		if queryOpts.EndDate != nil {
			dateCond["$lte"] = *queryOpts.EndDate
		}
		filter["date"] = dateCond
	}
	cursor, err := r.collection().Find(ctx, filter)
	if err != nil {
		ctx.Error("查詢費用紀錄時發生錯誤", "error", err)
		return nil, 0, convertMongoError(err)
	}
	defer cursor.Close(ctx)
	var expenses []*model.Expense
	for cursor.Next(ctx) {
		var doc expenseMongo
		if err := cursor.Decode(&doc); err != nil {
			ctx.Error("解碼費用紀錄時發生錯誤", "error", err)
			return nil, 0, convertMongoError(err)
		}
		expenses = append(expenses, doc.toDomain())
	}
	if err := cursor.Err(); err != nil {
		ctx.Error("遍歷費用紀錄查詢結果時發生錯誤", "error", err)
		return nil, 0, convertMongoError(err)
	}
	total := len(expenses)
	ctx.Info("成功查詢費用紀錄", "count", total)
	return expenses, total, nil
}

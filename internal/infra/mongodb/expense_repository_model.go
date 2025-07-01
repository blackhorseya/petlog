package mongodb

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain"
	"github.com/blackhorseya/petlog/internal/domain/model"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// expenseMongo 是 Expense 的 MongoDB 持久化模型
// 僅用於 infra 層，與 domain model 分離
type expenseMongo struct {
	ID          bson.ObjectID `bson:"_id,omitempty"`
	PetID       string        `bson:"pet_id"`
	Category    string        `bson:"category"`
	Amount      int           `bson:"amount"`
	Description string        `bson:"description,omitempty"`
	Date        time.Time     `bson:"date"`
	CreatedAt   time.Time     `bson:"created_at"`
	UpdatedAt   time.Time     `bson:"updated_at"`
}

// toDomain 轉換為領域模型
func (e *expenseMongo) toDomain() *model.Expense {
	if e == nil {
		return nil
	}
	return &model.Expense{
		ID:          e.ID.Hex(),
		PetID:       e.PetID,
		Category:    e.Category,
		Amount:      e.Amount,
		Description: e.Description,
		Date:        e.Date,
		CreatedAt:   e.CreatedAt,
		UpdatedAt:   e.UpdatedAt,
	}
}

// expenseMongoFromDomain 轉換為持久化模型
func expenseMongoFromDomain(exp *model.Expense) (*expenseMongo, error) {
	if exp == nil {
		return nil, nil
	}

	var objectID bson.ObjectID
	var err error

	if exp.ID != "" {
		objectID, err = bson.ObjectIDFromHex(exp.ID)
		if err != nil {
			return nil, domain.ErrInvalidID
		}
	}

	return &expenseMongo{
		ID:          objectID,
		PetID:       exp.PetID,
		Category:    exp.Category,
		Amount:      exp.Amount,
		Description: exp.Description,
		Date:        exp.Date,
		CreatedAt:   exp.CreatedAt,
		UpdatedAt:   exp.UpdatedAt,
	}, nil
}

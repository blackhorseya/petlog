package mongodb

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

const (
	petCollection = "pets"
)

// petMongoRepo 實作 PetRepository 介面
type petMongoRepo struct {
	db *mongo.Database
}

// NewPetMongoRepo 建立新的 Pet MongoDB Repository
func NewPetMongoRepo(db *mongo.Database) repository.PetRepository {
	return &petMongoRepo{
		db: db,
	}
}

// Create 實作建立新寵物的功能
func (r *petMongoRepo) Create(c context.Context, pet *model.Pet) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始建立新寵物", "pet_name", pet.Name, "owner_id", pet.OwnerID)

	// 將領域模型轉換為持久化模型
	petDoc := fromDomain(pet)

	// 設定時間戳記
	now := time.Now()
	petDoc.CreatedAt = now
	petDoc.UpdatedAt = now

	// 執行插入操作
	collection := r.db.Collection(petCollection)
	result, err := collection.InsertOne(ctx, petDoc)
	if err != nil {
		ctx.Error("建立寵物失敗", "error", err, "pet_name", pet.Name)
		return fmt.Errorf("建立寵物失敗: %w", err)
	}

	// 更新領域模型的 ID
	if oid, ok := result.InsertedID.(string); ok {
		pet.ID = oid
	}

	ctx.Info("成功建立寵物", "pet_id", pet.ID, "pet_name", pet.Name)
	return nil
}

// FindByID 實作了 PetRepository 的 FindByID 方法。
func (r *petMongoRepo) FindByID(c context.Context, id string) (*model.Pet, error) {
	// 實作細節待辦
	return nil, nil
}

// FindByOwnerID 實作了 PetRepository 的 FindByOwnerID 方法。
func (r *petMongoRepo) FindByOwnerID(c context.Context, ownerID string) ([]*model.Pet, error) {
	// 實作細節待辦
	return nil, nil
}

// Update 實作了 PetRepository 的 Update 方法。
func (r *petMongoRepo) Update(c context.Context, pet *model.Pet) error {
	// 實作細節待辦
	return nil
}

// Delete 實作了 PetRepository 的 Delete 方法。
func (r *petMongoRepo) Delete(c context.Context, id string) error {
	// 實作細節待辦
	return nil
}

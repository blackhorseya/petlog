package mongodb

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
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

// FindByID 實作根據 ID 查找寵物的功能
func (r *petMongoRepo) FindByID(c context.Context, id string) (*model.Pet, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("開始根據 ID 查找寵物", "pet_id", id)

	// 建立查詢過濾器
	filter := bson.D{{Key: "_id", Value: id}}

	// 執行查詢操作
	collection := r.db.Collection(petCollection)
	var petDoc petMongo
	err := collection.FindOne(ctx, filter).Decode(&petDoc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			ctx.Warn("找不到指定的寵物", "pet_id", id)
			return nil, fmt.Errorf("找不到 ID 為 %s 的寵物", id)
		}
		ctx.Error("查找寵物時發生錯誤", "error", err, "pet_id", id)
		return nil, fmt.Errorf("查找寵物失敗: %w", err)
	}

	// 轉換為領域模型
	pet := petDoc.toDomain()
	ctx.Info("成功找到寵物", "pet_id", pet.ID, "pet_name", pet.Name)

	return pet, nil
}

// FindByOwnerID 實作根據擁有者 ID 查找所有寵物的功能
func (r *petMongoRepo) FindByOwnerID(c context.Context, ownerID string) ([]*model.Pet, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("開始根據擁有者 ID 查找寵物", "owner_id", ownerID)

	// 建立查詢過濾器
	filter := bson.D{{Key: "owner_id", Value: ownerID}}

	// 執行查詢操作
	collection := r.db.Collection(petCollection)
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		ctx.Error("查詢寵物時發生錯誤", "error", err, "owner_id", ownerID)
		return nil, fmt.Errorf("查詢寵物失敗: %w", err)
	}
	defer cursor.Close(ctx)

	// 迭代查詢結果
	var pets []*model.Pet
	for cursor.Next(ctx) {
		var petDoc petMongo
		if err := cursor.Decode(&petDoc); err != nil {
			ctx.Error("解碼寵物資料時發生錯誤", "error", err, "owner_id", ownerID)
			return nil, fmt.Errorf("解碼寵物資料失敗: %w", err)
		}

		// 轉換為領域模型並加入結果列表
		pet := petDoc.toDomain()
		pets = append(pets, pet)
	}

	// 檢查 cursor 是否有錯誤
	if err := cursor.Err(); err != nil {
		ctx.Error("遍歷查詢結果時發生錯誤", "error", err, "owner_id", ownerID)
		return nil, fmt.Errorf("遍歷查詢結果失敗: %w", err)
	}

	ctx.Info("成功查找寵物", "owner_id", ownerID, "count", len(pets))
	return pets, nil
}

// Update 實作更新寵物資訊的功能
func (r *petMongoRepo) Update(c context.Context, pet *model.Pet) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始更新寵物資訊", "pet_id", pet.ID, "pet_name", pet.Name)

	// 建立查詢過濾器
	filter := bson.D{{Key: "_id", Value: pet.ID}}

	// 將領域模型轉換為持久化模型
	petDoc := fromDomain(pet)

	// 保留原始的 CreatedAt，更新 UpdatedAt
	petDoc.UpdatedAt = time.Now()
	// 注意：CreatedAt 應該從現有文件中保留，這裡先設定為當前時間
	// 在實際應用中，可能需要先查詢現有文件來保留 CreatedAt
	if petDoc.CreatedAt.IsZero() {
		petDoc.CreatedAt = petDoc.UpdatedAt
	}

	// 執行替換操作
	collection := r.db.Collection(petCollection)
	result, err := collection.ReplaceOne(ctx, filter, petDoc)
	if err != nil {
		ctx.Error("更新寵物失敗", "error", err, "pet_id", pet.ID)
		return fmt.Errorf("更新寵物失敗: %w", err)
	}

	// 檢查是否有文件被更新
	if result.MatchedCount == 0 {
		ctx.Warn("找不到要更新的寵物", "pet_id", pet.ID)
		return fmt.Errorf("找不到 ID 為 %s 的寵物", pet.ID)
	}

	ctx.Info("成功更新寵物", "pet_id", pet.ID, "pet_name", pet.Name, "modified_count", result.ModifiedCount)
	return nil
}

// Delete 實作刪除寵物的功能
func (r *petMongoRepo) Delete(c context.Context, id string) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始刪除寵物", "pet_id", id)

	// 建立查詢過濾器
	filter := bson.D{{Key: "_id", Value: id}}

	// 執行刪除操作
	collection := r.db.Collection(petCollection)
	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		ctx.Error("刪除寵物失敗", "error", err, "pet_id", id)
		return fmt.Errorf("刪除寵物失敗: %w", err)
	}

	// 檢查是否有文件被刪除
	if result.DeletedCount == 0 {
		ctx.Warn("找不到要刪除的寵物", "pet_id", id)
		return fmt.Errorf("找不到 ID 為 %s 的寵物", id)
	}

	ctx.Info("成功刪除寵物", "pet_id", id, "deleted_count", result.DeletedCount)
	return nil
}

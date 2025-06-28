package mongodb

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain"
	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const (
	healthLogCollectionName = "health_logs"
)

// HealthLogRepositoryImpl implements the repository.HealthLogRepository interface using MongoDB.
type HealthLogRepositoryImpl struct {
	db *mongo.Database
}

// NewHealthLogRepository creates a new HealthLogRepositoryImpl.
func NewHealthLogRepository(db *mongo.Database) (repository.HealthLogRepository, error) {
	return &HealthLogRepositoryImpl{db: db}, nil
}

func (r *HealthLogRepositoryImpl) collection() *mongo.Collection {
	return r.db.Collection(healthLogCollectionName)
}

// Create inserts a new health log record into the database.
func (r *HealthLogRepositoryImpl) Create(c context.Context, log *model.HealthLog) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始建立健康日誌", "pet_id", log.PetID)

	logDoc, err := healthLogMongoFromDomain(log)
	if err != nil {
		ctx.Error("領域模型轉換失敗", "error", err)
		return err
	}

	now := time.Now()
	logDoc.CreatedAt = now
	logDoc.UpdatedAt = now

	result, err := r.collection().InsertOne(ctx, logDoc)
	if err != nil {
		ctx.Error("建立健康日誌失敗", "error", err)
		return convertMongoError(err)
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		log.ID = oid.Hex()
	}

	ctx.Info("成功建立健康日誌", "log_id", log.ID)
	return nil
}

// FindByID retrieves a health log by its ID.
func (r *HealthLogRepositoryImpl) FindByID(c context.Context, id string) (*model.HealthLog, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("開始根據 ID 查找健康日誌", "log_id", id)

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		ctx.Warn("無效的健康日誌 ID 格式", "log_id", id, "error", err)
		return nil, domain.ErrInvalidID
	}

	filter := bson.M{"_id": objectID}
	var logDoc healthLogMongo

	err = r.collection().FindOne(ctx, filter).Decode(&logDoc)
	if err != nil {
		ctx.Warn("查找健康日誌時發生錯誤", "error", err, "log_id", id)
		return nil, convertMongoError(err)
	}

	log := logDoc.toDomain()
	ctx.Info("成功找到健康日誌", "log_id", log.ID, "pet_id", log.PetID)

	return log, nil
}

// FindByPetID retrieves all health logs for a specific pet within a given date range.
func (r *HealthLogRepositoryImpl) FindByPetID(c context.Context, petID string, startDate, endDate time.Time) ([]*model.HealthLog, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("開始根據寵物 ID 和日期範圍查找健康日誌", "pet_id", petID, "start_date", startDate, "end_date", endDate)

	filter := bson.M{
		"pet_id": petID,
		"date": bson.M{
			"$gte": startDate,
			"$lte": endDate,
		},
	}

	cursor, err := r.collection().Find(ctx, filter)
	if err != nil {
		ctx.Error("查找健康日誌時發生錯誤", "error", err, "pet_id", petID)
		return nil, fmt.Errorf("查找健康日誌失敗: %w", err)
	}
	defer cursor.Close(ctx)

	var logs []*model.HealthLog
	for cursor.Next(ctx) {
		var logDoc healthLogMongo
		if err := cursor.Decode(&logDoc); err != nil {
			ctx.Error("解碼健康日誌時發生錯誤", "error", err, "pet_id", petID)
			return nil, fmt.Errorf("解碼健康日誌失敗: %w", err)
		}
		logs = append(logs, logDoc.toDomain())
	}

	if err := cursor.Err(); err != nil {
		ctx.Error("遍歷健康日誌查詢結果時發生錯誤", "error", err, "pet_id", petID)
		return nil, fmt.Errorf("遍歷查詢結果失敗: %w", err)
	}

	ctx.Info("成功找到健康日誌", "pet_id", petID, "count", len(logs))
	return logs, nil
}

// Update modifies an existing health log record.
func (r *HealthLogRepositoryImpl) Update(c context.Context, log *model.HealthLog) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始更新健康日誌", "log_id", log.ID)

	logDoc, err := healthLogMongoFromDomain(log)
	if err != nil {
		ctx.Error("領域模型轉換失敗", "error", err, "log_id", log.ID)
		return err
	}

	filter := bson.M{"_id": logDoc.ID}

	logDoc.UpdatedAt = time.Now()
	update := bson.M{"$set": logDoc}

	result, err := r.collection().UpdateOne(ctx, filter, update)
	if err != nil {
		ctx.Error("更新健康日誌失敗", "error", err, "log_id", log.ID)
		return convertMongoError(err)
	}

	if result.MatchedCount == 0 {
		ctx.Warn("找不到要更新的健康日誌", "log_id", log.ID)
		return domain.ErrNotFound
	}

	ctx.Info("成功更新健康日誌", "log_id", log.ID)
	return nil
}

// Delete removes a health log record from the database.
func (r *HealthLogRepositoryImpl) Delete(c context.Context, id string) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始刪除健康日誌", "log_id", id)

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		ctx.Warn("無效的健康日誌 ID 格式", "log_id", id, "error", err)
		return domain.ErrInvalidID
	}

	filter := bson.M{"_id": objectID}

	result, err := r.collection().DeleteOne(ctx, filter)
	if err != nil {
		ctx.Error("刪除健康日誌失敗", "error", err, "log_id", id)
		return convertMongoError(err)
	}

	if result.DeletedCount == 0 {
		ctx.Warn("找不到要刪除的健康日誌", "log_id", id)
		return domain.ErrNotFound
	}

	ctx.Info("成功刪除健康日誌", "log_id", id)
	return nil
}

// CountByPetIDs 實作根據寵物 ID 列表統計健康日誌總數的功能，用於聚合查詢
func (r *HealthLogRepositoryImpl) CountByPetIDs(c context.Context, petIDs []string) (int, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("開始根據寵物 ID 列表統計健康日誌數量", "pet_ids_count", len(petIDs))

	// 驗證輸入參數
	if len(petIDs) == 0 {
		ctx.Warn("寵物 ID 列表不能為空")
		return 0, domain.ErrInvalidID
	}

	// 建立查詢過濾器，使用 $in 操作符
	filter := bson.D{{Key: "pet_id", Value: bson.D{{Key: "$in", Value: petIDs}}}}

	// 執行計數操作
	count, err := r.collection().CountDocuments(ctx, filter)
	if err != nil {
		ctx.Error("統計健康日誌數量時發生錯誤", "error", err, "pet_ids_count", len(petIDs))
		return 0, fmt.Errorf("統計健康日誌數量失敗: %w", err)
	}

	ctx.Info("成功統計健康日誌數量", "pet_ids_count", len(petIDs), "total_count", count)
	return int(count), nil
}

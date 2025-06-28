package mongodb

import (
	"context"
	"errors"
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
	medicalRecordCollectionName = "medical_records"
)

// MedicalRecordRepositoryImpl 實作 repository.MedicalRecordRepository 介面，使用 MongoDB。
type MedicalRecordRepositoryImpl struct {
	db *mongo.Database
}

// NewMedicalRecordRepository 建立新的 MedicalRecordRepositoryImpl。
func NewMedicalRecordRepository(db *mongo.Database) (repository.MedicalRecordRepository, error) {
	return &MedicalRecordRepositoryImpl{db: db}, nil
}

func (r *MedicalRecordRepositoryImpl) collection() *mongo.Collection {
	return r.db.Collection(medicalRecordCollectionName)
}

// Create 新增一筆醫療記錄。
func (r *MedicalRecordRepositoryImpl) Create(c context.Context, record *model.MedicalRecord) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始建立新的醫療記錄", "pet_id", record.PetID, "type", record.Type)

	doc, err := medicalRecordMongoFromDomain(record)
	if err != nil {
		ctx.Error("領域模型轉換失敗", "error", err, "pet_id", record.PetID)
		return err
	}

	now := time.Now()
	doc.CreatedAt = now
	doc.UpdatedAt = now

	result, err := r.collection().InsertOne(ctx, doc)
	if err != nil {
		ctx.Error("建立醫療記錄失敗", "error", err, "pet_id", record.PetID)
		return convertMongoError(err)
	}

	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		record.ID = oid.Hex()
	}

	ctx.Info("成功建立醫療記錄", "record_id", record.ID, "pet_id", record.PetID)
	return nil
}

// FindByID 依 ID 查詢單一醫療記錄。
func (r *MedicalRecordRepositoryImpl) FindByID(c context.Context, id string) (*model.MedicalRecord, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("開始根據 ID 查找醫療記錄", "record_id", id)

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		ctx.Warn("無效的醫療記錄 ID 格式", "record_id", id, "error", err)
		return nil, domain.ErrInvalidID
	}

	filter := bson.M{"_id": objectID}
	var doc medicalRecordMongo

	err = r.collection().FindOne(ctx, filter).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			ctx.Warn("找不到指定的醫療記錄", "record_id", id)
			return nil, domain.ErrNotFound
		}
		ctx.Error("查找醫療記錄時發生錯誤", "error", err, "record_id", id)
		return nil, convertMongoError(err)
	}

	record := doc.toDomain()
	ctx.Info("成功找到醫療記錄", "record_id", record.ID, "pet_id", record.PetID)
	return record, nil
}

// FindByPetID 查詢特定寵物的所有醫療記錄（依日期範圍）。
func (r *MedicalRecordRepositoryImpl) FindByPetID(c context.Context, petID string, startDate, endDate time.Time) ([]*model.MedicalRecord, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("開始根據寵物 ID 和日期範圍查找醫療記錄", "pet_id", petID, "start_date", startDate, "end_date", endDate)

	filter := bson.M{
		"pet_id": petID,
		"date": bson.M{
			"$gte": startDate,
			"$lte": endDate,
		},
	}

	cursor, err := r.collection().Find(ctx, filter)
	if err != nil {
		ctx.Error("查找醫療記錄時發生錯誤", "error", err, "pet_id", petID)
		return nil, fmt.Errorf("查找醫療記錄失敗: %w", err)
	}
	defer cursor.Close(ctx)

	var records []*model.MedicalRecord
	for cursor.Next(ctx) {
		var doc medicalRecordMongo
		if err := cursor.Decode(&doc); err != nil {
			ctx.Error("解碼醫療記錄時發生錯誤", "error", err, "pet_id", petID)
			return nil, fmt.Errorf("解碼醫療記錄失敗: %w", err)
		}
		records = append(records, doc.toDomain())
	}

	if err := cursor.Err(); err != nil {
		ctx.Error("遍歷醫療記錄查詢結果時發生錯誤", "error", err, "pet_id", petID)
		return nil, fmt.Errorf("遍歷查詢結果失敗: %w", err)
	}

	ctx.Info("成功找到醫療記錄", "pet_id", petID, "count", len(records))
	return records, nil
}

// Update 更新醫療記錄。
func (r *MedicalRecordRepositoryImpl) Update(c context.Context, record *model.MedicalRecord) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始更新醫療記錄", "record_id", record.ID)

	doc, err := medicalRecordMongoFromDomain(record)
	if err != nil {
		ctx.Error("領域模型轉換失敗", "error", err, "record_id", record.ID)
		return err
	}

	filter := bson.M{"_id": doc.ID}
	doc.UpdatedAt = time.Now()
	update := bson.M{"$set": doc}

	result, err := r.collection().UpdateOne(ctx, filter, update)
	if err != nil {
		ctx.Error("更新醫療記錄失敗", "error", err, "record_id", record.ID)
		return convertMongoError(err)
	}

	if result.MatchedCount == 0 {
		ctx.Warn("找不到要更新的醫療記錄", "record_id", record.ID)
		return domain.ErrNotFound
	}

	ctx.Info("成功更新醫療記錄", "record_id", record.ID)
	return nil
}

// Delete 刪除醫療記錄。
func (r *MedicalRecordRepositoryImpl) Delete(c context.Context, id string) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始刪除醫療記錄", "record_id", id)

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		ctx.Warn("無效的醫療記錄 ID 格式", "record_id", id, "error", err)
		return domain.ErrInvalidID
	}

	filter := bson.M{"_id": objectID}

	result, err := r.collection().DeleteOne(ctx, filter)
	if err != nil {
		ctx.Error("刪除醫療記錄失敗", "error", err, "record_id", id)
		return convertMongoError(err)
	}

	if result.DeletedCount == 0 {
		ctx.Warn("找不到要刪除的醫療記錄", "record_id", id)
		return domain.ErrNotFound
	}

	ctx.Info("成功刪除醫療記錄", "record_id", id)
	return nil
}

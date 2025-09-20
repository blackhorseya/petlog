package mongodb

import (
	"context"
	"log"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const (
	hospitalCollection = "hospitals"
)

// hospitalMongoRepo 實作 HospitalRepository 介面
type hospitalMongoRepo struct {
	db *mongo.Database
}

// NewHospitalRepository 建立新的 Hospital MongoDB Repository
func NewHospitalRepository(db *mongo.Database) repository.HospitalRepository {
	repo := &hospitalMongoRepo{
		db: db,
	}

	// 建立索引
	repo.ensureIndexes()

	return repo
}

// ensureIndexes 建立必要的索引
func (r *hospitalMongoRepo) ensureIndexes() {
	collection := r.db.Collection(hospitalCollection)
	ctx := context.Background()

	// 建立 2dsphere 索引支援地理查詢
	geoIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "location", Value: "2dsphere"}},
		Options: options.Index().SetName("location_2dsphere"),
	}

	// 建立文字索引支援搜尋
	textIndex := mongo.IndexModel{
		Keys: bson.D{
			{Key: "name", Value: "text"},
			{Key: "address", Value: "text"},
			{Key: "veterinarian", Value: "text"},
		},
		Options: options.Index().SetName("text_search"),
	}

	// 建立縣市索引
	countyIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "county", Value: 1}},
		Options: options.Index().SetName("county_index"),
	}

	// 建立狀態索引
	statusIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "status", Value: 1}},
		Options: options.Index().SetName("status_index"),
	}

	// 建立電話號碼索引
	phoneIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "phone", Value: 1}},
		Options: options.Index().SetName("phone_index"),
	}

	// 建立執照號碼唯一索引（部分索引，只對存在的執照號碼建立唯一約束）
	licenseIndex := mongo.IndexModel{
		Keys: bson.D{{Key: "license_no", Value: 1}},
		Options: options.Index().
			SetName("license_no_unique").
			SetUnique(true).
			SetPartialFilterExpression(bson.M{
				"license_no": bson.M{"$exists": true},
			}),
	}

	// 執行索引建立
	log.Printf("開始建立 MongoDB 索引...")

	// 檢查現有索引
	cursor, err := collection.Indexes().List(ctx)
	if err != nil {
		log.Printf("❌ 列出現有索引失敗: %v", err)
	} else {
		var existingIndexes []bson.M
		if err := cursor.All(ctx, &existingIndexes); err == nil {
			log.Printf("📋 現有索引數量: %d", len(existingIndexes))
			for _, idx := range existingIndexes {
				if name, ok := idx["name"].(string); ok {
					log.Printf("  - %s", name)
				}
			}
		}
	}

	// 逐個建立索引以便更好的錯誤追蹤
	indexes := []struct {
		name  string
		model mongo.IndexModel
	}{
		{"地理位置索引 (2dsphere)", geoIndex},
		{"文字搜尋索引", textIndex},
		{"縣市索引", countyIndex},
		{"狀態索引", statusIndex},
		{"電話索引", phoneIndex},
		{"執照號碼索引", licenseIndex},
	}

	for _, idx := range indexes {
		_, err := collection.Indexes().CreateOne(ctx, idx.model)
		if err != nil {
			log.Printf("❌ 建立 %s 失敗: %v", idx.name, err)
		} else {
			log.Printf("✅ 建立 %s 成功", idx.name)
		}
	}

	// 最後再檢查一次地理位置索引
	geoIndexExists := false
	cursor, err = collection.Indexes().List(ctx)
	if err == nil {
		var indexes []bson.M
		if err := cursor.All(ctx, &indexes); err == nil {
			for _, idx := range indexes {
				if name, ok := idx["name"].(string); ok && name == "location_2dsphere" {
					geoIndexExists = true
					log.Printf("🎯 地理位置索引確認存在: %s", name)
					break
				}
			}
		}
	}

	if !geoIndexExists {
		log.Printf("⚠️  地理位置索引可能不存在，附近搜尋功能將無法正常工作")
	}

	log.Printf("索引建立過程完成")
}

// Create 建立新醫院
func (r *hospitalMongoRepo) Create(c context.Context, hospital *model.Hospital) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始建立新醫院", "hospital_name", hospital.Name(), "county", hospital.County())

	hospitalDoc, err := hospitalMongoFromDomain(hospital)
	if err != nil {
		ctx.Error("領域模型轉換失敗", "error", err)
		return err
	}

	// 設定時間戳記
	now := time.Now()
	hospitalDoc.CreatedAt = now
	hospitalDoc.UpdatedAt = now

	collection := r.db.Collection(hospitalCollection)
	result, err := collection.InsertOne(c, hospitalDoc)
	if err != nil {
		ctx.Error("新增醫院失敗", "error", err)
		return convertMongoError(err)
	}

	// 更新領域模型的 ID
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		hospital.SetID(oid.Hex())
	}

	ctx.Info("成功建立醫院", "hospital_id", hospital.ID())
	return nil
}

// GetByID 根據 ID 取得單一醫院
func (r *hospitalMongoRepo) GetByID(c context.Context, id string) (*model.Hospital, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("查詢醫院", "hospital_id", id)

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		ctx.Error("無效的醫院 ID", "id", id, "error", err)
		return nil, convertMongoError(err)
	}

	collection := r.db.Collection(hospitalCollection)
	var hospitalDoc hospitalMongo

	err = collection.FindOne(c, bson.M{"_id": objectID}).Decode(&hospitalDoc)
	if err != nil {
		ctx.Error("查詢醫院失敗", "error", err)
		return nil, convertMongoError(err)
	}

	ctx.Info("成功找到醫院", "hospital_name", hospitalDoc.Name)
	return hospitalDoc.toDomain(), nil
}

// GetByPhone 根據電話號碼取得醫院
func (r *hospitalMongoRepo) GetByPhone(c context.Context, phone string) (*model.Hospital, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("根據電話號碼查詢醫院", "phone", phone)

	if phone == "" {
		ctx.Error("電話號碼不能為空")
		return nil, convertMongoError(mongo.ErrNoDocuments)
	}

	collection := r.db.Collection(hospitalCollection)
	var hospitalDoc hospitalMongo

	err := collection.FindOne(c, bson.M{"phone": phone}).Decode(&hospitalDoc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			ctx.Info("根據電話號碼找不到醫院", "phone", phone)
		} else {
			ctx.Error("查詢醫院失敗", "error", err)
		}
		return nil, convertMongoError(err)
	}

	ctx.Info("成功根據電話號碼找到醫院", "hospital_name", hospitalDoc.Name, "phone", phone)
	return hospitalDoc.toDomain(), nil
}

// GetByLicenseNo 根據執照號碼取得醫院
func (r *hospitalMongoRepo) GetByLicenseNo(c context.Context, licenseNo string) (*model.Hospital, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("根據執照號碼查詢醫院", "license_no", licenseNo)

	if licenseNo == "" {
		ctx.Error("執照號碼不能為空")
		return nil, convertMongoError(mongo.ErrNoDocuments)
	}

	collection := r.db.Collection(hospitalCollection)
	var hospitalDoc hospitalMongo

	err := collection.FindOne(c, bson.M{"license_no": licenseNo}).Decode(&hospitalDoc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			ctx.Info("根據執照號碼找不到醫院", "license_no", licenseNo)
		} else {
			ctx.Error("查詢醫院失敗", "error", err)
		}
		return nil, convertMongoError(err)
	}

	ctx.Info("成功根據執照號碼找到醫院", "hospital_name", hospitalDoc.Name, "license_no", licenseNo)
	return hospitalDoc.toDomain(), nil
}

// Search 搜尋醫院（支援關鍵字、縣市、狀態篩選和分頁）
func (r *hospitalMongoRepo) Search(c context.Context, opts ...repository.SearchOption) (*repository.SearchResult, error) {
	ctx := contextx.WithContext(c)

	// 解析選項
	searchOpts := &repository.SearchOptions{}
	for _, opt := range opts {
		opt(searchOpts)
	}

	ctx.Info("搜尋醫院",
		"keyword", searchOpts.Keyword(),
		"county", searchOpts.County(),
		"status", searchOpts.Status(),
		"limit", searchOpts.Limit(),
		"skip", searchOpts.Skip())

	collection := r.db.Collection(hospitalCollection)

	// 建立查詢條件
	filter := bson.M{}

	// 關鍵字搜尋
	if searchOpts.Keyword() != "" {
		filter["$text"] = bson.M{"$search": searchOpts.Keyword()}
	}

	// 縣市篩選
	if searchOpts.County() != "" {
		filter["county"] = searchOpts.County()
	}

	// 狀態篩選
	if searchOpts.Status() != "" {
		filter["status"] = searchOpts.Status()
	}

	// 計算總數
	total, err := collection.CountDocuments(c, filter)
	if err != nil {
		ctx.Error("計算醫院總數失敗", "error", err)
		return nil, convertMongoError(err)
	}

	// 設定查詢選項
	findOpts := options.Find()
	if searchOpts.Limit() > 0 {
		findOpts.SetLimit(int64(searchOpts.Limit()))
	}
	if searchOpts.Skip() > 0 {
		findOpts.SetSkip(int64(searchOpts.Skip()))
	}

	// 如果有文字搜尋，按相關性排序
	if searchOpts.Keyword() != "" {
		findOpts.SetSort(bson.D{{Key: "score", Value: bson.M{"$meta": "textScore"}}})
	}

	// 執行查詢
	cursor, err := collection.Find(c, filter, findOpts)
	if err != nil {
		ctx.Error("搜尋醫院失敗", "error", err)
		return nil, convertMongoError(err)
	}
	defer cursor.Close(c)

	var hospitals []*model.Hospital
	for cursor.Next(c) {
		var hospitalDoc hospitalMongo
		if err := cursor.Decode(&hospitalDoc); err != nil {
			ctx.Error("解碼醫院資料失敗", "error", err)
			continue
		}
		hospitals = append(hospitals, hospitalDoc.toDomain())
	}

	if err := cursor.Err(); err != nil {
		ctx.Error("遍歷醫院資料失敗", "error", err)
		return nil, convertMongoError(err)
	}

	ctx.Info("成功搜尋醫院", "total", total, "returned", len(hospitals))

	return &repository.SearchResult{
		Hospitals: hospitals,
		Total:     total,
	}, nil
}

// GetNearby 根據座標和半徑搜尋附近醫院
func (r *hospitalMongoRepo) GetNearby(c context.Context, opts ...repository.NearbyOption) ([]*model.Hospital, error) {
	ctx := contextx.WithContext(c)

	// 解析選項
	nearbyOpts := &repository.NearbyOptions{}
	for _, opt := range opts {
		opt(nearbyOpts)
	}

	ctx.Info("搜尋附近醫院",
		"lat", nearbyOpts.Coordinates().Latitude(),
		"lng", nearbyOpts.Coordinates().Longitude(),
		"radius", nearbyOpts.RadiusKm(),
		"limit", nearbyOpts.Limit())

	collection := r.db.Collection(hospitalCollection)

	// 建立地理查詢條件
	filter := bson.M{
		"location": bson.M{
			"$near": bson.M{
				"$geometry": bson.M{
					"type":        "Point",
					"coordinates": []float64{nearbyOpts.Coordinates().Longitude(), nearbyOpts.Coordinates().Latitude()},
				},
				"$maxDistance": nearbyOpts.RadiusKm() * 1000, // 轉換為公尺
			},
		},
	}

	// 設定查詢選項
	findOpts := options.Find()
	if nearbyOpts.Limit() > 0 {
		findOpts.SetLimit(int64(nearbyOpts.Limit()))
	}

	// 執行查詢
	cursor, err := collection.Find(c, filter, findOpts)
	if err != nil {
		ctx.Error("搜尋附近醫院失敗", "error", err)
		return nil, convertMongoError(err)
	}
	defer cursor.Close(c)

	var hospitals []*model.Hospital
	for cursor.Next(c) {
		var hospitalDoc hospitalMongo
		if err := cursor.Decode(&hospitalDoc); err != nil {
			ctx.Error("解碼醫院資料失敗", "error", err)
			continue
		}
		hospitals = append(hospitals, hospitalDoc.toDomain())
	}

	if err := cursor.Err(); err != nil {
		ctx.Error("遍歷醫院資料失敗", "error", err)
		return nil, convertMongoError(err)
	}

	ctx.Info("成功搜尋附近醫院", "count", len(hospitals))
	return hospitals, nil
}

// Update 更新醫院資訊
func (r *hospitalMongoRepo) Update(c context.Context, hospital *model.Hospital) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始更新醫院", "hospital_id", hospital.ID())

	objectID, err := bson.ObjectIDFromHex(hospital.ID())
	if err != nil {
		ctx.Error("無效的醫院 ID", "id", hospital.ID(), "error", err)
		return convertMongoError(err)
	}

	hospitalDoc, err := hospitalMongoFromDomain(hospital)
	if err != nil {
		ctx.Error("領域模型轉換失敗", "error", err)
		return err
	}

	// 更新時間戳記
	hospitalDoc.UpdatedAt = time.Now()

	collection := r.db.Collection(hospitalCollection)
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": hospitalDoc}

	result, err := collection.UpdateOne(c, filter, update)
	if err != nil {
		ctx.Error("更新醫院失敗", "error", err)
		return convertMongoError(err)
	}

	if result.MatchedCount == 0 {
		ctx.Error("找不到要更新的醫院", "hospital_id", hospital.ID())
		return convertMongoError(mongo.ErrNoDocuments)
	}

	ctx.Info("成功更新醫院", "hospital_id", hospital.ID())
	return nil
}

// Delete 刪除醫院
func (r *hospitalMongoRepo) Delete(c context.Context, id string) error {
	ctx := contextx.WithContext(c)
	ctx.Info("開始刪除醫院", "hospital_id", id)

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		ctx.Error("無效的醫院 ID", "id", id, "error", err)
		return convertMongoError(err)
	}

	collection := r.db.Collection(hospitalCollection)
	result, err := collection.DeleteOne(c, bson.M{"_id": objectID})
	if err != nil {
		ctx.Error("刪除醫院失敗", "error", err)
		return convertMongoError(err)
	}

	if result.DeletedCount == 0 {
		ctx.Error("找不到要刪除的醫院", "hospital_id", id)
		return convertMongoError(mongo.ErrNoDocuments)
	}

	ctx.Info("成功刪除醫院", "hospital_id", id)
	return nil
}

// CountByStatus 統計各狀態醫院數量
func (r *hospitalMongoRepo) CountByStatus(c context.Context) (map[string]int64, error) {
	ctx := contextx.WithContext(c)
	ctx.Info("統計醫院狀態分布")

	collection := r.db.Collection(hospitalCollection)

	// 使用聚合查詢統計各狀態數量
	pipeline := []bson.M{
		{
			"$group": bson.M{
				"_id":   "$status",
				"count": bson.M{"$sum": 1},
			},
		},
	}

	cursor, err := collection.Aggregate(c, pipeline)
	if err != nil {
		ctx.Error("統計醫院狀態失敗", "error", err)
		return nil, convertMongoError(err)
	}
	defer cursor.Close(c)

	result := make(map[string]int64)
	for cursor.Next(c) {
		var doc struct {
			ID    string `bson:"_id"`
			Count int64  `bson:"count"`
		}
		if err := cursor.Decode(&doc); err != nil {
			ctx.Error("解碼統計資料失敗", "error", err)
			continue
		}
		result[doc.ID] = doc.Count
	}

	if err := cursor.Err(); err != nil {
		ctx.Error("遍歷統計資料失敗", "error", err)
		return nil, convertMongoError(err)
	}

	ctx.Info("成功統計醫院狀態分布", "status_counts", result)
	return result, nil
}

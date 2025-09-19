package mongodb

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain"
	"github.com/blackhorseya/petlog/internal/domain/model"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// coordinatesMongo 是地理座標的持久化模型，支援 MongoDB 的 2dsphere 索引
type coordinatesMongo struct {
	Type        string    `bson:"type"`        // GeoJSON 類型，固定為 "Point"
	Coordinates []float64 `bson:"coordinates"` // [longitude, latitude] 順序（GeoJSON 標準）
}

// hospitalMongo 是 Hospital 的持久化模型，包含 DB 專用的標籤
type hospitalMongo struct {
	ID           bson.ObjectID    `bson:"_id,omitempty"`
	Name         string           `bson:"name"`
	Address      string           `bson:"address"`
	Phone        string           `bson:"phone"`
	County       string           `bson:"county"`
	Veterinarian string           `bson:"veterinarian"`
	LicenseType  string           `bson:"license_type"`
	LicenseNo    string           `bson:"license_no"`
	Status       string           `bson:"status"`
	IssuedDate   string           `bson:"issued_date"`
	Location     coordinatesMongo `bson:"location"` // 使用 GeoJSON Point 格式
	CreatedAt    time.Time        `bson:"created_at"`
	UpdatedAt    time.Time        `bson:"updated_at"`
}

// toDomain 將持久化模型 (hospitalMongo) 轉換為領域模型 (model.Hospital)
func (hm *hospitalMongo) toDomain() *model.Hospital {
	if hm == nil {
		return nil
	}

	// 轉換座標格式：GeoJSON [lng, lat] -> Coordinates{lat, lng}
	var coords model.Coordinates
	if len(hm.Location.Coordinates) == 2 {
		coords = model.NewCoordinates(
			hm.Location.Coordinates[1], // latitude
			hm.Location.Coordinates[0], // longitude
		)
	}

	hospital := model.NewHospital(
		hm.Name,
		hm.Address,
		hm.Phone,
		hm.County,
		hm.Veterinarian,
		hm.LicenseType,
		hm.LicenseNo,
		hm.Status,
		model.WithCoordinates(coords),
		model.WithIssuedDate(hm.IssuedDate),
	)

	// 設定 ID 和時間戳
	hospital.SetID(hm.ID.Hex())

	return hospital
}

// hospitalMongoFromDomain 將領域模型 (model.Hospital) 轉換為持久化模型 (hospitalMongo)
func hospitalMongoFromDomain(h *model.Hospital) (*hospitalMongo, error) {
	if h == nil {
		return nil, nil
	}

	var objectID bson.ObjectID
	var err error

	// 只有在 ID 非空時才嘗試轉換
	if h.ID() != "" {
		objectID, err = bson.ObjectIDFromHex(h.ID())
		if err != nil {
			return nil, domain.ErrInvalidID
		}
	}

	// 轉換座標格式：Coordinates{lat, lng} -> GeoJSON [lng, lat]
	location := coordinatesMongo{
		Type:        "Point",
		Coordinates: []float64{h.Coordinates().Longitude(), h.Coordinates().Latitude()},
	}

	return &hospitalMongo{
		ID:           objectID,
		Name:         h.Name(),
		Address:      h.Address(),
		Phone:        h.Phone(),
		County:       h.County(),
		Veterinarian: h.Veterinarian(),
		LicenseType:  h.LicenseType(),
		LicenseNo:    h.LicenseNo(),
		Status:       h.Status(),
		IssuedDate:   h.IssuedDate(),
		Location:     location,
		CreatedAt:    h.CreatedAt(),
		UpdatedAt:    h.UpdatedAt(),
	}, nil
}

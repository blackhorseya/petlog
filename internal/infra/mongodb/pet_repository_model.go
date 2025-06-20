package mongodb

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain"
	"github.com/blackhorseya/petlog/internal/domain/model"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// petMongo 是 Pet 的持久化模型，包含 DB 專用的標籤。
// 特別注意 ID 欄位使用 bson.ObjectID。
type petMongo struct {
	ID          bson.ObjectID `bson:"_id,omitempty"`
	OwnerID     string        `bson:"owner_id"`
	Name        string        `bson:"name"`
	AvatarURL   string        `bson:"avatar_url,omitempty"`
	DOB         time.Time     `bson:"dob,omitempty"`
	Breed       string        `bson:"breed,omitempty"`
	MicrochipID string        `bson:"microchip_id,omitempty"`
	CreatedAt   time.Time     `bson:"created_at"`
	UpdatedAt   time.Time     `bson:"updated_at"`
}

// toDomain 將持久化模型 (petMongo) 轉換為領域模型 (model.Pet)。
// 在這個過程中，它會將 bson.ObjectID 轉換為 string。
func (pm *petMongo) toDomain() *model.Pet {
	if pm == nil {
		return nil
	}

	return &model.Pet{
		ID:          pm.ID.Hex(),
		OwnerID:     pm.OwnerID,
		Name:        pm.Name,
		AvatarURL:   pm.AvatarURL,
		DOB:         pm.DOB,
		Breed:       pm.Breed,
		MicrochipID: pm.MicrochipID,
		CreatedAt:   pm.CreatedAt,
		UpdatedAt:   pm.UpdatedAt,
	}
}

// fromDomain 將領域模型 (model.Pet) 轉換為持久化模型 (petMongo)。
// 這個函式處理 ID 的轉換，從 string 到 bson.ObjectID。
// 如果傳入的 ID 字串是空的，它會被當作一個新的物件，ID 欄位會是零值 ObjectID。
// 如果 ID 字串無效，它會返回一個錯誤。
func fromDomain(p *model.Pet) (*petMongo, error) {
	if p == nil {
		return nil, nil
	}

	var objectID bson.ObjectID
	var err error

	// 只有在 ID 非空時才嘗試轉換，這通常發生在更新操作。
	// 對於創建操作，p.ID 會是空的，objectID 會是零值，MongoDB 會自動生成新的 ID。
	if p.ID != "" {
		objectID, err = bson.ObjectIDFromHex(p.ID)
		if err != nil {
			// 返回在 domain 層定義的標準錯誤
			return nil, domain.ErrInvalidID
		}
	}

	return &petMongo{
		ID:          objectID,
		OwnerID:     p.OwnerID,
		Name:        p.Name,
		AvatarURL:   p.AvatarURL,
		DOB:         p.DOB,
		Breed:       p.Breed,
		MicrochipID: p.MicrochipID,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}, nil
}

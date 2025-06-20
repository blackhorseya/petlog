package mongodb

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// petMongo 是 Pet 的持久化模型，包含 DB 專用的標籤。
type petMongo struct {
	ID          string    `bson:"_id,omitempty"`
	OwnerID     string    `bson:"owner_id"`
	Name        string    `bson:"name"`
	AvatarURL   string    `bson:"avatar_url,omitempty"`
	DOB         time.Time `bson:"dob,omitempty"`
	Breed       string    `bson:"breed,omitempty"`
	MicrochipID string    `bson:"microchip_id,omitempty"`
	CreatedAt   time.Time `bson:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at"`
}

// toDomain 將持久化模型轉換為領域模型。
func (pm *petMongo) toDomain() *model.Pet {
	return &model.Pet{
		ID:          pm.ID,
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

// fromDomain 將領域模型轉換為持久化模型。
func fromDomain(p *model.Pet) *petMongo {
	return &petMongo{
		ID:          p.ID,
		OwnerID:     p.OwnerID,
		Name:        p.Name,
		AvatarURL:   p.AvatarURL,
		DOB:         p.DOB,
		Breed:       p.Breed,
		MicrochipID: p.MicrochipID,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

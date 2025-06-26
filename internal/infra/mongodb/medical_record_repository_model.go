package mongodb

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain"
	"github.com/blackhorseya/petlog/internal/domain/model"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// medicalRecordMongo 是 MedicalRecord 的持久化模型，包含 DB 專用的標籤。
type medicalRecordMongo struct {
	ID          bson.ObjectID `bson:"_id,omitempty"`
	PetID       string        `bson:"pet_id"`
	Type        string        `bson:"type"`
	Description string        `bson:"description"`
	Date        time.Time     `bson:"date"`
	NextDueDate *time.Time    `bson:"next_due_date,omitempty"`
	Dosage      string        `bson:"dosage,omitempty"`
	CreatedAt   time.Time     `bson:"created_at"`
	UpdatedAt   time.Time     `bson:"updated_at"`
}

// toDomain 將持久化模型 (medicalRecordMongo) 轉換為領域模型 (model.MedicalRecord)。
func (m *medicalRecordMongo) toDomain() *model.MedicalRecord {
	if m == nil {
		return nil
	}
	return &model.MedicalRecord{
		ID:          m.ID.Hex(),
		PetID:       m.PetID,
		Type:        model.MedicalRecordType(m.Type),
		Description: m.Description,
		Date:        m.Date,
		NextDueDate: m.NextDueDate,
		Dosage:      m.Dosage,
	}
}

// medicalRecordMongoFromDomain 將領域模型 (model.MedicalRecord) 轉換為持久化模型 (medicalRecordMongo)。
func medicalRecordMongoFromDomain(m *model.MedicalRecord) (*medicalRecordMongo, error) {
	if m == nil {
		return nil, nil
	}

	var objectID bson.ObjectID
	var err error
	if m.ID != "" {
		objectID, err = bson.ObjectIDFromHex(m.ID)
		if err != nil {
			return nil, domain.ErrInvalidID
		}
	}

	return &medicalRecordMongo{
		ID:          objectID,
		PetID:       m.PetID,
		Type:        string(m.Type),
		Description: m.Description,
		Date:        m.Date,
		NextDueDate: m.NextDueDate,
		Dosage:      m.Dosage,
	}, nil
}

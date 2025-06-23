package mongodb

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain"
	"github.com/blackhorseya/petlog/internal/domain/model"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// healthLogMongo is the persistence model for HealthLog, containing DB-specific tags.
type healthLogMongo struct {
	ID             bson.ObjectID `bson:"_id,omitempty"`
	PetID          string        `bson:"pet_id"`
	Date           time.Time     `bson:"date"`
	WeightKg       float64       `bson:"weight_kg,omitempty"`
	FoodGram       int           `bson:"food_gram,omitempty"`
	LitterNotes    string        `bson:"litter_notes,omitempty"`
	BehaviourNotes string        `bson:"behaviour_notes,omitempty"`
	CreatedAt      time.Time     `bson:"created_at"`
	UpdatedAt      time.Time     `bson:"updated_at"`
}

// toDomain converts the persistence model to a domain model.
func (h *healthLogMongo) toDomain() *model.HealthLog {
	if h == nil {
		return nil
	}

	return &model.HealthLog{
		ID:             h.ID.Hex(),
		PetID:          h.PetID,
		Date:           h.Date,
		WeightKg:       h.WeightKg,
		FoodGram:       h.FoodGram,
		LitterNotes:    h.LitterNotes,
		BehaviourNotes: h.BehaviourNotes,
	}
}

// healthLogMongoFromDomain converts a domain model to a persistence model.
func healthLogMongoFromDomain(h *model.HealthLog) (*healthLogMongo, error) {
	if h == nil {
		return nil, nil
	}

	var objectID bson.ObjectID
	var err error

	if h.ID != "" {
		objectID, err = bson.ObjectIDFromHex(h.ID)
		if err != nil {
			return nil, domain.ErrInvalidID
		}
	}

	return &healthLogMongo{
		ID:             objectID,
		PetID:          h.PetID,
		Date:           h.Date,
		WeightKg:       h.WeightKg,
		FoodGram:       h.FoodGram,
		LitterNotes:    h.LitterNotes,
		BehaviourNotes: h.BehaviourNotes,
	}, nil
}

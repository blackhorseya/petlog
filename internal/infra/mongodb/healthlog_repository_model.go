package mongodb

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// healthLogMongo is the persistence model for HealthLog, containing DB-specific tags.
type healthLogMongo struct {
	ID             string    `bson:"_id,omitempty"`
	PetID          string    `bson:"pet_id"`
	Date           time.Time `bson:"date"`
	WeightKg       float64   `bson:"weight_kg,omitempty"`
	FoodGram       int       `bson:"food_gram,omitempty"`
	LitterNotes    string    `bson:"litter_notes,omitempty"`
	BehaviourNotes string    `bson:"behaviour_notes,omitempty"`
	CreatedAt      time.Time `bson:"created_at"`
	UpdatedAt      time.Time `bson:"updated_at"`
}

// toDomain converts the persistence model to a domain model.
func (h *healthLogMongo) toDomain() *model.HealthLog {
	return &model.HealthLog{
		ID:             h.ID,
		PetID:          h.PetID,
		Date:           h.Date,
		WeightKg:       h.WeightKg,
		FoodGram:       h.FoodGram,
		LitterNotes:    h.LitterNotes,
		BehaviourNotes: h.BehaviourNotes,
		// Note: CreatedAt and UpdatedAt are not part of the core domain model
		// but are handled by the repository layer.
	}
}

// healthLogMongoFromDomain converts a domain model to a persistence model.
func healthLogMongoFromDomain(h *model.HealthLog) *healthLogMongo {
	return &healthLogMongo{
		ID:             h.ID,
		PetID:          h.PetID,
		Date:           h.Date,
		WeightKg:       h.WeightKg,
		FoodGram:       h.FoodGram,
		LitterNotes:    h.LitterNotes,
		BehaviourNotes: h.BehaviourNotes,
	}
}

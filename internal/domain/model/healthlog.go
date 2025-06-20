package model

import "time"

// HealthLog represents a daily health log for a pet. It is a pure domain entity.
type HealthLog struct {
	ID             string    `json:"id"`
	PetID          string    `json:"pet_id"`
	Date           time.Time `json:"date"`
	WeightKg       float64   `json:"weight_kg"`
	FoodGram       int       `json:"food_gram"`
	LitterNotes    string    `json:"litter_notes"`
	BehaviourNotes string    `json:"behaviour_notes"`
}

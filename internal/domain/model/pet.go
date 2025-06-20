package model

import "time"

// Pet represents a pet profile. It is a pure domain entity.
type Pet struct {
	ID          string    `json:"id"`
	OwnerID     string    `json:"owner_id"`
	Name        string    `json:"name"`
	AvatarURL   string    `json:"avatar_url"`
	DOB         time.Time `json:"dob"`
	Breed       string    `json:"breed"`
	MicrochipID string    `json:"microchip_id"`
}

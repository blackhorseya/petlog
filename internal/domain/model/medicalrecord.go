package model

import "time"

// MedicalRecordType defines the type of medical record.
type MedicalRecordType string

const (
	RecordTypeVaccination MedicalRecordType = "vaccination"
	RecordTypeDeworming   MedicalRecordType = "deworming"
	RecordTypeMedication  MedicalRecordType = "medication"
	RecordTypeVetVisit    MedicalRecordType = "vet_visit"
	RecordTypeOther       MedicalRecordType = "other"
)

// MedicalRecord represents a medical record for a pet. It is a pure domain entity.
type MedicalRecord struct {
	ID          string            `json:"id"`
	PetID       string            `json:"pet_id"`
	Type        MedicalRecordType `json:"type"`
	Description string            `json:"description"`
	Date        time.Time         `json:"date"`
	NextDueDate *time.Time        `json:"next_due_date,omitempty"`
	Dosage      string            `json:"dosage,omitempty"`
}

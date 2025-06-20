//go:generate mockgen -destination=./mock_${GOFILE} -package=${GOPACKAGE} -source=${GOFILE}

package repository

import (
	"context"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// MedicalRecordRepository defines the interface for medical record data persistence.
type MedicalRecordRepository interface {
	Create(c context.Context, record *model.MedicalRecord) error
	FindByID(c context.Context, id string) (*model.MedicalRecord, error)
	FindByPetID(c context.Context, petID string, startDate, endDate time.Time) ([]*model.MedicalRecord, error)
	Update(c context.Context, record *model.MedicalRecord) error
	Delete(c context.Context, id string) error
}

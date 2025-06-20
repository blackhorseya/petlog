//go:generate mockgen -destination=./mock_${GOFILE} -package=${GOPACKAGE} -source=${GOFILE}

package repository

import (
	"context"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// HealthLogRepository defines the interface for health log data persistence.
type HealthLogRepository interface {
	Create(c context.Context, log *model.HealthLog) error
	FindByID(c context.Context, id string) (*model.HealthLog, error)
	FindByPetID(c context.Context, petID string, startDate, endDate time.Time) ([]*model.HealthLog, error)
	Update(c context.Context, log *model.HealthLog) error
	Delete(c context.Context, id string) error
}

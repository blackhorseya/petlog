//go:generate go tool mockgen -destination=./mock_${GOFILE} -package=${GOPACKAGE} -source=${GOFILE}

package repository

import (
	"context"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// PetRepository defines the interface for pet data persistence.
type PetRepository interface {
	Create(c context.Context, pet *model.Pet) error
	FindByID(c context.Context, id string) (*model.Pet, error)
	FindByOwnerID(c context.Context, ownerID string) ([]*model.Pet, error)
	FindIDsByOwnerID(c context.Context, ownerID string) ([]string, error)
	Update(c context.Context, pet *model.Pet) error
	Delete(c context.Context, id string) error
}

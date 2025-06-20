package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// GetPetByIDQuery represents the request for getting a pet by ID.
type GetPetByIDQuery struct {
	ID string
}

// GetPetByIDHandler handles the get pet by ID query.
type GetPetByIDHandler struct {
	petRepo repository.PetRepository
}

// NewGetPetByIDHandler creates a new GetPetByIDHandler.
func NewGetPetByIDHandler(petRepo repository.PetRepository) *GetPetByIDHandler {
	if petRepo == nil {
		panic("petRepo is required")
	}
	return &GetPetByIDHandler{
		petRepo: petRepo,
	}
}

// Handle executes the get pet by ID query.
func (h *GetPetByIDHandler) Handle(c context.Context, qry GetPetByIDQuery) (*model.Pet, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return nil, fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("handling get pet by id request", "user_id", userID, "pet_id", qry.ID)

	pet, err := h.petRepo.FindByID(ctx, qry.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to find pet with id %s: %w", qry.ID, err)
	}

	// Authorization check
	if pet.OwnerID != userID {
		return nil, fmt.Errorf("user %s is not authorized to view pet %s", userID, qry.ID)
	}

	return pet, nil
}

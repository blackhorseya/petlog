package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// GetPetByIDRequest represents the request for getting a pet by ID.
type GetPetByIDRequest struct {
	ID string
}

// GetPetByIDResponse represents the response for getting a pet by ID.
type GetPetByIDResponse struct {
	*model.Pet
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
func (h *GetPetByIDHandler) Handle(c context.Context, req GetPetByIDRequest) (*GetPetByIDResponse, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(c)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	ctx.Info("handling get pet by id request", "user_id", userID, "pet_id", req.ID)

	pet, err := h.petRepo.FindByID(c, req.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to find pet with id %s: %w", req.ID, err)
	}

	// Authorization check
	if pet.OwnerID != userID {
		return nil, fmt.Errorf("user %s is not authorized to view pet %s", userID, req.ID)
	}

	return &GetPetByIDResponse{Pet: pet}, nil
}

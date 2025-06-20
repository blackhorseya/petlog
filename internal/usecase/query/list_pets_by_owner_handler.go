package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// ListPetsByOwnerRequest represents the request for listing pets by owner.
type ListPetsByOwnerRequest struct {
	// Pagination fields can be added here, e.g., Page, PageSize
}

// ListPetsByOwnerResponse represents the response for listing pets by owner.
type ListPetsByOwnerResponse struct {
	Pets []*model.Pet
}

// ListPetsByOwnerHandler handles the list pets by owner query.
type ListPetsByOwnerHandler struct {
	petRepo repository.PetRepository
}

// NewListPetsByOwnerHandler creates a new ListPetsByOwnerHandler.
func NewListPetsByOwnerHandler(petRepo repository.PetRepository) *ListPetsByOwnerHandler {
	if petRepo == nil {
		panic("petRepo is required")
	}
	return &ListPetsByOwnerHandler{
		petRepo: petRepo,
	}
}

// Handle executes the list pets by owner query.
func (h *ListPetsByOwnerHandler) Handle(c context.Context, req ListPetsByOwnerRequest) (*ListPetsByOwnerResponse, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(c)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	ctx.Info("handling list pets by owner request", "user_id", userID)

	pets, err := h.petRepo.FindByOwnerID(c, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to find pets for owner %s: %w", userID, err)
	}

	return &ListPetsByOwnerResponse{Pets: pets}, nil
}

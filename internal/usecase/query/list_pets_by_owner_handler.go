package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// ListPetsByOwnerQuery represents the request for listing pets by owner.
type ListPetsByOwnerQuery struct {
	// Pagination fields can be added here, e.g., Page, PageSize
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
func (h *ListPetsByOwnerHandler) Handle(c context.Context, qry ListPetsByOwnerQuery) ([]*model.Pet, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return nil, fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("handling list pets by owner request", "user_id", userID)

	pets, err := h.petRepo.FindByOwnerID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to find pets for owner %s: %w", userID, err)
	}

	return pets, nil
}

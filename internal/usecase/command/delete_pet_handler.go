package command

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// DeletePetRequest represents the request for deleting a pet.
type DeletePetRequest struct {
	ID string
}

// DeletePetResponse represents the response for deleting a pet.
type DeletePetResponse struct {
	Success bool
}

// DeletePetHandler handles the pet deletion command.
type DeletePetHandler struct {
	petRepo repository.PetRepository
}

// NewDeletePetHandler creates a new DeletePetHandler.
func NewDeletePetHandler(petRepo repository.PetRepository) *DeletePetHandler {
	if petRepo == nil {
		panic("petRepo is required")
	}
	return &DeletePetHandler{
		petRepo: petRepo,
	}
}

// Handle executes the delete pet command.
func (h *DeletePetHandler) Handle(c context.Context, req DeletePetRequest) (*DeletePetResponse, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(c)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	ctx.Info("handling delete pet request", "user_id", userID, "pet_id", req.ID)

	// Fetch existing pet to check for ownership
	pet, err := h.petRepo.FindByID(c, req.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to find pet with id %s: %w", req.ID, err)
	}

	// Authorization check
	if pet.OwnerID != userID {
		return nil, fmt.Errorf("user %s is not authorized to delete pet %s", userID, req.ID)
	}

	if err := h.petRepo.Delete(c, req.ID); err != nil {
		ctx.Error("failed to delete pet from repository", "error", err)
		return nil, fmt.Errorf("failed to delete pet: %w", err)
	}

	ctx.Info("pet deleted successfully", "pet_id", req.ID, "user_id", userID)

	return &DeletePetResponse{Success: true}, nil
}

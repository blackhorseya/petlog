package command

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// DeletePetCommand represents the request for deleting a pet.
type DeletePetCommand struct {
	ID string
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
func (h *DeletePetHandler) Handle(c context.Context, cmd DeletePetCommand) error {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("handling delete pet request", "user_id", userID, "pet_id", cmd.ID)

	// Fetch existing pet to check for ownership
	pet, err := h.petRepo.FindByID(ctx, cmd.ID)
	if err != nil {
		return fmt.Errorf("failed to find pet with id %s: %w", cmd.ID, err)
	}

	// Authorization check
	if pet.OwnerID != userID {
		return fmt.Errorf("user %s is not authorized to delete pet %s", userID, cmd.ID)
	}

	if err := h.petRepo.Delete(ctx, cmd.ID); err != nil {
		ctx.Error("failed to delete pet from repository", "error", err)
		return fmt.Errorf("failed to delete pet: %w", err)
	}

	ctx.Info("pet deleted successfully", "pet_id", cmd.ID, "user_id", userID)

	return nil
}

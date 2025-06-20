package command

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/internal/usecase/behavior"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// UpdatePetCommand represents the request for updating a pet.
type UpdatePetCommand struct {
	ID          string
	Name        string    `json:"name"`
	AvatarURL   string    `json:"avatar_url"`
	DOB         time.Time `json:"dob"`
	Breed       string    `json:"breed"`
	MicrochipID string    `json:"microchip_id"`
}

// UpdatePetHandler handles the pet update command.
type UpdatePetHandler struct {
	petRepo repository.PetRepository
}

// NewUpdatePetHandler creates a new UpdatePetHandler.
func NewUpdatePetHandler(petRepo repository.PetRepository) *UpdatePetHandler {
	if petRepo == nil {
		panic("petRepo is required")
	}
	return &UpdatePetHandler{
		petRepo: petRepo,
	}
}

// Handle executes the update pet command.
func (h *UpdatePetHandler) Handle(c context.Context, cmd UpdatePetCommand) error {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("handling update pet request", "user_id", userID, "pet_id", cmd.ID)

	// Fetch existing pet
	pet, err := h.petRepo.FindByID(ctx, cmd.ID)
	if err != nil {
		return fmt.Errorf("failed to find pet with id %s: %w", cmd.ID, err)
	}

	// Authorization check
	if pet.OwnerID != userID {
		return fmt.Errorf("user %s is not authorized to update pet %s", userID, cmd.ID)
	}

	// Update fields
	pet.Name = cmd.Name
	pet.AvatarURL = cmd.AvatarURL
	pet.DOB = cmd.DOB
	pet.Breed = cmd.Breed
	pet.MicrochipID = cmd.MicrochipID

	if err := behavior.ValidatePet(pet); err != nil {
		return fmt.Errorf("pet validation failed: %w", err)
	}

	if err := h.petRepo.Update(ctx, pet); err != nil {
		ctx.Error("failed to update pet in repository", "error", err)
		return fmt.Errorf("failed to update pet: %w", err)
	}

	ctx.Info("pet updated successfully", "pet_id", pet.ID, "user_id", userID)

	return nil
}

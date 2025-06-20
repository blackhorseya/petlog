package command

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/internal/usecase/behavior"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// CreatePetCommand represents the request for creating a pet.
type CreatePetCommand struct {
	Name        string    `json:"name"`
	AvatarURL   string    `json:"avatar_url"`
	DOB         time.Time `json:"dob"`
	Breed       string    `json:"breed"`
	MicrochipID string    `json:"microchip_id"`
}

// CreatePetHandler handles the pet creation command.
type CreatePetHandler struct {
	petRepo repository.PetRepository
}

// NewCreatePetHandler creates a new CreatePetHandler.
func NewCreatePetHandler(petRepo repository.PetRepository) *CreatePetHandler {
	if petRepo == nil {
		panic("petRepo is required")
	}
	return &CreatePetHandler{
		petRepo: petRepo,
	}
}

// Handle executes the create pet command.
func (h *CreatePetHandler) Handle(c context.Context, cmd CreatePetCommand) (*model.Pet, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return nil, fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("handling create pet request", "user_id", userID, "pet_name", cmd.Name)

	pet := &model.Pet{
		OwnerID:     userID,
		Name:        cmd.Name,
		AvatarURL:   cmd.AvatarURL,
		DOB:         cmd.DOB,
		Breed:       cmd.Breed,
		MicrochipID: cmd.MicrochipID,
	}

	if err := behavior.ValidatePet(pet); err != nil {
		return nil, fmt.Errorf("pet validation failed: %w", err)
	}

	if err := h.petRepo.Create(ctx, pet); err != nil {
		ctx.Error("failed to create pet in repository", "error", err)
		return nil, fmt.Errorf("failed to create pet: %w", err)
	}

	ctx.Info("pet created successfully", "pet_id", pet.ID, "user_id", userID)

	return pet, nil
}

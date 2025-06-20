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

// UpdatePetRequest represents the request for updating a pet.
type UpdatePetRequest struct {
	ID          string
	Name        string    `json:"name"`
	AvatarURL   string    `json:"avatar_url"`
	DOB         time.Time `json:"dob"`
	Breed       string    `json:"breed"`
	MicrochipID string    `json:"microchip_id"`
}

// UpdatePetResponse represents the response for updating a pet.
type UpdatePetResponse struct {
	*model.Pet
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
func (h *UpdatePetHandler) Handle(c context.Context, req UpdatePetRequest) (*UpdatePetResponse, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(c)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	ctx.Info("handling update pet request", "user_id", userID, "pet_id", req.ID)

	// Fetch existing pet
	pet, err := h.petRepo.FindByID(c, req.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to find pet with id %s: %w", req.ID, err)
	}

	// Authorization check
	if pet.OwnerID != userID {
		return nil, fmt.Errorf("user %s is not authorized to update pet %s", userID, req.ID)
	}

	// Update fields
	pet.Name = req.Name
	pet.AvatarURL = req.AvatarURL
	pet.DOB = req.DOB
	pet.Breed = req.Breed
	pet.MicrochipID = req.MicrochipID

	if err := behavior.ValidatePet(pet); err != nil {
		return nil, fmt.Errorf("pet validation failed: %w", err)
	}

	if err := h.petRepo.Update(c, pet); err != nil {
		ctx.Error("failed to update pet in repository", "error", err)
		return nil, fmt.Errorf("failed to update pet: %w", err)
	}

	ctx.Info("pet updated successfully", "pet_id", pet.ID, "user_id", userID)

	return &UpdatePetResponse{Pet: pet}, nil
}

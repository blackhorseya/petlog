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

// CreatePetRequest represents the request for creating a pet.
type CreatePetRequest struct {
	Name        string    `json:"name"`
	AvatarURL   string    `json:"avatar_url"`
	DOB         time.Time `json:"dob"`
	Breed       string    `json:"breed"`
	MicrochipID string    `json:"microchip_id"`
}

// CreatePetResponse represents the response for creating a pet.
type CreatePetResponse struct {
	*model.Pet
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
func (h *CreatePetHandler) Handle(c context.Context, req CreatePetRequest) (*CreatePetResponse, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(c)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	ctx.Info("handling create pet request", "user_id", userID, "pet_name", req.Name)

	pet := &model.Pet{
		OwnerID:     userID,
		Name:        req.Name,
		AvatarURL:   req.AvatarURL,
		DOB:         req.DOB,
		Breed:       req.Breed,
		MicrochipID: req.MicrochipID,
	}

	if err := behavior.ValidatePet(pet); err != nil {
		return nil, fmt.Errorf("pet validation failed: %w", err)
	}

	if err := h.petRepo.Create(c, pet); err != nil {
		ctx.Error("failed to create pet in repository", "error", err)
		return nil, fmt.Errorf("failed to create pet: %w", err)
	}

	ctx.Info("pet created successfully", "pet_id", pet.ID, "user_id", userID)

	return &CreatePetResponse{Pet: pet}, nil
}

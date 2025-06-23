package command

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// CreateHealthLogCommand represents the request for creating a health log.
type CreateHealthLogCommand struct {
	PetID          string    `json:"pet_id"`
	Date           time.Time `json:"date"`
	WeightKg       float64   `json:"weight_kg,omitempty"`
	FoodGram       int       `json:"food_gram,omitempty"`
	LitterNotes    string    `json:"litter_notes,omitempty"`
	BehaviourNotes string    `json:"behaviour_notes,omitempty"`
}

// CreateHealthLogHandler handles the health log creation command.
type CreateHealthLogHandler struct {
	healthLogRepo repository.HealthLogRepository
}

// NewCreateHealthLogHandler creates a new CreateHealthLogHandler.
func NewCreateHealthLogHandler(healthLogRepo repository.HealthLogRepository) *CreateHealthLogHandler {
	if healthLogRepo == nil {
		panic("healthLogRepo is required")
	}
	return &CreateHealthLogHandler{
		healthLogRepo: healthLogRepo,
	}
}

// Handle executes the create health log command.
func (h *CreateHealthLogHandler) Handle(c context.Context, cmd CreateHealthLogCommand) (*model.HealthLog, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return nil, fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("handling create health log request", "user_id", userID, "pet_id", cmd.PetID)

	// Here you might want to add a validation step to ensure the user owns the pet.
	// This would involve the PetRepository. For now, we'll skip this to keep it simple.

	log := &model.HealthLog{
		PetID:          cmd.PetID,
		Date:           cmd.Date,
		WeightKg:       cmd.WeightKg,
		FoodGram:       cmd.FoodGram,
		LitterNotes:    cmd.LitterNotes,
		BehaviourNotes: cmd.BehaviourNotes,
	}

	if err := h.healthLogRepo.Create(ctx, log); err != nil {
		ctx.Error("failed to create health log in repository", "error", err)
		return nil, fmt.Errorf("failed to create health log: %w", err)
	}

	ctx.Info("health log created successfully", "log_id", log.ID, "pet_id", log.PetID)

	return log, nil
}

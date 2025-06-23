package endpoint

import (
	"context"
	"time"

	"github.com/go-kit/kit/endpoint"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/usecase/command"
)

// CreateHealthLogRequest defines the request structure for creating a health log.
type CreateHealthLogRequest struct {
	PetID          string    `json:"pet_id"`
	Date           time.Time `json:"date"`
	WeightKg       float64   `json:"weight_kg,omitempty"`
	FoodGram       int       `json:"food_gram,omitempty"`
	LitterNotes    string    `json:"litter_notes,omitempty"`
	BehaviourNotes string    `json:"behaviour_notes,omitempty"`
}

// CreateHealthLogResponse defines the response structure for the create health log endpoint.
type CreateHealthLogResponse struct {
	HealthLog *model.HealthLog `json:"health_log"`
	Err       error            `json:"error,omitempty"`
}

// MakeCreateHealthLogEndpoint creates an endpoint for the create health log handler.
func MakeCreateHealthLogEndpoint(ch *command.CreateHealthLogHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(CreateHealthLogRequest)

		cmd := command.CreateHealthLogCommand{
			PetID:          req.PetID,
			Date:           req.Date,
			WeightKg:       req.WeightKg,
			FoodGram:       req.FoodGram,
			LitterNotes:    req.LitterNotes,
			BehaviourNotes: req.BehaviourNotes,
		}

		log, err := ch.Handle(c, cmd)
		if err != nil {
			return CreateHealthLogResponse{Err: err}, nil
		}

		return CreateHealthLogResponse{HealthLog: log}, nil
	}
}

// NewHealthLogEndpoints is a provider for the HealthLogEndpoints struct.
func NewHealthLogEndpoints(createHealthLog endpoint.Endpoint) HealthLogEndpoints {
	return HealthLogEndpoints{
		CreateHealthLogEndpoint: createHealthLog,
	}
}

// HealthLogEndpoints collects all the endpoints that compose a health log service.
type HealthLogEndpoints struct {
	CreateHealthLogEndpoint endpoint.Endpoint
	// Other endpoints for Get, List, Update, Delete will go here.
}

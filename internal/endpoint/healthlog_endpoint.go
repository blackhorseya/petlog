package endpoint

import (
	"context"
	"time"

	"github.com/go-kit/kit/endpoint"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/usecase/command"
	"github.com/blackhorseya/petlog/internal/usecase/query"
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

func (r CreateHealthLogResponse) Failed() error { return r.Err }

// GetHealthLogByIDRequest defines the request structure for getting a health log by ID.
type GetHealthLogByIDRequest struct {
	ID string `json:"id"`
}

// GetHealthLogByIDResponse defines the response structure for the get health log by ID endpoint.
type GetHealthLogByIDResponse struct {
	HealthLog *model.HealthLog `json:"health_log"`
	Err       error            `json:"error,omitempty"`
}

func (r GetHealthLogByIDResponse) Failed() error { return r.Err }

// ListHealthLogsByPetRequest defines the request structure for listing health logs by pet.
type ListHealthLogsByPetRequest struct {
	PetID     string    `json:"pet_id"`
	StartDate time.Time `json:"start_date,omitempty"`
	EndDate   time.Time `json:"end_date,omitempty"`
}

// ListHealthLogsByPetResponse defines the response structure for the list health logs by pet endpoint.
type ListHealthLogsByPetResponse struct {
	HealthLogs []*model.HealthLog `json:"health_logs"`
	Err        error              `json:"error,omitempty"`
}

func (r ListHealthLogsByPetResponse) Failed() error { return r.Err }

// UpdateHealthLogRequest defines the request structure for updating a health log.
type UpdateHealthLogRequest struct {
	ID             string    `json:"id"`
	PetID          string    `json:"pet_id"`
	Date           time.Time `json:"date"`
	WeightKg       float64   `json:"weight_kg,omitempty"`
	FoodGram       int       `json:"food_gram,omitempty"`
	LitterNotes    string    `json:"litter_notes,omitempty"`
	BehaviourNotes string    `json:"behaviour_notes,omitempty"`
}

// UpdateHealthLogResponse defines the response structure for the update health log endpoint.
type UpdateHealthLogResponse struct {
	HealthLog *model.HealthLog `json:"health_log"`
	Err       error            `json:"error,omitempty"`
}

func (r UpdateHealthLogResponse) Failed() error { return r.Err }

// DeleteHealthLogRequest defines the request structure for deleting a health log.
type DeleteHealthLogRequest struct {
	ID string `json:"id"`
}

// DeleteHealthLogResponse defines the response structure for the delete health log endpoint.
type DeleteHealthLogResponse struct {
	Success bool  `json:"success"`
	Err     error `json:"error,omitempty"`
}

func (r DeleteHealthLogResponse) Failed() error { return r.Err }

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

// MakeGetHealthLogByIDEndpoint creates an endpoint for the get health log by ID handler.
func MakeGetHealthLogByIDEndpoint(qh *query.GetHealthLogByIDHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(GetHealthLogByIDRequest)

		q := query.GetHealthLogByIDQuery{
			ID: req.ID,
		}

		log, err := qh.Handle(c, q)
		if err != nil {
			return GetHealthLogByIDResponse{Err: err}, nil
		}

		return GetHealthLogByIDResponse{HealthLog: log}, nil
	}
}

// MakeListHealthLogsByPetEndpoint creates an endpoint for the list health logs by pet handler.
func MakeListHealthLogsByPetEndpoint(qh *query.ListHealthLogsByPetHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(ListHealthLogsByPetRequest)

		q := query.ListHealthLogsByPetQuery{
			PetID:     req.PetID,
			StartDate: req.StartDate,
			EndDate:   req.EndDate,
		}

		logs, err := qh.Handle(c, q)
		if err != nil {
			return ListHealthLogsByPetResponse{Err: err}, nil
		}

		return ListHealthLogsByPetResponse{HealthLogs: logs}, nil
	}
}

// MakeUpdateHealthLogEndpoint creates an endpoint for the update health log handler.
func MakeUpdateHealthLogEndpoint(ch *command.UpdateHealthLogHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(UpdateHealthLogRequest)

		cmd := command.UpdateHealthLogCommand{
			ID:             req.ID,
			PetID:          req.PetID,
			Date:           req.Date,
			WeightKg:       req.WeightKg,
			FoodGram:       req.FoodGram,
			LitterNotes:    req.LitterNotes,
			BehaviourNotes: req.BehaviourNotes,
		}

		log, err := ch.Handle(c, cmd)
		if err != nil {
			return UpdateHealthLogResponse{Err: err}, nil
		}

		return UpdateHealthLogResponse{HealthLog: log}, nil
	}
}

// MakeDeleteHealthLogEndpoint creates an endpoint for the delete health log handler.
func MakeDeleteHealthLogEndpoint(ch *command.DeleteHealthLogHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(DeleteHealthLogRequest)

		cmd := command.DeleteHealthLogCommand{
			ID: req.ID,
		}

		err := ch.Handle(c, cmd)
		if err != nil {
			return DeleteHealthLogResponse{Err: err}, nil
		}

		return DeleteHealthLogResponse{Success: true}, nil
	}
}

// ProvideCreateHealthLogEndpoint provides the create health log endpoint.
func ProvideCreateHealthLogEndpoint(ch *command.CreateHealthLogHandler) endpoint.Endpoint {
	return MakeCreateHealthLogEndpoint(ch)
}

// ProvideGetHealthLogByIDEndpoint provides the get health log by ID endpoint.
func ProvideGetHealthLogByIDEndpoint(qh *query.GetHealthLogByIDHandler) endpoint.Endpoint {
	return MakeGetHealthLogByIDEndpoint(qh)
}

// ProvideListHealthLogsByPetEndpoint provides the list health logs by pet endpoint.
func ProvideListHealthLogsByPetEndpoint(qh *query.ListHealthLogsByPetHandler) endpoint.Endpoint {
	return MakeListHealthLogsByPetEndpoint(qh)
}

// ProvideUpdateHealthLogEndpoint provides the update health log endpoint.
func ProvideUpdateHealthLogEndpoint(ch *command.UpdateHealthLogHandler) endpoint.Endpoint {
	return MakeUpdateHealthLogEndpoint(ch)
}

// ProvideDeleteHealthLogEndpoint provides the delete health log endpoint.
func ProvideDeleteHealthLogEndpoint(ch *command.DeleteHealthLogHandler) endpoint.Endpoint {
	return MakeDeleteHealthLogEndpoint(ch)
}

// NewHealthLogEndpoints is a provider for the HealthLogEndpoints struct.
func NewHealthLogEndpoints(
	createHealthLog endpoint.Endpoint,
	getHealthLogByID endpoint.Endpoint,
	listHealthLogsByPet endpoint.Endpoint,
	updateHealthLog endpoint.Endpoint,
	deleteHealthLog endpoint.Endpoint,
) HealthLogEndpoints {
	return HealthLogEndpoints{
		CreateHealthLogEndpoint:     createHealthLog,
		GetHealthLogByIDEndpoint:    getHealthLogByID,
		ListHealthLogsByPetEndpoint: listHealthLogsByPet,
		UpdateHealthLogEndpoint:     updateHealthLog,
		DeleteHealthLogEndpoint:     deleteHealthLog,
	}
}

// ProvideHealthLogEndpoints 為 Wire 提供 HealthLogEndpoints 的建構函式
func ProvideHealthLogEndpoints(
	ch1 *command.CreateHealthLogHandler,
	ch2 *command.UpdateHealthLogHandler,
	ch3 *command.DeleteHealthLogHandler,
	qh1 *query.GetHealthLogByIDHandler,
	qh2 *query.ListHealthLogsByPetHandler,
) HealthLogEndpoints {
	return HealthLogEndpoints{
		CreateHealthLogEndpoint:     MakeCreateHealthLogEndpoint(ch1),
		GetHealthLogByIDEndpoint:    MakeGetHealthLogByIDEndpoint(qh1),
		ListHealthLogsByPetEndpoint: MakeListHealthLogsByPetEndpoint(qh2),
		UpdateHealthLogEndpoint:     MakeUpdateHealthLogEndpoint(ch2),
		DeleteHealthLogEndpoint:     MakeDeleteHealthLogEndpoint(ch3),
	}
}

// HealthLogEndpoints collects all the endpoints that compose a health log service.
type HealthLogEndpoints struct {
	CreateHealthLogEndpoint     endpoint.Endpoint
	GetHealthLogByIDEndpoint    endpoint.Endpoint
	ListHealthLogsByPetEndpoint endpoint.Endpoint
	UpdateHealthLogEndpoint     endpoint.Endpoint
	DeleteHealthLogEndpoint     endpoint.Endpoint
}

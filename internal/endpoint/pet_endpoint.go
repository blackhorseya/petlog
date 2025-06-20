package endpoint

import (
	"context"

	"github.com/go-kit/kit/endpoint"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/usecase/command"
	"github.com/blackhorseya/petlog/internal/usecase/query"
)

// PetEndpoints collects all of the endpoints that compose a pet service.
type PetEndpoints struct {
	CreatePetEndpoint endpoint.Endpoint
	UpdatePetEndpoint endpoint.Endpoint
	DeletePetEndpoint endpoint.Endpoint
	GetPetEndpoint    endpoint.Endpoint
	ListPetsEndpoint  endpoint.Endpoint
}

// MakePetEndpoints returns a PetEndpoints struct where each endpoint invokes
// the corresponding method on the provided service.
func MakePetEndpoints(ch command.CreatePetHandler, uh command.UpdatePetHandler, dh command.DeletePetHandler, qh query.GetPetByIDHandler, lh query.ListPetsByOwnerHandler) PetEndpoints {
	return PetEndpoints{
		CreatePetEndpoint: MakeCreatePetEndpoint(&ch),
		UpdatePetEndpoint: MakeUpdatePetEndpoint(&uh),
		DeletePetEndpoint: MakeDeletePetEndpoint(&dh),
		GetPetEndpoint:    MakeGetPetEndpoint(&qh),
		ListPetsEndpoint:  MakeListPetsEndpoint(&lh),
	}
}

// CreatePet
type CreatePetRequest struct {
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}
type CreatePetResponse struct {
	Pet *model.Pet `json:"pet"`
	Err error      `json:"error,omitempty"`
}

func (r CreatePetResponse) Failed() error { return r.Err }

func MakeCreatePetEndpoint(h *command.CreatePetHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(CreatePetRequest)
		cmd := command.CreatePetCommand{
			Name:      req.Name,
			AvatarURL: req.AvatarURL,
		}

		p, err := h.Handle(c, cmd)
		if err != nil {
			return CreatePetResponse{Err: err}, nil
		}
		return CreatePetResponse{Pet: p, Err: nil}, nil
	}
}

// UpdatePet
type UpdatePetRequest struct {
	ID        string
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}
type UpdatePetResponse struct {
	Err error `json:"error,omitempty"`
}

func (r UpdatePetResponse) Failed() error { return r.Err }

func MakeUpdatePetEndpoint(h *command.UpdatePetHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(UpdatePetRequest)
		cmd := command.UpdatePetCommand{
			ID:        req.ID,
			Name:      req.Name,
			AvatarURL: req.AvatarURL,
		}

		err := h.Handle(c, cmd)
		if err != nil {
			return UpdatePetResponse{Err: err}, nil
		}
		return UpdatePetResponse{Err: nil}, nil
	}
}

// DeletePet
type DeletePetRequest struct {
	ID string
}
type DeletePetResponse struct {
	Err error `json:"error,omitempty"`
}

func (r DeletePetResponse) Failed() error { return r.Err }

func MakeDeletePetEndpoint(h *command.DeletePetHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(DeletePetRequest)
		cmd := command.DeletePetCommand{ID: req.ID}

		err := h.Handle(c, cmd)
		if err != nil {
			return DeletePetResponse{Err: err}, nil
		}
		return DeletePetResponse{Err: nil}, nil
	}
}

// GetPet
type GetPetRequest struct {
	ID string
}
type GetPetResponse struct {
	Pet *model.Pet `json:"pet"`
	Err error      `json:"error,omitempty"`
}

func (r GetPetResponse) Failed() error { return r.Err }

func MakeGetPetEndpoint(h *query.GetPetByIDHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(GetPetRequest)
		q := query.GetPetByIDQuery{ID: req.ID}

		p, err := h.Handle(c, q)
		if err != nil {
			return GetPetResponse{Err: err}, nil
		}
		return GetPetResponse{Pet: p, Err: nil}, nil
	}
}

// ListPets
type ListPetsRequest struct {
	// Future pagination/filter fields go here
}
type ListPetsResponse struct {
	Pets []*model.Pet `json:"pets"`
	Err  error        `json:"error,omitempty"`
}

func (r ListPetsResponse) Failed() error { return r.Err }

func MakeListPetsEndpoint(h *query.ListPetsByOwnerHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		_ = request.(ListPetsRequest) // No fields in request for now
		q := query.ListPetsByOwnerQuery{}

		pets, err := h.Handle(c, q)
		if err != nil {
			return ListPetsResponse{Err: err}, nil
		}
		return ListPetsResponse{Pets: pets, Err: nil}, nil
	}
}

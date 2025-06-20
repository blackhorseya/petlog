//go:build wireinject
// +build wireinject

package main

import (
	"context"
	"net/http"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/blackhorseya/petlog/internal/infra/mongodb"
	"github.com/blackhorseya/petlog/internal/transport/gin"
	"github.com/blackhorseya/petlog/internal/usecase/command"
	"github.com/blackhorseya/petlog/internal/usecase/query"
	"github.com/google/wire"
)

// initPetAPI initializes the pet API.
func initPetAPI(c context.Context, cfg config.AppConfig) (http.Handler, error) {
	wire.Build(
		wire.Bind(new(repository.PetRepository), new(*mongodb.PetMongoRepo)),
		mongodb.NewPetMongoRepo,
		command.NewCreatePetHandler,
		command.NewUpdatePetHandler,
		command.NewDeletePetHandler,
		query.NewGetPetByIDHandler,
		query.NewListPetsByOwnerHandler,
		endpoint.MakePetEndpoints,
		gin.NewPetHandler,
	)
	return nil, nil
}

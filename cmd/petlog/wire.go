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
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/google/wire"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// initPetAPI initializes the pet API.
func initPetAPI(c context.Context, cfg config.AppConfig) (http.Handler, error) {
	wire.Build(
		// Database
		provideMongoDatabase,
		wire.Bind(new(repository.PetRepository), new(*mongodb.PetMongoRepo)),
		mongodb.NewPetMongoRepo,

		// Usecase Handlers
		command.NewCreatePetHandler,
		command.NewUpdatePetHandler,
		command.NewDeletePetHandler,
		query.NewGetPetByIDHandler,
		query.NewListPetsByOwnerHandler,

		// Endpoint & Transport
		endpoint.MakePetEndpoints,
		gin.NewPetHandler,
		wire.Value([]kithttp.ServerOption{}),
	)
	return nil, nil
}

func provideMongoDatabase(cfg config.AppConfig) (*mongo.Database, error) {
	// This is a placeholder. In a real application, you would use the
	// configuration (cfg) to connect to MongoDB and return the database instance.
	return nil, nil
}

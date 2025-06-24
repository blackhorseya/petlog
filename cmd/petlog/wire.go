//go:build wireinject
// +build wireinject

package main

import (
	"context"
	"net/http"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/blackhorseya/petlog/internal/infra/mongodb"
	"github.com/blackhorseya/petlog/internal/transport/gin"
	"github.com/blackhorseya/petlog/internal/usecase/command"
	"github.com/blackhorseya/petlog/internal/usecase/query"
	httptransport "github.com/go-kit/kit/transport/http"
	"github.com/google/wire"
)

// initPetAPI initializes the pet API.
func initPetAPI(c context.Context, cfg config.Config) (http.Handler, func(), error) {
	wire.Build(
		// 資料庫層
		mongodb.ProviderSet,
		mongodb.NewPetMongoRepo,
		mongodb.NewHealthLogRepository,

		// Pet 用例處理器
		command.NewCreatePetHandler,
		command.NewDeletePetHandler,
		command.NewUpdatePetHandler,
		query.NewGetPetByIDHandler,
		query.NewListPetsByOwnerHandler,

		// HealthLog 用例處理器
		command.NewCreateHealthLogHandler,
		command.NewUpdateHealthLogHandler,
		command.NewDeleteHealthLogHandler,
		query.NewGetHealthLogByIDHandler,
		query.NewListHealthLogsByPetHandler,

		// Dashboard 用例處理器
		query.NewGetDashboardOverviewHandler,

		// Pet 端點層
		endpoint.MakePetEndpoints,

		// HealthLog 端點層
		endpoint.ProvideHealthLogEndpoints,

		// Dashboard 端點層
		endpoint.NewDashboardEndpoints,

		// Transport層
		gin.NewGinEngine,
		gin.NewHTTPHandler,

		// Provide an empty slice of server options.
		wire.Value([]httptransport.ServerOption{}),
	)
	return nil, nil, nil
}

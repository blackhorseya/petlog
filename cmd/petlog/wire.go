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
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/google/wire"
)

// initPetAPI initializes the pet API.
func initPetAPI(c context.Context, cfg config.Config) (http.Handler, func(), error) {
	wire.Build(
		// 資料庫層
		mongodb.ProviderSet,
		mongodb.NewPetMongoRepo,

		// 用例處理器
		command.NewCreatePetHandler,
		command.NewUpdatePetHandler,
		command.NewDeletePetHandler,
		query.NewGetPetByIDHandler,
		query.NewListPetsByOwnerHandler,

		// 端點和傳輸層
		endpoint.MakePetEndpoints,
		gin.NewGinEngine,
		gin.NewHTTPHandler,

		// 提供空的 HTTP 選項
		wire.Value([]kithttp.ServerOption{}),
	)
	return nil, nil, nil
}

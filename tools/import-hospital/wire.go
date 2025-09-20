//go:build wireinject
// +build wireinject

package main

import (
	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/internal/infra/mongodb"
	"github.com/google/wire"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// injector 依賴注入容器
type injector struct {
	config         config.Config
	mongoDatabase  *mongo.Database
	hospitalRepo   repository.HospitalRepository
	geocodeService GeocodeService
}

func newInjector(config config.Config) (*injector, func(), error) {
	panic(wire.Build(
		wire.Struct(new(injector), "*"),
		mongodb.ProviderSet,
		mongodb.NewHospitalRepository,
		provideGoogleGeocodeService,
	))
}

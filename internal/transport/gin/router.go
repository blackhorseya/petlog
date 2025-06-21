package gin

import (
	"net/http"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/gin-gonic/gin"
	httptransport "github.com/go-kit/kit/transport/http"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// NewGinEngine creates a new Gin engine with default middleware.
func NewGinEngine() *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Swagger documentation endpoint
	// URL: /api/docs/index.html
	r.GET("/api/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return r
}

// NewHTTPHandler sets up the routing and returns the main HTTP handler.
// It acts as an aggregator for all route registration functions.
func NewHTTPHandler(
	r *gin.Engine,
	cfg config.AppConfig,
	petEndpoints endpoint.PetEndpoints,
	options []httptransport.ServerOption,
) http.Handler {
	// Register routes for the "pet" module.
	RegisterPetRoutes(r, cfg, petEndpoints, options...)

	// In the future, other modules can be registered here:
	// RegisterHealthLogRoutes(r, cfg, healthLogEndpoints, options...)

	return r
}

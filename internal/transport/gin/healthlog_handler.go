package gin

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/gin-gonic/gin"
	httptransport "github.com/go-kit/kit/transport/http"
)

// RegisterHealthLogRoutes registers health-log-related routes on the given Gin engine.
func RegisterHealthLogRoutes(r *gin.Engine, cfg config.Config, e endpoint.HealthLogEndpoints, options ...httptransport.ServerOption) {
	// Error handler
	opts := []httptransport.ServerOption{
		httptransport.ServerErrorHandler(NewContextualLogErrorHandler()),
		httptransport.ServerErrorEncoder(encodeError),
	}
	opts = append(opts, options...)

	v1 := r.Group("/api/v1")
	healthLogRoutes := v1.Group("/health-logs")
	healthLogRoutes.Use(EnsureValidToken(cfg))
	{
		healthLogRoutes.POST("", CreateHealthLog(e, opts...))
		// Other routes for Get, List, Update, Delete will go here.
	}
}

// CreateHealthLog godoc
// @Summary      建立健康日誌
// @Description  為指定的寵物建立一筆新的健康日誌紀錄
// @Tags         health-logs
// @Accept       json
// @Produce      json
// @Param        healthLog  body      endpoint.CreateHealthLogRequest  true  "健康日誌資訊"
// @Success      200      {object}  endpoint.CreateHealthLogResponse
// @Failure      400      {object}  map[string]interface{}
// @Failure      401      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/health-logs [post]
func CreateHealthLog(e endpoint.HealthLogEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.CreateHealthLogEndpoint,
		decodeCreateHealthLogRequest,
		encodeResponse,
		options...,
	))
}

// decodeCreateHealthLogRequest is a transport/http.DecodeRequestFunc that decodes a
// JSON-encoded create health log request from the HTTP request body.
func decodeCreateHealthLogRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var req endpoint.CreateHealthLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	return req, nil
}

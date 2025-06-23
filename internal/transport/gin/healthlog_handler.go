package gin

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

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
		healthLogRoutes.GET("/:id", GetHealthLogByID(e, opts...))
		healthLogRoutes.GET("", ListHealthLogsByPet(e, opts...))
		healthLogRoutes.PUT("/:id", UpdateHealthLog(e, opts...))
		healthLogRoutes.DELETE("/:id", DeleteHealthLog(e, opts...))
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

// GetHealthLogByID godoc
// @Summary      根據 ID 取得健康日誌
// @Description  取得指定 ID 的健康日誌詳細資訊
// @Tags         health-logs
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "健康日誌 ID"
// @Success      200  {object}  endpoint.GetHealthLogByIDResponse
// @Failure      400  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/health-logs/{id} [get]
func GetHealthLogByID(e endpoint.HealthLogEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.GetHealthLogByIDEndpoint,
		decodeGetHealthLogByIDRequest,
		encodeResponse,
		options...,
	))
}

// ListHealthLogsByPet godoc
// @Summary      列出寵物的健康日誌
// @Description  根據寵物 ID 和可選的日期範圍列出健康日誌
// @Tags         health-logs
// @Accept       json
// @Produce      json
// @Param        pet_id      query     string  true   "寵物 ID"
// @Param        start_date  query     string  false  "開始日期 (RFC3339 格式)"
// @Param        end_date    query     string  false  "結束日期 (RFC3339 格式)"
// @Success      200         {object}  endpoint.ListHealthLogsByPetResponse
// @Failure      400         {object}  map[string]interface{}
// @Failure      401         {object}  map[string]interface{}
// @Failure      500         {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/health-logs [get]
func ListHealthLogsByPet(e endpoint.HealthLogEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.ListHealthLogsByPetEndpoint,
		decodeListHealthLogsByPetRequest,
		encodeResponse,
		options...,
	))
}

// UpdateHealthLog godoc
// @Summary      更新健康日誌
// @Description  更新指定 ID 的健康日誌資訊
// @Tags         health-logs
// @Accept       json
// @Produce      json
// @Param        id        path      string                             true  "健康日誌 ID"
// @Param        healthLog body      endpoint.UpdateHealthLogRequest    true  "更新的健康日誌資訊"
// @Success      200       {object}  endpoint.UpdateHealthLogResponse
// @Failure      400       {object}  map[string]interface{}
// @Failure      401       {object}  map[string]interface{}
// @Failure      404       {object}  map[string]interface{}
// @Failure      500       {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/health-logs/{id} [put]
func UpdateHealthLog(e endpoint.HealthLogEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.UpdateHealthLogEndpoint,
		decodeUpdateHealthLogRequest,
		encodeResponse,
		options...,
	))
}

// DeleteHealthLog godoc
// @Summary      刪除健康日誌
// @Description  刪除指定 ID 的健康日誌
// @Tags         health-logs
// @Accept       json
// @Produce      json
// @Param        id  path      string  true  "健康日誌 ID"
// @Success      200 {object}  endpoint.DeleteHealthLogResponse
// @Failure      400 {object}  map[string]interface{}
// @Failure      401 {object}  map[string]interface{}
// @Failure      404 {object}  map[string]interface{}
// @Failure      500 {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/health-logs/{id} [delete]
func DeleteHealthLog(e endpoint.HealthLogEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.DeleteHealthLogEndpoint,
		decodeDeleteHealthLogRequest,
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

// decodeGetHealthLogByIDRequest is a transport/http.DecodeRequestFunc that decodes a
// get health log by ID request from the HTTP request URL.
func decodeGetHealthLogByIDRequest(_ context.Context, r *http.Request) (interface{}, error) {
	// 從 Gin 的上下文中取得路徑參數，這需要特殊處理
	// 由於我們使用 gin.WrapH，我們需要從 URL 中解析 ID
	// 路徑格式：/api/v1/health-logs/{id}
	pathParts := []rune(r.URL.Path)
	lastSlashIndex := -1
	for i := len(pathParts) - 1; i >= 0; i-- {
		if pathParts[i] == '/' {
			lastSlashIndex = i
			break
		}
	}
	
	if lastSlashIndex == -1 || lastSlashIndex == len(pathParts)-1 {
		return nil, gin.Error{Err: gin.Error{Type: gin.ErrorTypeBind, Meta: "invalid path"}.Err}
	}
	
	id := string(pathParts[lastSlashIndex+1:])
	return endpoint.GetHealthLogByIDRequest{ID: id}, nil
}

// decodeListHealthLogsByPetRequest is a transport/http.DecodeRequestFunc that decodes a
// list health logs by pet request from the HTTP request query parameters.
func decodeListHealthLogsByPetRequest(_ context.Context, r *http.Request) (interface{}, error) {
	petID := r.URL.Query().Get("pet_id")
	if petID == "" {
		return nil, gin.Error{Err: gin.Error{Type: gin.ErrorTypeBind, Meta: "pet_id is required"}.Err}
	}

	req := endpoint.ListHealthLogsByPetRequest{
		PetID: petID,
	}

	// 解析可選的日期參數
	if startDateStr := r.URL.Query().Get("start_date"); startDateStr != "" {
		if startDate, err := time.Parse(time.RFC3339, startDateStr); err == nil {
			req.StartDate = startDate
		}
	}

	if endDateStr := r.URL.Query().Get("end_date"); endDateStr != "" {
		if endDate, err := time.Parse(time.RFC3339, endDateStr); err == nil {
			req.EndDate = endDate
		}
	}

	return req, nil
}

// decodeUpdateHealthLogRequest is a transport/http.DecodeRequestFunc that decodes a
// JSON-encoded update health log request from the HTTP request body and URL.
func decodeUpdateHealthLogRequest(_ context.Context, r *http.Request) (interface{}, error) {
	// 從 URL 中解析 ID
	pathParts := []rune(r.URL.Path)
	lastSlashIndex := -1
	for i := len(pathParts) - 1; i >= 0; i-- {
		if pathParts[i] == '/' {
			lastSlashIndex = i
			break
		}
	}
	
	if lastSlashIndex == -1 || lastSlashIndex == len(pathParts)-1 {
		return nil, gin.Error{Err: gin.Error{Type: gin.ErrorTypeBind, Meta: "invalid path"}.Err}
	}
	
	id := string(pathParts[lastSlashIndex+1:])

	var req endpoint.UpdateHealthLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	
	// 確保 ID 來自 URL 路徑
	req.ID = id
	
	return req, nil
}

// decodeDeleteHealthLogRequest is a transport/http.DecodeRequestFunc that decodes a
// delete health log request from the HTTP request URL.
func decodeDeleteHealthLogRequest(_ context.Context, r *http.Request) (interface{}, error) {
	// 從 URL 中解析 ID
	pathParts := []rune(r.URL.Path)
	lastSlashIndex := -1
	for i := len(pathParts) - 1; i >= 0; i-- {
		if pathParts[i] == '/' {
			lastSlashIndex = i
			break
		}
	}
	
	if lastSlashIndex == -1 || lastSlashIndex == len(pathParts)-1 {
		return nil, gin.Error{Err: gin.Error{Type: gin.ErrorTypeBind, Meta: "invalid path"}.Err}
	}
	
	id := string(pathParts[lastSlashIndex+1:])
	return endpoint.DeleteHealthLogRequest{ID: id}, nil
}

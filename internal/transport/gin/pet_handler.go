package gin

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/gin-gonic/gin"
	"github.com/go-kit/kit/transport"
	httptransport "github.com/go-kit/kit/transport/http"
)

// NewPetHandler returns a new pet handler.
func NewPetHandler(cfg config.AppConfig, e endpoint.PetEndpoints, options ...httptransport.ServerOption) http.Handler {
	r := gin.New()

	// Error handler
	opts := []httptransport.ServerOption{
		httptransport.ServerErrorHandler(transport.NewLogErrorHandler(nil)), // replace nil with a logger
		httptransport.ServerErrorEncoder(encodeError),
	}
	opts = append(opts, options...)

	// Public endpoints

	// Private endpoints
	petRoutes := r.Group("/api/v1/pets")
	petRoutes.Use(EnsureValidToken(cfg))
	{
		petRoutes.POST("", CreatePet(e, opts...))
		petRoutes.GET("/:id", GetPet(e, opts...))
		petRoutes.PUT("/:id", UpdatePet(e, opts...))
		petRoutes.DELETE("/:id", DeletePet(e, opts...))
		petRoutes.GET("", ListPets(e, opts...))
	}

	return r
}

// CreatePet godoc
// @Summary      建立新寵物
// @Description  為使用者建立一筆新的寵物資料
// @Tags         pets
// @Accept       json
// @Produce      json
// @Param        pet  body      endpoint.CreatePetRequest  true  "寵物資訊"
// @Success      200  {object}  endpoint.CreatePetResponse
// @Failure      400  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/pets [post]
func CreatePet(e endpoint.PetEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.CreatePetEndpoint,
		decodeCreatePetRequest,
		encodeResponse,
		options...,
	))
}

// GetPet godoc
// @Summary      取得寵物資訊
// @Description  根據寵物ID取得詳細資訊
// @Tags         pets
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "寵物ID"
// @Success      200  {object}  endpoint.GetPetResponse
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/pets/{id} [get]
func GetPet(e endpoint.PetEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.GetPetEndpoint,
		decodeGetPetRequest,
		encodeResponse,
		options...,
	))
}

// UpdatePet godoc
// @Summary      更新寵物資訊
// @Description  根據寵物ID更新現有寵物資料
// @Tags         pets
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "寵物ID"
// @Param        pet  body      endpoint.UpdatePetRequest  true  "要更新的寵物資訊"
// @Success      200  {object}  endpoint.UpdatePetResponse
// @Failure      400  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/pets/{id} [put]
func UpdatePet(e endpoint.PetEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.UpdatePetEndpoint,
		decodeUpdatePetRequest,
		encodeResponse,
		options...,
	))
}

// DeletePet godoc
// @Summary      刪除寵物
// @Description  根據寵物ID刪除寵物資料
// @Tags         pets
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "寵物ID"
// @Success      200  {object}  endpoint.DeletePetResponse
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/pets/{id} [delete]
func DeletePet(e endpoint.PetEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.DeletePetEndpoint,
		decodeDeletePetRequest,
		encodeResponse,
		options...,
	))
}

// ListPets godoc
// @Summary      列出所有寵物
// @Description  取得目前使用者擁有的所有寵物列表
// @Tags         pets
// @Accept       json
// @Produce      json
// @Success      200  {object}  endpoint.ListPetsResponse
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/pets [get]
func ListPets(e endpoint.PetEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.ListPetsEndpoint,
		decodeListPetsRequest,
		encodeResponse,
		options...,
	))
}

func decodeCreatePetRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req endpoint.CreatePetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	return req, nil
}

func decodeGetPetRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value("GinContext").(*gin.Context)
	id := ginctx.Param("id")
	return endpoint.GetPetRequest{ID: id}, nil
}

func decodeUpdatePetRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value("GinContext").(*gin.Context)
	id := ginctx.Param("id")

	var req endpoint.UpdatePetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	req.ID = id
	return req, nil
}

func decodeDeletePetRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value("GinContext").(*gin.Context)
	id := ginctx.Param("id")
	return endpoint.DeletePetRequest{ID: id}, nil
}

func decodeListPetsRequest(_ context.Context, _ *http.Request) (request interface{}, err error) {
	return endpoint.ListPetsRequest{}, nil
}

// encodeResponse is the common response encoder.
func encodeResponse(c context.Context, w http.ResponseWriter, response interface{}) error {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	if f, ok := response.(endpoint.Failer); ok && f.Failed() != nil {
		encodeError(c, f.Failed(), w)
		return nil
	}

	return json.NewEncoder(w).Encode(response)
}

// encodeError is a custom error encoder.
func encodeError(_ context.Context, err error, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	// TODO: Map domain errors to HTTP status codes
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error": err.Error(),
	})
}

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
		petRoutes.POST("", gin.WrapH(httptransport.NewServer(
			e.CreatePetEndpoint,
			decodeCreatePetRequest,
			encodeResponse,
			opts...,
		)))
		petRoutes.GET("/:id", gin.WrapH(httptransport.NewServer(
			e.GetPetEndpoint,
			decodeGetPetRequest,
			encodeResponse,
			opts...,
		)))
		petRoutes.PUT("/:id", gin.WrapH(httptransport.NewServer(
			e.UpdatePetEndpoint,
			decodeUpdatePetRequest,
			encodeResponse,
			opts...,
		)))
		petRoutes.DELETE("/:id", gin.WrapH(httptransport.NewServer(
			e.DeletePetEndpoint,
			decodeDeletePetRequest,
			encodeResponse,
			opts...,
		)))
		petRoutes.GET("", gin.WrapH(httptransport.NewServer(
			e.ListPetsEndpoint,
			decodeListPetsRequest,
			encodeResponse,
			opts...,
		)))
	}

	return r
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

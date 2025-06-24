package gin

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// ContextualLogErrorHandler is a transport.ErrorHandler that logs errors using
// the logger found in the context.
type ContextualLogErrorHandler struct{}

// NewContextualLogErrorHandler returns a new ContextualLogErrorHandler.
func NewContextualLogErrorHandler() *ContextualLogErrorHandler {
	return &ContextualLogErrorHandler{}
}

// Handle logs the error using the logger from the context.
func (h *ContextualLogErrorHandler) Handle(c context.Context, err error) {
	ctx := contextx.WithContext(c)
	ctx.Error("transport-level error", "error", err)
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

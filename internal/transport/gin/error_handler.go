package gin

import (
	"context"

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

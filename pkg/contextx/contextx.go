package contextx

import (
	"context"
	"errors"
	"log/slog"
)

type loggerKeyType struct{}

var loggerKey = loggerKeyType{}

// Contextx is a struct that holds the context of the request
type Contextx struct {
	context.Context
	*slog.Logger
}

// WithContext creates a new Contextx using the logger from the given context,
// or the default logger if none is found.
func WithContext(c context.Context) Contextx {
	logger := GetLogger(c)
	newCtx := WithLogger(c, logger)
	return Contextx{
		Context: newCtx,
		Logger:  logger,
	}
}

// WithLogger attaches the given logger to the context.
func WithLogger(c context.Context, logger *slog.Logger) context.Context {
	return context.WithValue(c, loggerKey, logger)
}

// GetLogger retrieves the logger from the context.
// If not found, it returns the default slog logger.
func GetLogger(c context.Context) *slog.Logger {
	if logger, ok := c.Value(loggerKey).(*slog.Logger); ok {
		return logger
	}

	return slog.Default()
}

type userIDKeyType struct{}

var userIDKey = userIDKeyType{}

// WithUserID attaches the user ID to the context.
func WithUserID(c context.Context, userID string) context.Context {
	return context.WithValue(c, userIDKey, userID)
}

// GetUserID retrieves the user ID from the context.
// Returns an error if user ID is not found.
func GetUserID(c context.Context) (string, error) {
	userID, ok := c.Value(userIDKey).(string)
	if !ok || userID == "" {
		return "", errors.New("user_id not found in context")
	}
	return userID, nil
}

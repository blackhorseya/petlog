package contextx

import (
	"context"
	"log/slog"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWithContext(t *testing.T) {
	slog.SetLogLoggerLevel(slog.LevelDebug)

	c := context.Background()
	ctx := WithContext(c)

	ctx.Debug("debug message")
	ctx.Info("info message")
	ctx.Warn("warn message")
	ctx.Error("error message")
}

func TestWithLogger(t *testing.T) {
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		AddSource:   true,
		Level:       slog.LevelDebug,
		ReplaceAttr: nil,
	}))

	c := context.Background()
	c = WithLogger(c, logger)
	ctx := WithContext(c)

	ctx.Debug("debug message")
	ctx.Info("info message")
	ctx.Warn("warn message")
	ctx.Error("error message")
}

func TestUserID(t *testing.T) {
	ctx := context.Background()
	testUserID := "test-user-123"

	// Test case 1: UserID is not in the context
	_, err := GetUserID(ctx)
	assert.Error(t, err, "Expected GetUserID to return an error for context without UserID")

	// Test case 2: UserID is in the context
	ctxWithUser := WithUserID(ctx, testUserID)
	retrievedUserID, err := GetUserID(ctxWithUser)
	assert.NoError(t, err, "Expected GetUserID to not return an error for context with UserID")
	assert.Equal(t, testUserID, retrievedUserID, "Retrieved UserID should match the one set")

	// Test case 3: Overwriting an existing UserID
	anotherUserID := "another-user-456"
	ctxWithAnotherUser := WithUserID(ctxWithUser, anotherUserID)
	retrievedAnotherUserID, err := GetUserID(ctxWithAnotherUser)
	assert.NoError(t, err, "Expected GetUserID to not return an error after overwriting")
	assert.Equal(t, anotherUserID, retrievedAnotherUserID, "Retrieved UserID should be the new one")
}

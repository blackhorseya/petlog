package contextx

import (
	"context"
	"log/slog"
	"os"
	"testing"
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

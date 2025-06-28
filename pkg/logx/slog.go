package logx

import (
	"log/slog"
	"os"
)

type Option func(*handlerConfig)

type handlerConfig struct {
	level  slog.Level
	format string
}

// NewSlogLogger initializes the logging instance with option functions.
func NewSlogLogger(opts ...Option) (*slog.Logger, error) {
	cfg := &handlerConfig{
		level:  slog.LevelInfo,
		format: "text",
	}

	for _, opt := range opts {
		opt(cfg)
	}

	hOpts := &slog.HandlerOptions{
		AddSource: true,
		Level:     cfg.level,
	}

	var handler slog.Handler
	switch cfg.format {
	case "json":
		handler = slog.NewJSONHandler(os.Stdout, hOpts)
	default:
		handler = slog.NewTextHandler(os.Stdout, hOpts)
	}

	logger := slog.New(handler)
	slog.SetDefault(logger)

	return logger, nil
}

func WithLevel(levelText string) Option {
	return func(cfg *handlerConfig) {
		var lvl slog.Level
		if err := lvl.UnmarshalText([]byte(levelText)); err == nil {
			cfg.level = lvl
		}
	}
}

func WithFormat(format string) Option {
	return func(cfg *handlerConfig) {
		cfg.format = format
	}
}

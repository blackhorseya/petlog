//go:build tools

package main

import (
	_ "github.com/air-verse/air"
	_ "github.com/golangci/golangci-lint/cmd/golangci-lint"
	_ "github.com/google/wire/cmd/wire"
	_ "github.com/swaggo/swag/cmd/swag"
	_ "go.uber.org/mock/mockgen"
)

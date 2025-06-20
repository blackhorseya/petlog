package mongodb

import (
	"context"
	"log"
	"time"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/google/wire"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

// ProviderSet is the provider set for this package.
var ProviderSet = wire.NewSet(NewDatabase)

// NewDatabase creates a new mongo database connection and returns a cleanup function.
func NewDatabase(conf config.AppConfig) (*mongo.Database, func(), error) {
	client, err := mongo.Connect(options.Client().ApplyURI(conf.MongoURI))
	if err != nil {
		return nil, nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Ping the primary
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, nil, err
	}

	cleanup := func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := client.Disconnect(ctx); err != nil {
			log.Printf("failed to disconnect mongo client: %v", err)
		}
	}

	return client.Database(conf.MongoDatabase), cleanup, nil
}

package mongodb

import (
	"context"
	"fmt"
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

// NewDatabase 建立新的 MongoDB 資料庫連線
func NewDatabase(conf config.Config) (*mongo.Database, func(), error) {
	// 建立 MongoDB 客戶端選項
	clientOptions := options.Client().ApplyURI(conf.Mongo.URI)

	// 連線到 MongoDB
	client, err := mongo.Connect(clientOptions)
	if err != nil {
		return nil, nil, fmt.Errorf("連線到 MongoDB 失敗: %w", err)
	}

	// 測試連線
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Ping the primary
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, nil, fmt.Errorf("MongoDB ping 失敗: %w", err)
	}

	log.Printf("成功連線到 MongoDB 資料庫: %s", conf.Mongo.Database)

	// 取得資料庫實例
	database := client.Database(conf.Mongo.Database)

	// 清理函式
	cleanup := func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := client.Disconnect(ctx); err != nil {
			log.Printf("斷開 MongoDB 連線時發生錯誤: %v", err)
		}
	}

	return database, cleanup, nil
}

package config

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// Config 應用程式配置結構
type Config struct {
	Auth0 Auth0Config `mapstructure:"auth0"`
	Mongo MongoConfig `mapstructure:"mongo"`
	HTTP  HTTPConfig  `mapstructure:"http"`
}

// Auth0Config Auth0 認證配置
type Auth0Config struct {
	Domain   string `mapstructure:"domain"`
	Audience string `mapstructure:"audience"`
}

// MongoConfig MongoDB 配置
type MongoConfig struct {
	URI      string `mapstructure:"uri"`
	Database string `mapstructure:"database"`
}

// HTTPConfig HTTP 伺服器配置
type HTTPConfig struct {
	Port string `mapstructure:"port"`
}

// Load 載入配置
func Load() (*Config, error) {
	// 嘗試載入 .env 檔案（按照慣例順序）
	// 如果檔案不存在，godotenv 會靜默忽略
	_ = godotenv.Load(".env.dev.local")
	_ = godotenv.Load(".env.local")
	_ = godotenv.Load(".env")

	// 設定 viper
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	// 設定環境變數對應
	viper.BindEnv("auth0.domain", "AUTH0_DOMAIN")
	viper.BindEnv("auth0.audience", "AUTH0_AUDIENCE")
	viper.BindEnv("mongo.uri", "MONGO_URI")
	viper.BindEnv("mongo.database", "MONGO_DATABASE")
	viper.BindEnv("http.port", "SERVER_PORT")

	// 設定預設值
	viper.SetDefault("http.port", "8080")

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("無法解析配置: %w", err)
	}

	// 驗證必要配置
	if config.Mongo.URI == "" {
		return nil, fmt.Errorf("MONGO_URI 環境變數為必填項")
	}

	log.Printf("配置載入成功 - HTTP Port: %s, MongoDB Database: %s",
		config.HTTP.Port, config.Mongo.Database)

	return &config, nil
}

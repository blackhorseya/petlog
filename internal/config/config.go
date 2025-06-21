package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// AppConfig is the application configuration.
type AppConfig struct {
	Auth0Domain   string `mapstructure:"auth0_domain"`
	Auth0Audience string `mapstructure:"auth0_audience"`
	MongoURI      string `mapstructure:"mongo_uri"`
	MongoDatabase string `mapstructure:"mongo_database"`
	ServerPort    string `mapstructure:"server_port"`
}

// LoadConfig loads configuration from environment variables,
// falling back to a config file for local development.
func LoadConfig() (AppConfig, error) {
	// Set a replacer to map environment variables like AUTH0_DOMAIN to auth0_domain
	replacer := strings.NewReplacer(".", "_")
	viper.SetEnvKeyReplacer(replacer)
	viper.AutomaticEnv()

	// Try to read from config file for local dev, but env vars will always override.
	viper.AddConfigPath(".")
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	_ = viper.ReadInConfig() // Ignore error if file not found

	var cfg AppConfig
	if err := viper.Unmarshal(&cfg); err != nil {
		return AppConfig{}, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Validate critical configuration
	if cfg.MongoURI == "" {
		return AppConfig{}, fmt.Errorf("MONGO_URI is not set")
	}

	return cfg, nil
}

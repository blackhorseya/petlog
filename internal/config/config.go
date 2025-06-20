package config

import (
	"log"

	"github.com/spf13/viper"
)

// AppConfig holds the application configuration
type AppConfig struct {
	Auth0Domain   string `mapstructure:"AUTH0_DOMAIN"`
	Auth0Audience string `mapstructure:"AUTH0_AUDIENCE"`
	MongoURI      string `mapstructure:"MONGO_URI"`
	MongoDatabase string `mapstructure:"MONGO_DATABASE"`
}

// LoadConfig loads configuration from file and environment variables
func LoadConfig() (config AppConfig, err error) {
	viper.AddConfigPath(".")
	viper.SetConfigName(".env")
	viper.SetConfigType("env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Config file not found; ignore error if desired
			log.Println("config file not found, using environment variables")
		} else {
			// Config file was found but another error was produced
			return
		}
	}

	err = viper.Unmarshal(&config)
	return
}

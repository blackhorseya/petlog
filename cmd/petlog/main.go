package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/blackhorseya/petlog/internal/config"
	transport "github.com/blackhorseya/petlog/internal/transport/gin"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Set up Gin router
	router := gin.Default()

	// Public route
	router.GET("/api/v1/public", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello from a public endpoint! You don't need to be authenticated to see this."})
	})

	// Private route group
	private := router.Group("/api/v1/private")
	private.Use(transport.EnsureValidToken(cfg))
	{
		private.GET("", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "Hello from a private endpoint! You need to be authenticated to see this."})
		})
	}

	// Start the server
	log.Println("Server is running on port 8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

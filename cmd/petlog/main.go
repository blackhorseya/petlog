package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	// Initialize API
	handler, cleanup, err := initPetAPI(context.Background(), cfg)
	if err != nil {
		log.Fatalf("failed to init pet API: %v", err)
	}
	defer cleanup()

	// Create server
	srv := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}

	// Start the server
	log.Println("Server is running on port 8080")
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}

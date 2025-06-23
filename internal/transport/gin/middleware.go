package gin

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/pkg/contextx"
	"github.com/gin-gonic/gin"
)

// ginContextKey 用於 context.Context 存取 gin.Context
var ginContextKey = struct{}{}

// GinContextToContextMiddleware 將 gin.Context 注入到 context.Context
func GinContextToContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), ginContextKey, c)
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

// CustomClaims 包含自定義的 JWT claims
type CustomClaims struct {
	Scope string `json:"scope"`
}

// Validate 驗證自定義 claims
func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

// EnsureValidToken 是一個 gin 中介軟體，用於驗證 JWT token
func EnsureValidToken(cfg config.Config) gin.HandlerFunc {
	issuerURL, err := url.Parse("https://" + cfg.Auth0.Domain + "/")
	if err != nil {
		log.Fatalf("解析 issuer URL 失敗: %v", err)
	}

	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{cfg.Auth0.Audience},
		validator.WithCustomClaims(
			func() validator.CustomClaims {
				return &CustomClaims{}
			},
		),
		validator.WithAllowedClockSkew(time.Minute),
	)
	if err != nil {
		log.Fatalf("建立 JWT validator 失敗: %v", err)
	}

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "缺少 Authorization header"})
			c.Abort()
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header 格式無效"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwtValidator.ValidateToken(c.Request.Context(), tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "無效的 token"})
			c.Abort()
			return
		}

		// 🔥 重要：設定用戶 ID 到自定義 context
		// 從驗證後的 token 中提取用戶 ID (subject)
		validatedClaims, ok := token.(*validator.ValidatedClaims)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "無法提取 token claims"})
			c.Abort()
			return
		}

		ctxWithUser := contextx.WithUserID(c.Request.Context(), validatedClaims.RegisteredClaims.Subject)
		c.Request = c.Request.WithContext(ctxWithUser)

		// 將 token 也存儲在 gin context 中供後續處理使用
		c.Set("token", token)
		c.Next()
	}
}

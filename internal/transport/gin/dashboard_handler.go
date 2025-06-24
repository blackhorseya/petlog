package gin

import (
	"context"
	"net/http"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/gin-gonic/gin"
	httptransport "github.com/go-kit/kit/transport/http"
)

// RegisterDashboardRoutes 註冊 dashboard 相關路由
func RegisterDashboardRoutes(r *gin.Engine, cfg config.Config, e endpoint.DashboardEndpoints, options ...httptransport.ServerOption) {
	opts := []httptransport.ServerOption{
		httptransport.ServerErrorHandler(NewContextualLogErrorHandler()),
		httptransport.ServerErrorEncoder(encodeError),
	}
	opts = append(opts, options...)

	v1 := r.Group("/api/v1")
	dashboardRoutes := v1.Group("/dashboard")
	dashboardRoutes.Use(EnsureValidToken(cfg))
	{
		dashboardRoutes.GET("/overview", GetDashboardOverview(e, opts...))
	}
}

// GetDashboardOverview godoc
// @Summary      首頁快速概覽
// @Description  回傳目前登入使用者的寵物數量與健康日誌數量
// @Tags         dashboard
// @Accept       json
// @Produce      json
// @Success      200  {object}  endpoint.GetDashboardOverviewResponse
// @Failure      401  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/dashboard/overview [get]
func GetDashboardOverview(e endpoint.DashboardEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.GetOverviewEndpoint,
		decodeGetDashboardOverviewRequest,
		encodeResponse,
		options...,
	))
}

// decodeGetDashboardOverviewRequest 解析請求（可從 context 取得 userID）
func decodeGetDashboardOverviewRequest(_ context.Context, r *http.Request) (interface{}, error) {
	// TODO: 從 JWT context 取得 userID，並包裝成 endpoint.GetDashboardOverviewRequest
	return endpoint.GetDashboardOverviewRequest{}, nil
}

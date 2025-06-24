package endpoint

import (
	"context"

	"github.com/blackhorseya/petlog/internal/usecase/query"
	"github.com/go-kit/kit/endpoint"
)

// GetDashboardOverviewRequest 定義首頁快速概覽 API 的請求結構
// 目前無需欄位，僅需驗證 JWT
// swagger:parameters GetDashboardOverview
type GetDashboardOverviewRequest struct{}

// GetDashboardOverviewResponse 定義首頁快速概覽 API 的回應結構
// swagger:model GetDashboardOverviewResponse
type GetDashboardOverviewResponse struct {
	// 寵物數量
	// example: 2
	PetCount int `json:"petCount"`
	// 健康日誌數量
	// example: 10
	HealthRecordCount int `json:"healthRecordCount"`
}

// MakeDashboardOverviewEndpoint 建立首頁快速概覽 endpoint
func MakeDashboardOverviewEndpoint(qh *query.GetDashboardOverviewHandler) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		// TODO: 由 JWT context 取得 userID
		// req := request.(GetDashboardOverviewRequest)
		// userID := ...
		// result, err := qh.Handle(ctx, query.GetDashboardOverviewQuery{OwnerID: userID})
		// if err != nil {
		// 	return nil, err
		// }
		// return GetDashboardOverviewResponse{PetCount: result.PetCount, HealthRecordCount: result.HealthRecordCount}, nil
		return nil, nil
	}
}

// DashboardEndpoints 聚合 dashboard 相關 endpoint
// 方便依賴注入
type DashboardEndpoints struct {
	GetDashboardOverviewEndpoint endpoint.Endpoint
}

// NewDashboardEndpoints 建構 DashboardEndpoints
func NewDashboardEndpoints(getDashboardOverview endpoint.Endpoint) DashboardEndpoints {
	return DashboardEndpoints{
		GetDashboardOverviewEndpoint: getDashboardOverview,
	}
}

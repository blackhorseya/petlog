package endpoint

import (
	"context"

	"github.com/blackhorseya/petlog/internal/usecase/query"
	"github.com/blackhorseya/petlog/pkg/contextx"
	"github.com/go-kit/kit/endpoint"
)

// ErrInvalidRequestType 代表 request 型別錯誤
// GetDashboardOverviewRequest 定義首頁快速概覽 API 的請求結構
// 目前無需欄位，僅需驗證 JWT
// swagger:parameters GetDashboardOverview
type GetDashboardOverviewRequest struct{}

// GetDashboardOverviewResponse 定義首頁快速概覽 API 的回應結構
// swagger:model GetDashboardOverviewResponse
type GetDashboardOverviewResponse struct {
	// 寵物數量
	// example: 2
	PetCount int `json:"pet_count"`
	// 健康日誌數量
	// example: 10
	HealthRecordCount int   `json:"health_record_count"`
	Err               error `json:"error,omitempty"`
}

func (r GetDashboardOverviewResponse) Failed() error { return r.Err }

// DashboardEndpoints 聚合 Dashboard 相關 endpoint
//
// 目前僅包含 GetOverview，可依需求擴充
type DashboardEndpoints struct {
	GetOverviewEndpoint endpoint.Endpoint
}

// NewDashboardEndpoints 建立 DashboardEndpoints 供 wire 注入
func NewDashboardEndpoints(handler *query.GetDashboardOverviewHandler) DashboardEndpoints {
	return DashboardEndpoints{
		GetOverviewEndpoint: MakeGetDashboardOverviewEndpoint(handler),
	}
}

// MakeGetDashboardOverviewEndpoint 建立 GetOverview endpoint
func MakeGetDashboardOverviewEndpoint(handler *query.GetDashboardOverviewHandler) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		// 從 context 取得 userID
		userID, err := contextx.GetUserID(ctx)
		if err != nil {
			return GetDashboardOverviewResponse{Err: err}, nil
		}

		q := query.GetDashboardOverviewQuery{
			OwnerID: userID,
		}

		result, err := handler.Handle(ctx, q)
		if err != nil {
			return GetDashboardOverviewResponse{Err: err}, nil
		}

		return GetDashboardOverviewResponse{
			PetCount:          result.PetCount,
			HealthRecordCount: result.HealthRecordCount,
		}, nil
	}
}

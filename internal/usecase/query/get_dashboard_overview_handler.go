package query

import (
	"context"
	"errors"

	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// GetDashboardOverviewQuery 聚合查詢參數
// 目前僅需 ownerID
type GetDashboardOverviewQuery struct {
	OwnerID string
}

// GetDashboardOverviewResult 聚合查詢結果
type GetDashboardOverviewResult struct {
	PetCount          int
	HealthRecordCount int
}

// GetDashboardOverviewHandler 聚合查詢 handler
type GetDashboardOverviewHandler struct {
	petRepo       repository.PetRepository
	healthlogRepo repository.HealthLogRepository
}

// NewGetDashboardOverviewHandler 建構函式
func NewGetDashboardOverviewHandler(petRepo repository.PetRepository, healthlogRepo repository.HealthLogRepository) *GetDashboardOverviewHandler {
	return &GetDashboardOverviewHandler{
		petRepo:       petRepo,
		healthlogRepo: healthlogRepo,
	}
}

// Handle 執行聚合查詢
func (h *GetDashboardOverviewHandler) Handle(c context.Context, q GetDashboardOverviewQuery) (*GetDashboardOverviewResult, error) {
	// TODO: 1. 取得該 owner 的所有 petIDs
	// TODO: 2. 統計寵物數量
	// TODO: 3. 統計健康日誌數量（用 petIDs）
	return nil, errors.New("not implemented")
}

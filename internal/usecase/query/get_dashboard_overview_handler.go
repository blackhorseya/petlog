package query

import (
	"context"
	"fmt"

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
	// 1. 取得該 owner 的所有 petIDs
	petIDs, err := h.petRepo.FindIDsByOwnerID(c, q.OwnerID)
	if err != nil {
		return nil, fmt.Errorf("查詢寵物 ID 失敗: %w", err)
	}

	// 2. 統計寵物數量
	petCount := len(petIDs)

	// 3. 統計健康日誌數量（用 petIDs）
	healthRecordCount := 0
	if petCount > 0 {
		healthRecordCount, err = h.healthlogRepo.CountByPetIDs(c, petIDs)
		if err != nil {
			return nil, fmt.Errorf("統計健康日誌數量失敗: %w", err)
		}
	}

	return &GetDashboardOverviewResult{
		PetCount:          petCount,
		HealthRecordCount: healthRecordCount,
	}, nil
}

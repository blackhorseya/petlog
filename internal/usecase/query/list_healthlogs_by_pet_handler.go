package query

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// ListHealthLogsByPetQuery 表示列出寵物健康日誌的查詢請求
type ListHealthLogsByPetQuery struct {
	PetID     string    `json:"pet_id"`
	StartDate time.Time `json:"start_date,omitempty"`
	EndDate   time.Time `json:"end_date,omitempty"`
}

// ListHealthLogsByPetHandler 處理列出寵物健康日誌的查詢
type ListHealthLogsByPetHandler struct {
	healthLogRepo repository.HealthLogRepository
}

// NewListHealthLogsByPetHandler 建立新的 ListHealthLogsByPetHandler
func NewListHealthLogsByPetHandler(healthLogRepo repository.HealthLogRepository) *ListHealthLogsByPetHandler {
	if healthLogRepo == nil {
		panic("healthLogRepo is required")
	}
	return &ListHealthLogsByPetHandler{
		healthLogRepo: healthLogRepo,
	}
}

// Handle 執行列出寵物健康日誌的查詢
func (h *ListHealthLogsByPetHandler) Handle(c context.Context, query ListHealthLogsByPetQuery) ([]*model.HealthLog, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return nil, fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("處理列出健康日誌查詢請求", "user_id", userID, "pet_id", query.PetID)

	// 如果沒有指定日期範圍，設定預設值（過去一年到現在）
	startDate := query.StartDate
	endDate := query.EndDate
	
	if startDate.IsZero() {
		startDate = time.Now().AddDate(-1, 0, 0) // 一年前
	}
	
	if endDate.IsZero() {
		endDate = time.Now() // 現在
	}

	// TODO: 這裡可能需要新增驗證邏輯，確保使用者擁有該寵物的存取權限
	// 這需要透過 PetRepository 來驗證寵物的擁有者。目前為了簡化先跳過此驗證

	// 從倉儲取得健康日誌列表
	logs, err := h.healthLogRepo.FindByPetID(ctx, query.PetID, startDate, endDate)
	if err != nil {
		ctx.Error("從倉儲取得健康日誌列表失敗", "error", err, "pet_id", query.PetID)
		return nil, fmt.Errorf("取得健康日誌列表失敗: %w", err)
	}

	ctx.Info("成功取得健康日誌列表", "pet_id", query.PetID, "count", len(logs))

	return logs, nil
}
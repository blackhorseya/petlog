package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// GetHealthLogByIDQuery 表示根據 ID 取得健康日誌的查詢請求
type GetHealthLogByIDQuery struct {
	ID string `json:"id"`
}

// GetHealthLogByIDHandler 處理根據 ID 取得健康日誌的查詢
type GetHealthLogByIDHandler struct {
	healthLogRepo repository.HealthLogRepository
}

// NewGetHealthLogByIDHandler 建立新的 GetHealthLogByIDHandler
func NewGetHealthLogByIDHandler(healthLogRepo repository.HealthLogRepository) *GetHealthLogByIDHandler {
	if healthLogRepo == nil {
		panic("healthLogRepo is required")
	}
	return &GetHealthLogByIDHandler{
		healthLogRepo: healthLogRepo,
	}
}

// Handle 執行根據 ID 取得健康日誌的查詢
func (h *GetHealthLogByIDHandler) Handle(c context.Context, query GetHealthLogByIDQuery) (*model.HealthLog, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return nil, fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("處理取得健康日誌查詢請求", "user_id", userID, "log_id", query.ID)

	// 從倉儲取得健康日誌
	log, err := h.healthLogRepo.FindByID(ctx, query.ID)
	if err != nil {
		ctx.Error("從倉儲取得健康日誌失敗", "error", err, "log_id", query.ID)
		return nil, fmt.Errorf("取得健康日誌失敗: %w", err)
	}

	// TODO: 這裡可能需要新增驗證邏輯，確保使用者擁有該寵物的健康日誌存取權限
	// 這需要透過 PetRepository 來驗證寵物的擁有者。目前為了簡化先跳過此驗證

	ctx.Info("成功取得健康日誌", "log_id", log.ID, "pet_id", log.PetID)

	return log, nil
}
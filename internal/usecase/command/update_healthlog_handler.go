package command

import (
	"context"
	"fmt"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// UpdateHealthLogCommand 表示更新健康日誌的命令請求
type UpdateHealthLogCommand struct {
	ID             string    `json:"id"`
	PetID          string    `json:"pet_id"`
	Date           time.Time `json:"date"`
	WeightKg       float64   `json:"weight_kg,omitempty"`
	FoodGram       int       `json:"food_gram,omitempty"`
	LitterNotes    string    `json:"litter_notes,omitempty"`
	BehaviourNotes string    `json:"behaviour_notes,omitempty"`
}

// UpdateHealthLogHandler 處理更新健康日誌的命令
type UpdateHealthLogHandler struct {
	healthLogRepo repository.HealthLogRepository
}

// NewUpdateHealthLogHandler 建立新的 UpdateHealthLogHandler
func NewUpdateHealthLogHandler(healthLogRepo repository.HealthLogRepository) *UpdateHealthLogHandler {
	if healthLogRepo == nil {
		panic("healthLogRepo is required")
	}
	return &UpdateHealthLogHandler{
		healthLogRepo: healthLogRepo,
	}
}

// Handle 執行更新健康日誌的命令
func (h *UpdateHealthLogHandler) Handle(c context.Context, cmd UpdateHealthLogCommand) (*model.HealthLog, error) {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return nil, fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("處理更新健康日誌請求", "user_id", userID, "log_id", cmd.ID)

	// 首先檢查健康日誌是否存在
	_, err = h.healthLogRepo.FindByID(ctx, cmd.ID)
	if err != nil {
		ctx.Error("查找要更新的健康日誌失敗", "error", err, "log_id", cmd.ID)
		return nil, fmt.Errorf("查找健康日誌失敗: %w", err)
	}

	// TODO: 這裡可能需要新增驗證邏輯，確保使用者擁有該寵物的健康日誌存取權限
	// 這需要透過 PetRepository 來驗證寵物的擁有者。目前為了簡化先跳過此驗證

	// 更新健康日誌資料
	updatedLog := &model.HealthLog{
		ID:             cmd.ID,
		PetID:          cmd.PetID,
		Date:           cmd.Date,
		WeightKg:       cmd.WeightKg,
		FoodGram:       cmd.FoodGram,
		LitterNotes:    cmd.LitterNotes,
		BehaviourNotes: cmd.BehaviourNotes,
	}

	if err := h.healthLogRepo.Update(ctx, updatedLog); err != nil {
		ctx.Error("在倉儲中更新健康日誌失敗", "error", err, "log_id", cmd.ID)
		return nil, fmt.Errorf("更新健康日誌失敗: %w", err)
	}

	ctx.Info("成功更新健康日誌", "log_id", updatedLog.ID, "pet_id", updatedLog.PetID)

	return updatedLog, nil
}
package command

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// DeleteHealthLogCommand 表示刪除健康日誌的命令請求
type DeleteHealthLogCommand struct {
	ID string `json:"id"`
}

// DeleteHealthLogHandler 處理刪除健康日誌的命令
type DeleteHealthLogHandler struct {
	healthLogRepo repository.HealthLogRepository
}

// NewDeleteHealthLogHandler 建立新的 DeleteHealthLogHandler
func NewDeleteHealthLogHandler(healthLogRepo repository.HealthLogRepository) *DeleteHealthLogHandler {
	if healthLogRepo == nil {
		panic("healthLogRepo is required")
	}
	return &DeleteHealthLogHandler{
		healthLogRepo: healthLogRepo,
	}
}

// Handle 執行刪除健康日誌的命令
func (h *DeleteHealthLogHandler) Handle(c context.Context, cmd DeleteHealthLogCommand) error {
	ctx := contextx.WithContext(c)

	userID, err := contextx.GetUserID(ctx)
	if err != nil {
		return fmt.Errorf("user ID not found in context: %w", err)
	}

	ctx.Info("處理刪除健康日誌請求", "user_id", userID, "log_id", cmd.ID)

	// 首先檢查健康日誌是否存在
	existingLog, err := h.healthLogRepo.FindByID(ctx, cmd.ID)
	if err != nil {
		ctx.Error("查找要刪除的健康日誌失敗", "error", err, "log_id", cmd.ID)
		return fmt.Errorf("查找健康日誌失敗: %w", err)
	}

	// TODO: 這裡可能需要新增驗證邏輯，確保使用者擁有該寵物的健康日誌存取權限
	// 這需要透過 PetRepository 來驗證寵物的擁有者。目前為了簡化先跳過此驗證

	if err := h.healthLogRepo.Delete(ctx, cmd.ID); err != nil {
		ctx.Error("在倉儲中刪除健康日誌失敗", "error", err, "log_id", cmd.ID)
		return fmt.Errorf("刪除健康日誌失敗: %w", err)
	}

	ctx.Info("成功刪除健康日誌", "log_id", cmd.ID, "pet_id", existingLog.PetID)

	return nil
}
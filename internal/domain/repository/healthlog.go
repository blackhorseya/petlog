//go:generate go tool mockgen -destination=./mock_${GOFILE} -package=${GOPACKAGE} -source=${GOFILE}

package repository

import (
	"context"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// HealthLogRepository 定義了健康日誌資料持久化的介面
type HealthLogRepository interface {
	// Create 建立新的健康日誌記錄
	Create(c context.Context, log *model.HealthLog) error

	// FindByID 根據 ID 查詢健康日誌
	FindByID(c context.Context, id string) (*model.HealthLog, error)

	// FindByPetID 查詢指定寵物在指定時間範圍內的健康日誌
	FindByPetID(c context.Context, petID string, startDate, endDate time.Time) ([]*model.HealthLog, error)

	// CountByPetIDs 統計指定寵物 ID 群組的健康日誌總數（用於聚合查詢）
	CountByPetIDs(c context.Context, petIDs []string) (int, error)

	// Update 更新健康日誌資訊
	Update(c context.Context, log *model.HealthLog) error

	// Delete 刪除健康日誌記錄
	Delete(c context.Context, id string) error
}

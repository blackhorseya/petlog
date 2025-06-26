package command

import (
	"context"

	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// DeleteMedicalRecordHandler 負責刪除醫療記錄
type DeleteMedicalRecordHandler struct {
	repo repository.MedicalRecordRepository
}

// NewDeleteMedicalRecordHandler 建立 handler 實例
func NewDeleteMedicalRecordHandler(repo repository.MedicalRecordRepository) *DeleteMedicalRecordHandler {
	return &DeleteMedicalRecordHandler{repo: repo}
}

// Handle 執行刪除醫療記錄邏輯
func (h *DeleteMedicalRecordHandler) Handle(c context.Context, id string) error {
	return h.repo.Delete(c, id)
}

package command

import (
	"context"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// UpdateMedicalRecordHandler 負責更新醫療記錄
type UpdateMedicalRecordHandler struct {
	repo repository.MedicalRecordRepository
}

// NewUpdateMedicalRecordHandler 建立 handler 實例
func NewUpdateMedicalRecordHandler(repo repository.MedicalRecordRepository) *UpdateMedicalRecordHandler {
	return &UpdateMedicalRecordHandler{repo: repo}
}

// Handle 執行更新醫療記錄邏輯
func (h *UpdateMedicalRecordHandler) Handle(c context.Context, record *model.MedicalRecord) error {
	return h.repo.Update(c, record)
}

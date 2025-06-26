package command

import (
	"context"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// CreateMedicalRecordHandler 負責建立新的醫療記錄
// 依照專案規範，所有錯誤皆需標準化處理
type CreateMedicalRecordHandler struct {
	repo repository.MedicalRecordRepository
}

// NewCreateMedicalRecordHandler 建立 handler 實例
func NewCreateMedicalRecordHandler(repo repository.MedicalRecordRepository) *CreateMedicalRecordHandler {
	return &CreateMedicalRecordHandler{repo: repo}
}

// Handle 執行建立醫療記錄邏輯
func (h *CreateMedicalRecordHandler) Handle(c context.Context, record *model.MedicalRecord) error {
	return h.repo.Create(c, record)
}

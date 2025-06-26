package query

import (
	"context"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// GetMedicalRecordByIDHandler 負責根據 ID 取得醫療記錄
type GetMedicalRecordByIDHandler struct {
	repo repository.MedicalRecordRepository
}

// NewGetMedicalRecordByIDHandler 建立 handler 實例
func NewGetMedicalRecordByIDHandler(repo repository.MedicalRecordRepository) *GetMedicalRecordByIDHandler {
	return &GetMedicalRecordByIDHandler{repo: repo}
}

// Handle 執行查詢邏輯
func (h *GetMedicalRecordByIDHandler) Handle(c context.Context, id string) (*model.MedicalRecord, error) {
	return h.repo.FindByID(c, id)
}

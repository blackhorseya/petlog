package query

import (
	"context"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// ListMedicalRecordsByPetHandler 負責依寵物 ID 及日期範圍查詢醫療記錄
type ListMedicalRecordsByPetHandler struct {
	repo repository.MedicalRecordRepository
}

// NewListMedicalRecordsByPetHandler 建立 handler 實例
func NewListMedicalRecordsByPetHandler(repo repository.MedicalRecordRepository) *ListMedicalRecordsByPetHandler {
	return &ListMedicalRecordsByPetHandler{repo: repo}
}

// Handle 執行查詢邏輯
func (h *ListMedicalRecordsByPetHandler) Handle(c context.Context, petID string, startDate, endDate time.Time) ([]*model.MedicalRecord, error) {
	return h.repo.FindByPetID(c, petID, startDate, endDate)
}

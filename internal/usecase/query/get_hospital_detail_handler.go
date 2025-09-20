package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// GetHospitalDetailQuery 取得醫院詳細資訊查詢參數
type GetHospitalDetailQuery struct {
	HospitalID string // 醫院 ID
}

// GetHospitalDetailHandler 處理取得醫院詳細資訊查詢
type GetHospitalDetailHandler struct {
	hospitalRepo repository.HospitalRepository
}

// NewGetHospitalDetailHandler 建立醫院詳細資訊處理器
func NewGetHospitalDetailHandler(hospitalRepo repository.HospitalRepository) *GetHospitalDetailHandler {
	if hospitalRepo == nil {
		panic("hospitalRepo is required")
	}
	return &GetHospitalDetailHandler{
		hospitalRepo: hospitalRepo,
	}
}

// Handle 執行取得醫院詳細資訊查詢
func (h *GetHospitalDetailHandler) Handle(c context.Context, qry GetHospitalDetailQuery) (*model.Hospital, error) {
	ctx := contextx.WithContext(c)

	ctx.Info("handling get hospital detail request", "hospital_id", qry.HospitalID)

	hospital, err := h.hospitalRepo.GetByID(ctx, qry.HospitalID)
	if err != nil {
		return nil, fmt.Errorf("failed to get hospital with id %s: %w", qry.HospitalID, err)
	}

	ctx.Info("get hospital detail completed",
		"hospital_id", hospital.ID(),
		"hospital_name", hospital.Name(),
	)

	return hospital, nil
}
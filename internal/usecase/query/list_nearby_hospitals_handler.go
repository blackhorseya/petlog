package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// ListNearbyHospitalsQuery 附近醫院查詢參數
type ListNearbyHospitalsQuery struct {
	Latitude  float64 // 使用者位置緯度
	Longitude float64 // 使用者位置經度
	RadiusKm  float64 // 搜尋半徑（公里）
	Limit     int     // 結果數量限制
}

// ListNearbyHospitalsHandler 處理附近醫院查詢
type ListNearbyHospitalsHandler struct {
	hospitalRepo repository.HospitalRepository
}

// NewListNearbyHospitalsHandler 建立附近醫院查詢處理器
func NewListNearbyHospitalsHandler(hospitalRepo repository.HospitalRepository) *ListNearbyHospitalsHandler {
	if hospitalRepo == nil {
		panic("hospitalRepo is required")
	}
	return &ListNearbyHospitalsHandler{
		hospitalRepo: hospitalRepo,
	}
}

// Handle 執行附近醫院查詢
func (h *ListNearbyHospitalsHandler) Handle(c context.Context, qry ListNearbyHospitalsQuery) ([]*model.Hospital, error) {
	ctx := contextx.WithContext(c)

	ctx.Info("handling list nearby hospitals request",
		"latitude", qry.Latitude,
		"longitude", qry.Longitude,
		"radius_km", qry.RadiusKm,
		"limit", qry.Limit,
	)

	// 驗證座標有效性
	coordinates := model.NewCoordinates(qry.Latitude, qry.Longitude)
	if !coordinates.IsValid() {
		return nil, fmt.Errorf("invalid coordinates: lat=%f, lng=%f", qry.Latitude, qry.Longitude)
	}

	// 設定預設值
	if qry.RadiusKm <= 0 {
		qry.RadiusKm = 10.0 // 預設 10 公里
	}
	if qry.Limit <= 0 {
		qry.Limit = 50 // 預設最多 50 筆
	}

	// 建立查詢選項
	opts := []repository.NearbyOption{
		repository.WithCoordinates(coordinates),
		repository.WithRadius(qry.RadiusKm),
		repository.WithLimit(qry.Limit),
	}

	// 執行附近醫院查詢
	hospitals, err := h.hospitalRepo.GetNearby(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to get nearby hospitals: %w", err)
	}

	ctx.Info("list nearby hospitals completed",
		"found_count", len(hospitals),
		"search_radius", qry.RadiusKm,
	)

	return hospitals, nil
}
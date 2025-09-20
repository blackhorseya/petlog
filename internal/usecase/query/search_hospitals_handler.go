package query

import (
	"context"
	"fmt"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/blackhorseya/petlog/pkg/contextx"
)

// SearchHospitalsQuery 醫院搜尋查詢參數
type SearchHospitalsQuery struct {
	Keyword     string  // 搜尋關鍵字（醫院名稱、地址、獸醫師）
	County      string  // 縣市篩選
	Status      string  // 狀態篩選（開業、歇業等）
	LicenseType string  // 執照類型篩選（動物醫院、動物診所）
	Latitude    float64 // 座標緯度（選填，用於距離排序）
	Longitude   float64 // 座標經度（選填，用於距離排序）
	Radius      float64 // 搜尋半徑（公里，選填）
	Page        int     // 頁碼
	Limit       int     // 每頁數量
	SortBy      string  // 排序方式（distance, name）
}

// SearchHospitalsResponse 搜尋回應結果（包含統計資訊）
type SearchHospitalsResponse struct {
	Hospitals []*model.Hospital `json:"hospitals"`
	Total     int64             `json:"total"`
	Page      int               `json:"page"`
	Limit     int               `json:"limit"`
	Stats     SearchStats       `json:"stats"`
}

// SearchStats 搜尋統計資訊
type SearchStats struct {
	TotalHospitals int64            `json:"total_hospitals"`
	ByStatus       map[string]int64 `json:"by_status"`
	ByLicenseType  map[string]int64 `json:"by_license_type"`
	ByCounty       map[string]int64 `json:"by_county"`
}

// SearchHospitalsHandler 處理醫院搜尋查詢
type SearchHospitalsHandler struct {
	hospitalRepo repository.HospitalRepository
}

// NewSearchHospitalsHandler 建立醫院搜尋處理器
func NewSearchHospitalsHandler(hospitalRepo repository.HospitalRepository) *SearchHospitalsHandler {
	if hospitalRepo == nil {
		panic("hospitalRepo is required")
	}
	return &SearchHospitalsHandler{
		hospitalRepo: hospitalRepo,
	}
}

// Handle 執行醫院搜尋查詢
func (h *SearchHospitalsHandler) Handle(c context.Context, qry SearchHospitalsQuery) (*SearchHospitalsResponse, error) {
	ctx := contextx.WithContext(c)

	ctx.Info("handling search hospitals request",
		"keyword", qry.Keyword,
		"county", qry.County,
		"status", qry.Status,
		"license_type", qry.LicenseType,
		"page", qry.Page,
		"limit", qry.Limit,
	)

	// 設定預設分頁參數
	if qry.Limit <= 0 {
		qry.Limit = 20
	}
	if qry.Page <= 0 {
		qry.Page = 1
	}

	// 計算跳過的記錄數
	skip := (qry.Page - 1) * qry.Limit

	// 建立搜尋選項
	var opts []repository.SearchOption

	if qry.Keyword != "" {
		opts = append(opts, repository.WithKeyword(qry.Keyword))
	}

	if qry.County != "" {
		opts = append(opts, repository.WithCounty(qry.County))
	}

	if qry.Status != "" {
		opts = append(opts, repository.WithStatus(qry.Status))
	}

	opts = append(opts, repository.WithPagination(qry.Limit, skip))

	// 執行搜尋
	result, err := h.hospitalRepo.Search(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to search hospitals: %w", err)
	}

	// 執行 LicenseType 篩選（在應用層處理，因為 repository 層可能尚未支援）
	if qry.LicenseType != "" {
		filteredHospitals := make([]*model.Hospital, 0)
		for _, hospital := range result.Hospitals {
			if hospital.LicenseType() == qry.LicenseType {
				filteredHospitals = append(filteredHospitals, hospital)
			}
		}
		result.Hospitals = filteredHospitals
		result.Total = int64(len(filteredHospitals))
	}

	// 如果有座標資訊且在合理範圍內，進行距離篩選
	if qry.Latitude != 0 && qry.Longitude != 0 && qry.Radius > 0 {
		coords := model.NewCoordinates(qry.Latitude, qry.Longitude)
		if coords.IsValid() {
			// 過濾距離超出範圍的醫院
			filteredHospitals := make([]*model.Hospital, 0)
			for _, hospital := range result.Hospitals {
				if hospital.IsNearby(coords, qry.Radius) {
					filteredHospitals = append(filteredHospitals, hospital)
				}
			}
			result.Hospitals = filteredHospitals
			result.Total = int64(len(filteredHospitals))
		}
	}

	// 生成統計資訊
	stats, err := h.generateStats(ctx, result.Hospitals)
	if err != nil {
		ctx.Warn("failed to generate stats", "error", err)
		stats = SearchStats{} // 使用空統計，不阻擋主要功能
	}

	// 建立回應
	response := &SearchHospitalsResponse{
		Hospitals: result.Hospitals,
		Total:     result.Total,
		Page:      qry.Page,
		Limit:     qry.Limit,
		Stats:     stats,
	}

	ctx.Info("search hospitals completed",
		"total_found", response.Total,
		"returned_count", len(response.Hospitals),
		"page", response.Page,
	)

	return response, nil
}

// generateStats 生成搜尋統計資訊
func (h *SearchHospitalsHandler) generateStats(ctx *contextx.Contextx, hospitals []*model.Hospital) (SearchStats, error) {
	stats := SearchStats{
		TotalHospitals: int64(len(hospitals)),
		ByStatus:       make(map[string]int64),
		ByLicenseType:  make(map[string]int64),
		ByCounty:       make(map[string]int64),
	}

	// 統計各項分布
	for _, hospital := range hospitals {
		// 狀態統計
		status := hospital.Status()
		if status != "" {
			stats.ByStatus[status]++
		}

		// 執照類型統計
		licenseType := hospital.LicenseType()
		if licenseType != "" {
			stats.ByLicenseType[licenseType]++
		}

		// 縣市統計
		county := hospital.County()
		if county != "" {
			stats.ByCounty[county]++
		}
	}

	return stats, nil
}
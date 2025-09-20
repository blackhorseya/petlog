package endpoint

import (
	"context"
	"time"

	"github.com/go-kit/kit/endpoint"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/usecase/query"
)

// HospitalDTO 醫院資料傳輸物件
type HospitalDTO struct {
	ID           string      `json:"id"`
	Name         string      `json:"name"`
	Address      string      `json:"address"`
	Phone        string      `json:"phone"`
	County       string      `json:"county"`
	Veterinarian string      `json:"veterinarian"`
	LicenseType  string      `json:"license_type"`
	LicenseNo    string      `json:"license_no"`
	Status       string      `json:"status"`
	IssuedDate   string      `json:"issued_date"`
	Coordinates  Coordinates `json:"coordinates"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

// Coordinates DTO 座標資料傳輸物件
type Coordinates struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// ToHospitalDTO 將領域模型轉換為 DTO
func ToHospitalDTO(hospital *model.Hospital) *HospitalDTO {
	return &HospitalDTO{
		ID:           hospital.ID(),
		Name:         hospital.Name(),
		Address:      hospital.Address(),
		Phone:        hospital.Phone(),
		County:       hospital.County(),
		Veterinarian: hospital.Veterinarian(),
		LicenseType:  hospital.LicenseType(),
		LicenseNo:    hospital.LicenseNo(),
		Status:       hospital.Status(),
		IssuedDate:   hospital.IssuedDate(),
		Coordinates: Coordinates{
			Latitude:  hospital.Coordinates().Latitude(),
			Longitude: hospital.Coordinates().Longitude(),
		},
		CreatedAt: hospital.CreatedAt(),
		UpdatedAt: hospital.UpdatedAt(),
	}
}

// ToHospitalDTOs 批次轉換醫院列表為 DTO
func ToHospitalDTOs(hospitals []*model.Hospital) []*HospitalDTO {
	dtos := make([]*HospitalDTO, len(hospitals))
	for i, hospital := range hospitals {
		dtos[i] = ToHospitalDTO(hospital)
	}
	return dtos
}

// HospitalEndpoints 醫院服務端點集合
type HospitalEndpoints struct {
	SearchHospitalsEndpoint     endpoint.Endpoint
	GetHospitalDetailEndpoint   endpoint.Endpoint
	ListNearbyHospitalsEndpoint endpoint.Endpoint
}

// MakeHospitalEndpoints 建立醫院端點集合
func MakeHospitalEndpoints(
	sh *query.SearchHospitalsHandler,
	gh *query.GetHospitalDetailHandler,
	nh *query.ListNearbyHospitalsHandler,
) HospitalEndpoints {
	return HospitalEndpoints{
		SearchHospitalsEndpoint:     MakeSearchHospitalsEndpoint(sh),
		GetHospitalDetailEndpoint:   MakeGetHospitalDetailEndpoint(gh),
		ListNearbyHospitalsEndpoint: MakeListNearbyHospitalsEndpoint(nh),
	}
}

// SearchHospitals 搜尋醫院
type SearchHospitalsRequest struct {
	Keyword     string  `json:"keyword,omitempty"`     // 搜尋關鍵字
	County      string  `json:"county,omitempty"`      // 縣市篩選
	Status      string  `json:"status,omitempty"`      // 狀態篩選
	LicenseType string  `json:"license_type,omitempty"` // 執照類型篩選
	Latitude    float64 `json:"latitude,omitempty"`    // 座標緯度
	Longitude   float64 `json:"longitude,omitempty"`   // 座標經度
	Radius      float64 `json:"radius,omitempty"`      // 搜尋半徑（公里）
	Page        int     `json:"page,omitempty"`        // 頁碼
	Limit       int     `json:"limit,omitempty"`       // 每頁數量
	SortBy      string  `json:"sort_by,omitempty"`     // 排序方式
}

type SearchHospitalsResponse struct {
	Hospitals []*HospitalDTO    `json:"hospitals"`
	Total     int64             `json:"total"`
	Page      int               `json:"page"`
	Limit     int               `json:"limit"`
	Stats     query.SearchStats `json:"stats"`
	Err       error             `json:"error,omitempty"`
}

func (r SearchHospitalsResponse) Failed() error { return r.Err }

func MakeSearchHospitalsEndpoint(h *query.SearchHospitalsHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(SearchHospitalsRequest)
		q := query.SearchHospitalsQuery{
			Keyword:     req.Keyword,
			County:      req.County,
			Status:      req.Status,
			LicenseType: req.LicenseType,
			Latitude:    req.Latitude,
			Longitude:   req.Longitude,
			Radius:      req.Radius,
			Page:        req.Page,
			Limit:       req.Limit,
			SortBy:      req.SortBy,
		}

		result, err := h.Handle(c, q)
		if err != nil {
			return SearchHospitalsResponse{Err: err}, nil
		}

		return SearchHospitalsResponse{
			Hospitals: ToHospitalDTOs(result.Hospitals),
			Total:     result.Total,
			Page:      result.Page,
			Limit:     result.Limit,
			Stats:     result.Stats,
			Err:       nil,
		}, nil
	}
}

// GetHospitalDetail 取得醫院詳細資訊
type GetHospitalDetailRequest struct {
	HospitalID string `json:"hospital_id"`
}

type GetHospitalDetailResponse struct {
	Hospital *HospitalDTO `json:"hospital"`
	Err      error        `json:"error,omitempty"`
}

func (r GetHospitalDetailResponse) Failed() error { return r.Err }

func MakeGetHospitalDetailEndpoint(h *query.GetHospitalDetailHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(GetHospitalDetailRequest)
		q := query.GetHospitalDetailQuery{HospitalID: req.HospitalID}

		hospital, err := h.Handle(c, q)
		if err != nil {
			return GetHospitalDetailResponse{Err: err}, nil
		}

		return GetHospitalDetailResponse{Hospital: ToHospitalDTO(hospital), Err: nil}, nil
	}
}

// ListNearbyHospitals 附近醫院查詢
type ListNearbyHospitalsRequest struct {
	Latitude  float64 `json:"latitude"`  // 使用者位置緯度
	Longitude float64 `json:"longitude"` // 使用者位置經度
	RadiusKm  float64 `json:"radius_km"` // 搜尋半徑（公里）
	Limit     int     `json:"limit"`     // 結果數量限制
}

type ListNearbyHospitalsResponse struct {
	Hospitals []*HospitalDTO `json:"hospitals"`
	Err       error          `json:"error,omitempty"`
}

func (r ListNearbyHospitalsResponse) Failed() error { return r.Err }

func MakeListNearbyHospitalsEndpoint(h *query.ListNearbyHospitalsHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(ListNearbyHospitalsRequest)
		q := query.ListNearbyHospitalsQuery{
			Latitude:  req.Latitude,
			Longitude: req.Longitude,
			RadiusKm:  req.RadiusKm,
			Limit:     req.Limit,
		}

		hospitals, err := h.Handle(c, q)
		if err != nil {
			return ListNearbyHospitalsResponse{Err: err}, nil
		}

		return ListNearbyHospitalsResponse{Hospitals: ToHospitalDTOs(hospitals), Err: nil}, nil
	}
}
//go:generate mockgen -destination=./mock_${GOFILE} -package=${GOPACKAGE} -source=${GOFILE}

package repository

import (
	"context"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// SearchOptions 搜尋選項
type SearchOptions struct {
	keyword string
	county  string
	status  string
	limit   int
	skip    int
}

// SearchOption 搜尋選項函式
type SearchOption func(*SearchOptions)

// WithKeyword 設定關鍵字搜尋
func WithKeyword(keyword string) SearchOption {
	return func(opts *SearchOptions) {
		opts.keyword = keyword
	}
}

// WithCounty 設定縣市篩選
func WithCounty(county string) SearchOption {
	return func(opts *SearchOptions) {
		opts.county = county
	}
}

// WithStatus 設定狀態篩選
func WithStatus(status string) SearchOption {
	return func(opts *SearchOptions) {
		opts.status = status
	}
}

// WithPagination 設定分頁
func WithPagination(limit, skip int) SearchOption {
	return func(opts *SearchOptions) {
		opts.limit = limit
		opts.skip = skip
	}
}

// SearchResult 搜尋結果（包含總數）
type SearchResult struct {
	Hospitals []*model.Hospital `json:"hospitals"`
	Total     int64             `json:"total"`
}

// NearbyOptions 附近醫院搜尋選項
type NearbyOptions struct {
	coordinates model.Coordinates
	radiusKm    float64
	limit       int
}

// NearbyOption 附近搜尋選項函式
type NearbyOption func(*NearbyOptions)

// WithCoordinates 設定搜尋中心座標
func WithCoordinates(coords model.Coordinates) NearbyOption {
	return func(opts *NearbyOptions) {
		opts.coordinates = coords
	}
}

// WithRadius 設定搜尋半徑（公里）
func WithRadius(radiusKm float64) NearbyOption {
	return func(opts *NearbyOptions) {
		opts.radiusKm = radiusKm
	}
}

// WithLimit 設定結果數量限制
func WithLimit(limit int) NearbyOption {
	return func(opts *NearbyOptions) {
		opts.limit = limit
	}
}

// HospitalRepository 定義醫院資料持久化介面
type HospitalRepository interface {
	// Create 建立新醫院
	Create(c context.Context, hospital *model.Hospital) error

	// GetByID 根據 ID 取得單一醫院
	GetByID(c context.Context, id string) (*model.Hospital, error)

	// Search 搜尋醫院（支援關鍵字、縣市、狀態篩選和分頁）
	Search(c context.Context, opts ...SearchOption) (*SearchResult, error)

	// GetNearby 根據座標和半徑搜尋附近醫院
	GetNearby(c context.Context, opts ...NearbyOption) ([]*model.Hospital, error)

	// Update 更新醫院資訊
	Update(c context.Context, hospital *model.Hospital) error

	// Delete 刪除醫院
	Delete(c context.Context, id string) error

	// CountByStatus 統計各狀態醫院數量
	CountByStatus(c context.Context) (map[string]int64, error)
}

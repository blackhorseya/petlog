package model

import (
	"time"

	"github.com/blackhorseya/petlog/internal/domain"
)

// Coordinates 表示地理座標
type Coordinates struct {
	latitude  float64
	longitude float64
}

// NewCoordinates 建立座標
func NewCoordinates(lat, lng float64) Coordinates {
	return Coordinates{
		latitude:  lat,
		longitude: lng,
	}
}

// Latitude 取得緯度
func (c Coordinates) Latitude() float64 {
	return c.latitude
}

// Longitude 取得經度
func (c Coordinates) Longitude() float64 {
	return c.longitude
}

// IsValid 檢查座標是否有效
func (c Coordinates) IsValid() bool {
	return c.latitude >= -90 && c.latitude <= 90 &&
		c.longitude >= -180 && c.longitude <= 180
}

// Hospital 表示寵物醫院實體
type Hospital struct {
	id           string
	name         string
	address      string
	phone        string
	county       string
	veterinarian string
	licenseType  string
	licenseNo    string
	status       string
	issuedDate   string
	coordinates  Coordinates
	createdAt    time.Time
	updatedAt    time.Time
}

// HospitalOption 醫院建構選項
type HospitalOption func(*Hospital)

// WithCoordinates 設定座標
func WithCoordinates(coordinates Coordinates) HospitalOption {
	return func(h *Hospital) {
		h.coordinates = coordinates
	}
}

// WithIssuedDate 設定發照日期
func WithIssuedDate(date string) HospitalOption {
	return func(h *Hospital) {
		h.issuedDate = date
	}
}

// NewHospital 建立醫院實體使用 Options Pattern
func NewHospital(name, address, phone, county, veterinarian, licenseType, licenseNo, status string, opts ...HospitalOption) *Hospital {
	now := time.Now()
	h := &Hospital{
		name:         name,
		address:      address,
		phone:        phone,
		county:       county,
		veterinarian: veterinarian,
		licenseType:  licenseType,
		licenseNo:    licenseNo,
		status:       status,
		createdAt:    now,
		updatedAt:    now,
	}

	for _, opt := range opts {
		opt(h)
	}

	return h
}

// 查詢方法
func (h *Hospital) ID() string               { return h.id }
func (h *Hospital) Name() string             { return h.name }
func (h *Hospital) Address() string          { return h.address }
func (h *Hospital) Phone() string            { return h.phone }
func (h *Hospital) County() string           { return h.county }
func (h *Hospital) Veterinarian() string     { return h.veterinarian }
func (h *Hospital) LicenseType() string      { return h.licenseType }
func (h *Hospital) LicenseNo() string        { return h.licenseNo }
func (h *Hospital) Status() string           { return h.status }
func (h *Hospital) IssuedDate() string       { return h.issuedDate }
func (h *Hospital) Coordinates() Coordinates { return h.coordinates }
func (h *Hospital) CreatedAt() time.Time     { return h.createdAt }
func (h *Hospital) UpdatedAt() time.Time     { return h.updatedAt }

// 領域方法
func (h *Hospital) SetID(id string) {
	h.id = id
}

// IsOperating 檢查是否營業中
func (h *Hospital) IsOperating() bool {
	return h.status == "開業"
}

// IsNearby 檢查是否在指定座標附近（公里為單位）
func (h *Hospital) IsNearby(coords Coordinates, radiusKm float64) bool {
	if !h.coordinates.IsValid() || !coords.IsValid() {
		return false
	}
	// 簡化的距離計算，實際專案可使用更精確的地理計算
	latDiff := h.coordinates.latitude - coords.latitude
	lngDiff := h.coordinates.longitude - coords.longitude
	distance := (latDiff*latDiff + lngDiff*lngDiff) * 111 // 概略轉換為公里
	return distance <= radiusKm*radiusKm
}

// UpdateLocation 更新醫院位置
func (h *Hospital) UpdateLocation(coordinates Coordinates) error {
	if !coordinates.IsValid() {
		return domain.ErrInvalidCoordinates
	}
	h.coordinates = coordinates
	h.updatedAt = time.Now()
	return nil
}

// ChangeStatus 變更營業狀態
func (h *Hospital) ChangeStatus(newStatus string) {
	h.status = newStatus
	h.updatedAt = time.Now()
}

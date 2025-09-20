package main

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
)

// cleanPhone 清理電話號碼格式
func cleanPhone(phone string) string {
	if phone == "" {
		return ""
	}

	// 移除括號和空格
	phone = strings.ReplaceAll(phone, "(", "")
	phone = strings.ReplaceAll(phone, ")", "")
	phone = strings.ReplaceAll(phone, " ", "")
	phone = strings.ReplaceAll(phone, "-", "")

	// 只保留數字
	re := regexp.MustCompile(`\d+`)
	numbers := re.FindAllString(phone, -1)
	return strings.Join(numbers, "")
}

// cleanAddress 清理地址格式
func cleanAddress(address string) string {
	if address == "" {
		return ""
	}

	// 移除多餘空格
	address = strings.TrimSpace(address)
	re := regexp.MustCompile(`\s+`)
	return re.ReplaceAllString(address, "")
}

// formatIssuedDate 格式化發照日期 (YYYYMMDD -> YYYY-MM-DD)
func formatIssuedDate(date string) string {
	if len(date) != 8 {
		return date
	}

	return fmt.Sprintf("%s-%s-%s", date[:4], date[4:6], date[6:8])
}

// toDomain 將 JSON 資料轉換為領域模型（預覽模式使用）
func (h *hospitalJSON) toDomain(geocoder GeocodeService) (*model.Hospital, error) {
	if h == nil {
		return nil, fmt.Errorf("hospitalJSON is nil")
	}

	// 清理資料
	cleanedPhone := cleanPhone(h.Phone)
	cleanedAddress := cleanAddress(h.Address)
	formattedDate := formatIssuedDate(h.IssuedDate)

	// 建立選項
	var opts []model.HospitalOption

	// 如果有地理編碼服務，取得座標
	if geocoder != nil && cleanedAddress != "" {
		coords, geocoded := performGeocode(geocoder, cleanedAddress)
		if geocoded {
			opts = append(opts, model.WithCoordinates(coords))
		}
	}

	// 設定發照日期
	if formattedDate != "" {
		opts = append(opts, model.WithIssuedDate(formattedDate))
	}

	// 建立醫院實體
	hospital := model.NewHospital(
		h.Name,
		cleanedAddress,
		cleanedPhone,
		h.County,
		h.Veterinarian,
		h.LicenseType,
		h.LicenseNo,
		h.Status,
		opts...,
	)

	return hospital, nil
}

// toDomainWithLocationCheck 將 JSON 資料轉換為領域模型，檢查現有資料並決定是否需要地理編碼
func (h *hospitalJSON) toDomainWithLocationCheck(ctx context.Context, repo repository.HospitalRepository, geocoder GeocodeService) (*model.Hospital, bool, bool, error) {
	if h == nil {
		return nil, false, false, fmt.Errorf("hospitalJSON is nil")
	}

	// 清理資料
	cleanedPhone := cleanPhone(h.Phone)
	cleanedAddress := cleanAddress(h.Address)
	formattedDate := formatIssuedDate(h.IssuedDate)

	// 建立選項
	var opts []model.HospitalOption
	needsGeocode := false
	isUpdate := false

	var existingHospital *model.Hospital

	// 檢查醫院是否已存在（使用執照號碼作為唯一識別）
	if h.LicenseNo != "" {
		existing, err := repo.GetByLicenseNo(ctx, h.LicenseNo)
		if err == nil && existing != nil {
			existingHospital = existing
			isUpdate = true

			// 醫院已存在，檢查是否有有效座標
			coords := existing.Coordinates()
			if coords.IsValid() {
				// 已有有效座標，使用現有座標
				opts = append(opts, model.WithCoordinates(coords))
			} else {
				// 沒有有效座標，需要地理編碼
				if geocoder != nil && cleanedAddress != "" {
					coords, geocoded := performGeocode(geocoder, cleanedAddress)
					if geocoded {
						opts = append(opts, model.WithCoordinates(coords))
						needsGeocode = true
					}
				}
			}
		} else {
			// 新醫院，需要地理編碼
			if geocoder != nil && cleanedAddress != "" {
				coords, geocoded := performGeocode(geocoder, cleanedAddress)
				if geocoded {
					opts = append(opts, model.WithCoordinates(coords))
					needsGeocode = true
				}
			}
		}
	} else {
		// 沒有執照號碼，視為新醫院
		if geocoder != nil && cleanedAddress != "" {
			coords, geocoded := performGeocode(geocoder, cleanedAddress)
			if geocoded {
				opts = append(opts, model.WithCoordinates(coords))
				needsGeocode = true
			}
		}
	}

	// 設定發照日期
	if formattedDate != "" {
		opts = append(opts, model.WithIssuedDate(formattedDate))
	}

	// 建立醫院實體
	hospital := model.NewHospital(
		h.Name,
		cleanedAddress,
		cleanedPhone,
		h.County,
		h.Veterinarian,
		h.LicenseType,
		h.LicenseNo,
		h.Status,
		opts...,
	)

	// 如果是更新操作，設定現有醫院的 ID
	if isUpdate && existingHospital != nil {
		hospital.SetID(existingHospital.ID())
	}

	return hospital, needsGeocode, isUpdate, nil
}

// performGeocode 執行地理編碼並回傳座標
func performGeocode(geocoder GeocodeService, address string) (model.Coordinates, bool) {
	result := geocoder.Geocode(address)
	if result.Err != nil {
		fmt.Printf("    地理編碼失敗：%v\n", result.Err)
		return model.Coordinates{}, false
	}

	// 檢查座標是否有效（不是預設的 0,0）
	if result.Latitude == 0 && result.Longitude == 0 {
		return model.Coordinates{}, false
	}

	coords := model.NewCoordinates(result.Latitude, result.Longitude)
	if !coords.IsValid() {
		return model.Coordinates{}, false
	}

	return coords, true
}

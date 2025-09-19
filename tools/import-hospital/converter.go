package main

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/blackhorseya/petlog/internal/domain/model"
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

// toDomain 將 JSON 資料轉換為領域模型
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
		result := geocoder.Geocode(cleanedAddress)
		if result.Err == nil {
			coords := model.NewCoordinates(result.Latitude, result.Longitude)
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

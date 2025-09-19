package main

// hospitalJSON 表示原始 JSON 資料結構
type hospitalJSON struct {
	County       string `json:"縣市"`
	LicenseNo    string `json:"字號"`
	LicenseType  string `json:"執照類別"`
	Status       string `json:"狀態"`
	Name         string `json:"機構名稱"`
	Veterinarian string `json:"負責獸醫"`
	Phone        string `json:"機構電話"`
	IssuedDate   string `json:"發照日期"`
	Address      string `json:"機構地址"`
}

// geocodeResult 地理編碼結果
type geocodeResult struct {
	Latitude  float64
	Longitude float64
	Err       error
}

// GeocodeService 地理編碼服務介面
type GeocodeService interface {
	Geocode(address string) geocodeResult
}

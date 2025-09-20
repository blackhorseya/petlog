package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/blackhorseya/petlog/internal/config"
)

// googleGeocodeService Google Maps Geocoding API 服務實作
type googleGeocodeService struct {
	apiKey     string
	httpClient *http.Client
}

// newGoogleGeocodeService 建立新的 Google 地理編碼服務
func newGoogleGeocodeService(apiKey string) GeocodeService {
	return &googleGeocodeService{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// provideGoogleGeocodeService 提供 Google 地理編碼服務（Wire 提供者）
func provideGoogleGeocodeService(cfg config.Config) GeocodeService {
	if cfg.GoogleMapsAPIKey == "" {
		// 如果沒有設定 API key，回退到模擬服務
		return newMockGeocodeService()
	}
	return newGoogleGeocodeService(cfg.GoogleMapsAPIKey)
}

// googleGeocodeResponse Google Geocoding API 回應結構
type googleGeocodeResponse struct {
	Results []struct {
		Geometry struct {
			Location struct {
				Lat float64 `json:"lat"`
				Lng float64 `json:"lng"`
			} `json:"location"`
		} `json:"geometry"`
	} `json:"results"`
	Status string `json:"status"`
}

func (g *googleGeocodeService) Geocode(address string) geocodeResult {
	if g.apiKey == "" {
		return geocodeResult{
			Err: fmt.Errorf("Google Maps API key 未設定"),
		}
	}

	// 建構 API URL
	baseURL := "https://maps.googleapis.com/maps/api/geocode/json"
	params := url.Values{}
	params.Add("address", address)
	params.Add("key", g.apiKey)
	params.Add("region", "tw") // 設定為台灣地區

	apiURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	// 發送 HTTP 請求
	resp, err := g.httpClient.Get(apiURL)
	if err != nil {
		return geocodeResult{
			Err: fmt.Errorf("Google Geocoding API 請求失敗: %w", err),
		}
	}
	defer resp.Body.Close()

	// 讀取回應內容
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return geocodeResult{
			Err: fmt.Errorf("讀取 API 回應失敗: %w", err),
		}
	}

	// 解析 JSON 回應
	var apiResponse googleGeocodeResponse
	if err := json.Unmarshal(body, &apiResponse); err != nil {
		return geocodeResult{
			Err: fmt.Errorf("解析 API 回應失敗: %w", err),
		}
	}

	// 檢查 API 狀態
	if apiResponse.Status != "OK" {
		return geocodeResult{
			Err: fmt.Errorf("Google Geocoding API 錯誤: %s", apiResponse.Status),
		}
	}

	// 檢查是否有結果
	if len(apiResponse.Results) == 0 {
		return geocodeResult{
			Err: fmt.Errorf("找不到地址的地理座標: %s", address),
		}
	}

	// 取得第一個結果的座標
	location := apiResponse.Results[0].Geometry.Location
	return geocodeResult{
		Latitude:  location.Lat,
		Longitude: location.Lng,
		Err:       nil,
	}
}

// mockGeocodeService 簡單的地理編碼服務實作（用於測試）
type mockGeocodeService struct{}

func newMockGeocodeService() GeocodeService {
	return &mockGeocodeService{}
}

func (m *mockGeocodeService) Geocode(address string) geocodeResult {
	// 模擬地理編碼（實際應該呼叫外部 API）
	// 這裡只是回傳台灣中心點附近的隨機座標
	return geocodeResult{
		Latitude:  24.0 + float64(len(address)%100)/1000.0,
		Longitude: 121.0 + float64(len(address)%100)/1000.0,
		Err:       nil,
	}
}

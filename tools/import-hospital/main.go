package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/domain/repository"
	"github.com/spf13/cobra"
)

var (
	// 命令列參數
	inputFile string
	batchSize int
	dryRun    bool
	geocoding bool
)

// mockGeocodeService 簡單的地理編碼服務實作（用於測試）
type mockGeocodeService struct{}

func newMockGeocodeService() GeocodeService {
	return &mockGeocodeService{}
}

func (m *mockGeocodeService) Geocode(address string) geocodeResult {
	// TODO: 實作真實的地理編碼服務（Google Maps API、HERE API 等）
	// 模擬地理編碼（實際應該呼叫外部 API）
	// 這裡只是回傳台灣中心點附近的隨機座標
	return geocodeResult{
		Latitude:  24.0 + float64(len(address)%100)/1000.0,
		Longitude: 121.0 + float64(len(address)%100)/1000.0,
		Err:       nil,
	}
}

// rootCmd 根命令
var rootCmd = &cobra.Command{
	Use:   "import-hospital",
	Short: "匯入醫院資料到 MongoDB",
	Long:  `從 JSON 檔案讀取醫院資料，經過清洗後批次匯入到 MongoDB 資料庫`,
	RunE:  runImport,
}

func init() {
	// 設定命令列參數
	rootCmd.Flags().StringVarP(&inputFile, "input", "i", "output/hospitals.json", "輸入的 JSON 檔案路徑")
	rootCmd.Flags().IntVarP(&batchSize, "batch-size", "b", 100, "批次處理大小")
	rootCmd.Flags().BoolVarP(&dryRun, "dry-run", "n", false, "預覽模式，不實際寫入資料庫")
	rootCmd.Flags().BoolVarP(&geocoding, "geocoding", "g", false, "啟用地理編碼（取得座標）")
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}

// runImport 執行匯入邏輯
func runImport(cmd *cobra.Command, args []string) error {
	ctx := context.Background()

	// 載入配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("配置載入失敗: %v", err)
	}

	// 1. 讀取 JSON 檔案
	fmt.Printf("正在讀取檔案：%s\n", inputFile)
	hospitals, err := loadHospitalsFromJSON(inputFile)
	if err != nil {
		return fmt.Errorf("讀取檔案失敗：%w", err)
	}
	fmt.Printf("成功讀取 %d 筆醫院資料\n", len(hospitals))

	// 2. 初始化依賴注入
	inject, cleanup, err := newInjector(*cfg)
	if err != nil {
		return fmt.Errorf("初始化失敗：%w", err)
	}
	defer cleanup()

	// 3. 轉換資料
	fmt.Println("開始轉換資料...")
	domainHospitals, err := convertToDomainModels(hospitals, inject.geocodeService)
	if err != nil {
		return fmt.Errorf("資料轉換失敗：%w", err)
	}
	fmt.Printf("成功轉換 %d 筆資料\n", len(domainHospitals))

	// 4. 如果是預覽模式，只顯示前幾筆資料
	if dryRun {
		fmt.Println("\n=== 預覽模式 ===")
		previewCount := 3
		if len(domainHospitals) < previewCount {
			previewCount = len(domainHospitals)
		}
		for i := 0; i < previewCount; i++ {
			h := domainHospitals[i]
			fmt.Printf("醫院 %d:\n", i+1)
			fmt.Printf("  名稱：%s\n", h.Name())
			fmt.Printf("  地址：%s\n", h.Address())
			fmt.Printf("  電話：%s\n", h.Phone())
			fmt.Printf("  縣市：%s\n", h.County())
			fmt.Printf("  座標：%.6f, %.6f\n", h.Coordinates().Latitude(), h.Coordinates().Longitude())
			fmt.Println()
		}
		fmt.Printf("總共將匯入 %d 筆資料\n", len(domainHospitals))
		return nil
	}

	// 5. 批次匯入
	fmt.Printf("開始批次匯入（批次大小：%d）\n", batchSize)
	err = batchImport(ctx, inject.hospitalRepo, domainHospitals, batchSize)
	if err != nil {
		return fmt.Errorf("批次匯入失敗：%w", err)
	}

	fmt.Println("匯入完成！")
	return nil
}

// loadHospitalsFromJSON 從 JSON 檔案載入醫院資料
func loadHospitalsFromJSON(filename string) ([]*hospitalJSON, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var hospitals []*hospitalJSON
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&hospitals); err != nil {
		return nil, err
	}

	return hospitals, nil
}

// convertToDomainModels 轉換為領域模型
func convertToDomainModels(jsonHospitals []*hospitalJSON, geocoder GeocodeService) ([]*model.Hospital, error) {
	result := make([]*model.Hospital, 0, len(jsonHospitals))

	for i, jsonHospital := range jsonHospitals {
		domainHospital, err := jsonHospital.toDomain(geocoder)
		if err != nil {
			fmt.Printf("警告：第 %d 筆資料轉換失敗：%v\n", i+1, err)
			continue
		}
		result = append(result, domainHospital)
	}

	return result, nil
}

// batchImport 批次匯入醫院資料
func batchImport(c context.Context, repo repository.HospitalRepository, hospitals []*model.Hospital, batchSize int) error {
	total := len(hospitals)
	successCount := 0
	errorCount := 0

	for i := 0; i < total; i += batchSize {
		end := i + batchSize
		if end > total {
			end = total
		}

		batch := hospitals[i:end]
		fmt.Printf("處理批次 %d-%d / %d\n", i+1, end, total)

		// 批次處理當前批次
		for j, hospital := range batch {
			err := repo.Create(c, hospital)
			if err != nil {
				fmt.Printf("  第 %d 筆匯入失敗：%v\n", i+j+1, err)
				errorCount++
			} else {
				successCount++
			}
		}

		// 避免過於頻繁的資料庫操作
		time.Sleep(100 * time.Millisecond)
	}

	fmt.Printf("\n匯入結果：成功 %d 筆，失敗 %d 筆\n", successCount, errorCount)
	return nil
}

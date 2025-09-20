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
)

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

	// 3. 如果是預覽模式，轉換前幾筆資料進行預覽
	if dryRun {
		fmt.Println("\n=== 預覽模式 ===")
		previewCount := 3
		if len(hospitals) < previewCount {
			previewCount = len(hospitals)
		}

		previewHospitals, err := convertToDomainModels(hospitals[:previewCount], inject.geocodeService)
		if err != nil {
			return fmt.Errorf("預覽資料轉換失敗：%w", err)
		}

		for i, h := range previewHospitals {
			fmt.Printf("醫院 %d:\n", i+1)
			fmt.Printf("  名稱：%s\n", h.Name())
			fmt.Printf("  地址：%s\n", h.Address())
			fmt.Printf("  電話：%s\n", h.Phone())
			fmt.Printf("  縣市：%s\n", h.County())
			fmt.Printf("  座標：%.6f, %.6f\n", h.Coordinates().Latitude(), h.Coordinates().Longitude())
			fmt.Println()
		}
		fmt.Printf("總共將匯入 %d 筆資料\n", len(hospitals))
		return nil
	}

	// 4. 逐一轉換並儲存
	fmt.Println("開始逐一轉換並儲存資料...")
	err = convertAndSaveOneByOne(ctx, inject.hospitalRepo, hospitals, inject.geocodeService)
	if err != nil {
		return fmt.Errorf("轉換儲存失敗：%w", err)
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

// convertAndSaveOneByOne 逐一轉換並儲存醫院資料
func convertAndSaveOneByOne(c context.Context, repo repository.HospitalRepository, jsonHospitals []*hospitalJSON, geocoder GeocodeService) error {
	total := len(jsonHospitals)
	successCount := 0
	errorCount := 0
	geocodeCount := 0

	fmt.Printf("總共 %d 筆資料需要處理\n", total)

	for i, jsonHospital := range jsonHospitals {
		fmt.Printf("處理第 %d/%d 筆：%s\n", i+1, total, jsonHospital.Name)

		// 轉換為領域模型，檢查現有資料
		domainHospital, needsGeocode, isUpdate, err := jsonHospital.toDomainWithLocationCheck(c, repo, geocoder)
		if err != nil {
			fmt.Printf("  轉換失敗：%v\n", err)
			errorCount++
			continue
		}

		if needsGeocode {
			geocodeCount++
			fmt.Printf("  已進行地理編碼\n")
		}

		// 儲存或更新到資料庫
		if isUpdate {
			err = repo.Update(c, domainHospital)
			if err != nil {
				fmt.Printf("  更新失敗：%v\n", err)
				errorCount++
			} else {
				successCount++
				fmt.Printf("  更新成功\n")
			}
		} else {
			err = repo.Create(c, domainHospital)
			if err != nil {
				fmt.Printf("  儲存失敗：%v\n", err)
				errorCount++
			} else {
				successCount++
				fmt.Printf("  儲存成功\n")
			}
		}

		// 避免過於頻繁的操作
		time.Sleep(50 * time.Millisecond)
	}

	fmt.Printf("\n處理結果：成功 %d 筆，失敗 %d 筆，地理編碼 %d 筆\n", successCount, errorCount, geocodeCount)
	return nil
}

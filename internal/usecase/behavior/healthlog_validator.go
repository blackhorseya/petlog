package behavior

import (
	"errors"
	"time"
)

var (
	ErrPetIDRequired   = errors.New("pet_id 為必填欄位")
	ErrDateInFuture    = errors.New("日期不可為未來")
	ErrWeightInvalid   = errors.New("體重必須大於 0 且小於 1000 公斤")
	ErrFoodGramInvalid = errors.New("食物量必須大於 0 且小於 10000 公克")
)

// HealthLogValidator 負責健康日誌欄位驗證
type HealthLogValidator struct{}

// ValidatePetID 檢查 PetID 是否為空
func (v *HealthLogValidator) ValidatePetID(petID string) error {
	if petID == "" {
		return ErrPetIDRequired
	}
	return nil
}

func (v *HealthLogValidator) ValidateDate(date time.Time) error {
	if date.After(time.Now()) {
		return ErrDateInFuture
	}
	return nil
}

func (v *HealthLogValidator) ValidateNumericFields(weightKg float64, foodGram int) error {
	if weightKg < 0 || weightKg > 1000 {
		return ErrWeightInvalid
	}
	if foodGram < 0 || foodGram > 10000 {
		return ErrFoodGramInvalid
	}
	return nil
}

// ValidateCreate 統一驗證建立健康日誌所有欄位
func (v *HealthLogValidator) ValidateCreate(petID string, date time.Time, weightKg float64, foodGram int) error {
	if err := v.ValidatePetID(petID); err != nil {
		return err
	}
	return nil
}

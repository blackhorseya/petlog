package behavior

import (
	"testing"
)

func TestValidatePetID(t *testing.T) {
	validator := &HealthLogValidator{}

	t.Run("空字串應回傳 ErrPetIDRequired", func(t *testing.T) {
		err := validator.ValidatePetID("")
		if err != ErrPetIDRequired {
			t.Errorf("預期 ErrPetIDRequired，實際為 %v", err)
		}
	})

	t.Run("有值應通過驗證", func(t *testing.T) {
		err := validator.ValidatePetID("any-value")
		if err != nil {
			t.Errorf("預期無錯誤，實際為 %v", err)
		}
	})
}

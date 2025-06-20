package behavior

import (
	"errors"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
)

// ValidatePet checks if the pet model has the required fields.
func ValidatePet(pet *model.Pet) error {
	if pet.Name == "" {
		return errors.New("pet name is required")
	}
	if pet.OwnerID == "" {
		return errors.New("owner id is required")
	}
	if pet.DOB.IsZero() {
		return errors.New("pet date of birth is required")
	}
	if pet.DOB.After(time.Now()) {
		return errors.New("pet date of birth cannot be in the future")
	}

	return nil
}

package domain

import "errors"

// 定義領域層的標準錯誤。
// 應用程式的不同層級可以檢查這些錯誤，並採取相應的行動。

var (
	// ErrNotFound 表示找不到請求的項目。
	ErrNotFound = errors.New("requested item was not found")

	// ErrDuplicateEntry 表示試圖創建一個已存在的項目。
	ErrDuplicateEntry = errors.New("item already exists")

	// ErrInvalidID 表示提供的 ID 格式無效。
	ErrInvalidID = errors.New("invalid ID format")

	// ErrUpdateConflict 表示在更新操作期間發生衝突，可能是由於版本不匹配。
	ErrUpdateConflict = errors.New("update conflict")

	// ErrInvalidParameter is returned when a parameter is invalid.
	ErrInvalidParameter = errors.New("invalid parameter provided")
)

// Helper functions for error type checking

// IsNotFound 檢查是否為資源不存在錯誤
func IsNotFound(err error) bool {
	return errors.Is(err, ErrNotFound)
}

// IsDuplicateEntry 檢查是否為重複項目錯誤
func IsDuplicateEntry(err error) bool {
	return errors.Is(err, ErrDuplicateEntry)
}

// IsInvalidID 檢查是否為 ID 格式錯誤
func IsInvalidID(err error) bool {
	return errors.Is(err, ErrInvalidID)
}

// IsUpdateConflict 檢查是否為更新衝突錯誤
func IsUpdateConflict(err error) bool {
	return errors.Is(err, ErrUpdateConflict)
}

// IsInvalidParameter 檢查是否為參數驗證錯誤
func IsInvalidParameter(err error) bool {
	return errors.Is(err, ErrInvalidParameter)
}

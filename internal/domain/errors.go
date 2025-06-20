package domain

import "errors"

// 定義領域層的標準錯誤。
// 應用程式的不同層級可以檢查這些錯誤，並採取相應的行動。

var (
	// ErrNotFound 表示找不到請求的項目。
	ErrNotFound = errors.New("item was not found")

	// ErrDuplicateEntry 表示試圖創建一個已存在的項目。
	ErrDuplicateEntry = errors.New("item already exists")

	// ErrInvalidID 表示提供的 ID 格式無效。
	ErrInvalidID = errors.New("invalid ID format")

	// ErrUpdateConflict 表示在更新操作期間發生衝突，可能是由於版本不匹配。
	ErrUpdateConflict = errors.New("update conflict")
)

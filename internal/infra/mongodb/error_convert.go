package mongodb

import (
	"errors"
	"strings"

	"github.com/blackhorseya/petlog/internal/domain"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// convertMongoError 將 MongoDB driver error 轉換為標準 domain error
func convertMongoError(err error) error {
	if err == nil {
		return nil
	}

	// 查無資料
	if errors.Is(err, mongo.ErrNoDocuments) {
		return domain.ErrNotFound
	}

	// 唯一索引衝突（Duplicate Key）
	if isDuplicateKeyError(err) {
		return domain.ErrDuplicateEntry
	}

	// 其他錯誤可依需求擴充

	return err // 預設原樣回傳，讓上層包裝
}

// isDuplicateKeyError 判斷是否為 MongoDB 唯一索引衝突
func isDuplicateKeyError(err error) bool {
	if err == nil {
		return false
	}
	// MongoDB duplicate key error 通常包含 "E11000 duplicate key error"
	return strings.Contains(err.Error(), "E11000 duplicate key error")
}

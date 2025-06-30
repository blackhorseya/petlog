package model

import "time"

// Expense 代表一筆費用紀錄，純領域實體
// 僅包含 json 標籤，不含任何 DB/ORM 標籤
// 依 PRD 與 endpoint 定義
// - ID: 主鍵
// - PetID: 關聯寵物
// - Category: 分類（預設/自訂）
// - Amount: 金額（正整數）
// - Description: 描述（可空）
// - Date: 消費日期
// - CreatedAt/UpdatedAt: 系統管理
// 不可有 Pet *Pet 欄位，聚合間僅以 ID 關聯
type Expense struct {
	ID          string    `json:"id"`
	PetID       string    `json:"pet_id"`
	Category    string    `json:"category"`
	Amount      int       `json:"amount"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

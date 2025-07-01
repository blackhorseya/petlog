package gin

import (
	"net/http"

	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/gin-gonic/gin"
)

// 預設分類常數
var DefaultCategories = []string{"醫療", "飼料", "保健品", "日用品", "其他"}

// CreateExpenseHandler godoc
// @Summary      新增費用紀錄
// @Description  建立一筆新的費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        data  body      endpoint.CreateExpenseRequest  true  "費用資料"
// @Success      201   {object}  endpoint.CreateExpenseResponse
// @Failure      400   {object}  endpoint.CreateExpenseResponse
// @Failure      401   {object}  endpoint.CreateExpenseResponse
// @Failure      500   {object}  endpoint.CreateExpenseResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses [post]
func CreateExpenseHandler(c *gin.Context) {
	var req endpoint.CreateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, endpoint.CreateExpenseResponse{Err: err})
		return
	}
	// TODO: 呼叫 endpoint/usecase 實作
	c.JSON(http.StatusNotImplemented, gin.H{"message": "not implemented"})
}

// ListExpensesHandler godoc
// @Summary      查詢費用紀錄
// @Description  依條件查詢費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        pet_id     query     string  false  "寵物ID"
// @Param        category   query     string  false  "分類"
// @Param        start_date query     string  false  "起始日期 (RFC3339)"
// @Param        end_date   query     string  false  "結束日期 (RFC3339)"
// @Success      200   {object}  endpoint.ListExpensesResponse
// @Failure      400   {object}  endpoint.ListExpensesResponse
// @Failure      401   {object}  endpoint.ListExpensesResponse
// @Failure      500   {object}  endpoint.ListExpensesResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses [get]
func ListExpensesHandler(c *gin.Context) {
	var req endpoint.ListExpensesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, endpoint.ListExpensesResponse{Err: err})
		return
	}
	// TODO: 呼叫 endpoint/usecase 實作
	c.JSON(http.StatusNotImplemented, gin.H{"message": "not implemented"})
}

// GetExpenseHandler godoc
// @Summary      取得單筆費用紀錄
// @Description  取得指定 ID 的費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "費用ID"
// @Success      200   {object}  endpoint.GetExpenseResponse
// @Failure      400   {object}  endpoint.GetExpenseResponse
// @Failure      401   {object}  endpoint.GetExpenseResponse
// @Failure      404   {object}  endpoint.GetExpenseResponse
// @Failure      500   {object}  endpoint.GetExpenseResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses/{id} [get]
func GetExpenseHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, endpoint.GetExpenseResponse{Err: gin.Error{Err: http.ErrNoLocation}})
		return
	}
	// TODO: 呼叫 endpoint/usecase 實作
	c.JSON(http.StatusNotImplemented, gin.H{"message": "not implemented"})
}

// UpdateExpenseHandler godoc
// @Summary      編輯費用紀錄
// @Description  編輯指定 ID 的費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        id    path      string  true  "費用ID"
// @Param        data  body      endpoint.UpdateExpenseRequest  true  "費用資料"
// @Success      200   {object}  endpoint.UpdateExpenseResponse
// @Failure      400   {object}  endpoint.UpdateExpenseResponse
// @Failure      401   {object}  endpoint.UpdateExpenseResponse
// @Failure      404   {object}  endpoint.UpdateExpenseResponse
// @Failure      500   {object}  endpoint.UpdateExpenseResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses/{id} [put]
func UpdateExpenseHandler(c *gin.Context) {
	id := c.Param("id")
	var req endpoint.UpdateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, endpoint.UpdateExpenseResponse{Err: err})
		return
	}
	req.ID = id
	// TODO: 呼叫 endpoint/usecase 實作
	c.JSON(http.StatusNotImplemented, gin.H{"message": "not implemented"})
}

// DeleteExpenseHandler godoc
// @Summary      刪除費用紀錄
// @Description  刪除指定 ID 的費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "費用ID"
// @Success      204   {object}  endpoint.DeleteExpenseResponse
// @Failure      400   {object}  endpoint.DeleteExpenseResponse
// @Failure      401   {object}  endpoint.DeleteExpenseResponse
// @Failure      404   {object}  endpoint.DeleteExpenseResponse
// @Failure      500   {object}  endpoint.DeleteExpenseResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses/{id} [delete]
func DeleteExpenseHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, endpoint.DeleteExpenseResponse{Err: gin.Error{Err: http.ErrNoLocation}})
		return
	}
	// TODO: 呼叫 endpoint/usecase 實作
	c.JSON(http.StatusNotImplemented, gin.H{"message": "not implemented"})
}

// GetExpenseSummaryHandler godoc
// @Summary      查詢費用摘要
// @Description  查詢本月總支出、分類統計等摘要
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        pet_id     query     string  false  "寵物ID"
// @Success      200   {object}  endpoint.GetExpenseSummaryResponse
// @Failure      400   {object}  endpoint.GetExpenseSummaryResponse
// @Failure      401   {object}  endpoint.GetExpenseSummaryResponse
// @Failure      500   {object}  endpoint.GetExpenseSummaryResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses/summary [get]
func GetExpenseSummaryHandler(c *gin.Context) {
	var req endpoint.GetExpenseSummaryRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, endpoint.GetExpenseSummaryResponse{Err: err})
		return
	}
	// TODO: 呼叫 endpoint/usecase 實作
	c.JSON(http.StatusNotImplemented, gin.H{"message": "not implemented"})
}

package gin

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/gin-gonic/gin"
	httptransport "github.com/go-kit/kit/transport/http"
)

// 預設分類常數
var DefaultCategories = []string{"醫療", "飼料", "保健品", "日用品", "其他"}

// RegisterExpenseRoutes registers expense-related routes on the given Gin engine.
func RegisterExpenseRoutes(r *gin.Engine, cfg config.Config, e endpoint.ExpenseEndpoints, options ...httptransport.ServerOption) {
	// Error handler
	opts := []httptransport.ServerOption{
		httptransport.ServerErrorHandler(NewContextualLogErrorHandler()),
		httptransport.ServerErrorEncoder(encodeError),
	}
	opts = append(opts, options...)

	// Private endpoints
	v1 := r.Group("/api/v1")
	expenseRoutes := v1.Group("/expenses")
	expenseRoutes.Use(EnsureValidToken(cfg))
	{
		expenseRoutes.POST("", CreateExpense(e, opts...))
		expenseRoutes.GET("/summary", GetExpenseSummary(e, opts...))
		expenseRoutes.GET("/:id", GetExpense(e, opts...))
		expenseRoutes.PUT("/:id", UpdateExpense(e, opts...))
		expenseRoutes.DELETE("/:id", DeleteExpense(e, opts...))
		expenseRoutes.GET("", ListExpenses(e, opts...))
	}
}

// CreateExpense godoc
// @Summary      新增費用紀錄
// @Description  建立一筆新的費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        data  body      endpoint.CreateExpenseRequest  true  "費用資料"
// @Success      201  {object}  endpoint.CreateExpenseResponse
// @Failure      400  {object}  endpoint.CreateExpenseResponse
// @Failure      401  {object}  endpoint.CreateExpenseResponse
// @Failure      500  {object}  endpoint.CreateExpenseResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses [post]
func CreateExpense(e endpoint.ExpenseEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.CreateExpenseEndpoint,
		decodeCreateExpenseRequest,
		encodeCreateExpenseResponse,
		options...,
	))
}

// GetExpense godoc
// @Summary      取得單筆費用紀錄
// @Description  取得指定 ID 的費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "費用ID"
// @Success      200  {object}  endpoint.GetExpenseResponse
// @Failure      400  {object}  endpoint.GetExpenseResponse
// @Failure      401  {object}  endpoint.GetExpenseResponse
// @Failure      404  {object}  endpoint.GetExpenseResponse
// @Failure      500  {object}  endpoint.GetExpenseResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses/{id} [get]
func GetExpense(e endpoint.ExpenseEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.GetExpenseEndpoint,
		decodeGetExpenseRequest,
		encodeResponse,
		options...,
	))
}

// UpdateExpense godoc
// @Summary      編輯費用紀錄
// @Description  編輯指定 ID 的費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        id    path      string  true  "費用ID"
// @Param        data  body      endpoint.UpdateExpenseRequest  true  "費用資料"
// @Success      200  {object}  endpoint.UpdateExpenseResponse
// @Failure      400  {object}  endpoint.UpdateExpenseResponse
// @Failure      401  {object}  endpoint.UpdateExpenseResponse
// @Failure      404  {object}  endpoint.UpdateExpenseResponse
// @Failure      500  {object}  endpoint.UpdateExpenseResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses/{id} [put]
func UpdateExpense(e endpoint.ExpenseEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.UpdateExpenseEndpoint,
		decodeUpdateExpenseRequest,
		encodeResponse,
		options...,
	))
}

// DeleteExpense godoc
// @Summary      刪除費用紀錄
// @Description  刪除指定 ID 的費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "費用ID"
// @Success      204  {object}  endpoint.DeleteExpenseResponse
// @Failure      400  {object}  endpoint.DeleteExpenseResponse
// @Failure      401  {object}  endpoint.DeleteExpenseResponse
// @Failure      404  {object}  endpoint.DeleteExpenseResponse
// @Failure      500  {object}  endpoint.DeleteExpenseResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses/{id} [delete]
func DeleteExpense(e endpoint.ExpenseEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.DeleteExpenseEndpoint,
		decodeDeleteExpenseRequest,
		encodeDeleteExpenseResponse,
		options...,
	))
}

// ListExpenses godoc
// @Summary      查詢費用紀錄
// @Description  依條件查詢費用紀錄
// @Tags         expenses
// @Accept       json
// @Produce      json
// @Param        pet_id     query     string  false  "寵物ID"
// @Param        category   query     string  false  "分類"
// @Param        start_date query     string  false  "起始日期 (RFC3339)"
// @Param        end_date   query     string  false  "結束日期 (RFC3339)"
// @Success      200  {object}  endpoint.ListExpensesResponse
// @Failure      400  {object}  endpoint.ListExpensesResponse
// @Failure      401  {object}  endpoint.ListExpensesResponse
// @Failure      500  {object}  endpoint.ListExpensesResponse
// @Security     BearerAuth
// @Router       /api/v1/expenses [get]
func ListExpenses(e endpoint.ExpenseEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.ListExpensesEndpoint,
		decodeListExpensesRequest,
		encodeResponse,
		options...,
	))
}

func decodeCreateExpenseRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req endpoint.CreateExpenseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	return req, nil
}

func decodeGetExpenseRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	id := ginctx.Param("id")
	return endpoint.GetExpenseRequest{ID: id}, nil
}

func decodeUpdateExpenseRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	id := ginctx.Param("id")

	var req endpoint.UpdateExpenseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	req.ID = id
	return req, nil
}

func decodeDeleteExpenseRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	id := ginctx.Param("id")
	return endpoint.DeleteExpenseRequest{ID: id}, nil
}

func decodeListExpensesRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	petID := ginctx.Query("pet_id")
	category := ginctx.Query("category")
	startDate := ginctx.Query("start_date")
	endDate := ginctx.Query("end_date")

	return endpoint.ListExpensesRequest{
		PetID:     petID,
		Category:  category,
		StartDate: startDate,
		EndDate:   endDate,
	}, nil
}

// Custom encoders for different status codes
func encodeCreateExpenseResponse(c context.Context, w http.ResponseWriter, response interface{}) error {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	resp := response.(endpoint.CreateExpenseResponse)

	if resp.Failed() != nil {
		ginctx.JSON(http.StatusInternalServerError, resp)
		return nil
	}

	ginctx.JSON(http.StatusCreated, resp)
	return nil
}

func encodeDeleteExpenseResponse(c context.Context, w http.ResponseWriter, response interface{}) error {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	resp := response.(endpoint.DeleteExpenseResponse)

	if resp.Failed() != nil {
		ginctx.JSON(http.StatusInternalServerError, resp)
		return nil
	}

	ginctx.JSON(http.StatusNoContent, resp)
	return nil
}

// GetExpenseSummary godoc
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
func GetExpenseSummary(e endpoint.ExpenseEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.GetExpenseSummaryEndpoint,
		decodeGetExpenseSummaryRequest,
		encodeResponse,
		options...,
	))
}

func decodeGetExpenseSummaryRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	petID := ginctx.Query("pet_id")
	return endpoint.GetExpenseSummaryRequest{PetID: petID}, nil
}

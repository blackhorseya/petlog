package gin

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/gin-gonic/gin"
	httptransport "github.com/go-kit/kit/transport/http"
)

// RegisterMedicalRecordRoutes 註冊醫療記錄相關路由
func RegisterMedicalRecordRoutes(r *gin.Engine, cfg config.Config, e endpoint.MedicalRecordEndpoints, options ...httptransport.ServerOption) {
	// Error handler
	opts := []httptransport.ServerOption{
		httptransport.ServerErrorHandler(NewContextualLogErrorHandler()),
		httptransport.ServerErrorEncoder(encodeError),
	}
	opts = append(opts, options...)

	// Private endpoints
	v1 := r.Group("/api/v1")
	medicalRecordRoutes := v1.Group("/medical-records")
	medicalRecordRoutes.Use(EnsureValidToken(cfg))
	{
		medicalRecordRoutes.POST("", CreateMedicalRecord(e, opts...))
		medicalRecordRoutes.GET("/:id", GetMedicalRecord(e, opts...))
		medicalRecordRoutes.PUT("/:id", UpdateMedicalRecord(e, opts...))
		medicalRecordRoutes.DELETE("/:id", DeleteMedicalRecord(e, opts...))
		medicalRecordRoutes.GET("", ListMedicalRecordsByPet(e, opts...))
	}
}

// CreateMedicalRecord godoc
// @Summary      建立醫療記錄
// @Description  為指定的寵物建立一筆新的醫療記錄（疫苗、驅蟲、藥物治療、獸醫檢查等）
// @Tags         medical-records
// @Accept       json
// @Produce      json
// @Param        medicalRecord  body      endpoint.CreateMedicalRecordRequest  true  "醫療記錄資訊"
// @Success      200           {object}  endpoint.CreateMedicalRecordResponse
// @Failure      400           {object}  map[string]interface{}
// @Failure      401           {object}  map[string]interface{}
// @Failure      500           {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/medical-records [post]
func CreateMedicalRecord(e endpoint.MedicalRecordEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.CreateMedicalRecordEndpoint,
		decodeCreateMedicalRecordRequest,
		encodeResponse,
		options...,
	))
}

// GetMedicalRecord godoc
// @Summary      取得醫療記錄詳情
// @Description  根據醫療記錄 ID 取得詳細資訊
// @Tags         medical-records
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "醫療記錄 ID"
// @Success      200  {object}  endpoint.GetMedicalRecordResponse
// @Failure      404  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/medical-records/{id} [get]
func GetMedicalRecord(e endpoint.MedicalRecordEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.GetMedicalRecordEndpoint,
		decodeGetMedicalRecordRequest,
		encodeResponse,
		options...,
	))
}

// UpdateMedicalRecord godoc
// @Summary      更新醫療記錄
// @Description  根據醫療記錄 ID 更新現有醫療記錄資料
// @Tags         medical-records
// @Accept       json
// @Produce      json
// @Param        id            path      string                                true  "醫療記錄 ID"
// @Param        medicalRecord body      endpoint.UpdateMedicalRecordRequest   true  "要更新的醫療記錄資訊"
// @Success      200           {object}  endpoint.UpdateMedicalRecordResponse
// @Failure      400           {object}  map[string]interface{}
// @Failure      401           {object}  map[string]interface{}
// @Failure      404           {object}  map[string]interface{}
// @Failure      500           {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/medical-records/{id} [put]
func UpdateMedicalRecord(e endpoint.MedicalRecordEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.UpdateMedicalRecordEndpoint,
		decodeUpdateMedicalRecordRequest,
		encodeResponse,
		options...,
	))
}

// DeleteMedicalRecord godoc
// @Summary      刪除醫療記錄
// @Description  根據醫療記錄 ID 刪除醫療記錄資料
// @Tags         medical-records
// @Accept       json
// @Produce      json
// @Param        id  path      string  true  "醫療記錄 ID"
// @Success      200 {object}  endpoint.DeleteMedicalRecordResponse
// @Failure      404 {object}  map[string]interface{}
// @Failure      401 {object}  map[string]interface{}
// @Failure      500 {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/medical-records/{id} [delete]
func DeleteMedicalRecord(e endpoint.MedicalRecordEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.DeleteMedicalRecordEndpoint,
		decodeDeleteMedicalRecordRequest,
		encodeResponse,
		options...,
	))
}

// ListMedicalRecordsByPet godoc
// @Summary      列出寵物的醫療記錄
// @Description  根據寵物 ID 和可選的日期範圍列出醫療記錄
// @Tags         medical-records
// @Accept       json
// @Produce      json
// @Param        pet_id      query     string  true   "寵物 ID"
// @Param        start_date  query     string  false  "開始日期 (RFC3339 格式)"
// @Param        end_date    query     string  false  "結束日期 (RFC3339 格式)"
// @Success      200         {object}  endpoint.ListMedicalRecordsByPetResponse
// @Failure      400         {object}  map[string]interface{}
// @Failure      401         {object}  map[string]interface{}
// @Failure      500         {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /api/v1/medical-records [get]
func ListMedicalRecordsByPet(e endpoint.MedicalRecordEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.ListMedicalRecordsByPetEndpoint,
		decodeListMedicalRecordsByPetRequest,
		encodeResponse,
		options...,
	))
}

// decodeCreateMedicalRecordRequest 解碼建立醫療記錄請求
func decodeCreateMedicalRecordRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req endpoint.CreateMedicalRecordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	return req, nil
}

// decodeGetMedicalRecordRequest 解碼取得醫療記錄請求
func decodeGetMedicalRecordRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	id := ginctx.Param("id")
	return endpoint.GetMedicalRecordRequest{ID: id}, nil
}

// decodeUpdateMedicalRecordRequest 解碼更新醫療記錄請求
func decodeUpdateMedicalRecordRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	id := ginctx.Param("id")

	var req endpoint.UpdateMedicalRecordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	req.ID = id
	return req, nil
}

// decodeDeleteMedicalRecordRequest 解碼刪除醫療記錄請求
func decodeDeleteMedicalRecordRequest(c context.Context, r *http.Request) (request interface{}, err error) {
	ginctx, _ := c.Value(ginContextKey).(*gin.Context)
	id := ginctx.Param("id")
	return endpoint.DeleteMedicalRecordRequest{ID: id}, nil
}

// decodeListMedicalRecordsByPetRequest 解碼依寵物列出醫療記錄請求
func decodeListMedicalRecordsByPetRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	petID := r.URL.Query().Get("pet_id")
	if petID == "" {
		return nil, gin.Error{Err: gin.Error{Type: gin.ErrorTypeBind, Meta: "pet_id is required"}.Err}
	}

	req := endpoint.ListMedicalRecordsByPetRequest{
		PetID: petID,
	}

	// 解析可選的日期參數
	if startDateStr := r.URL.Query().Get("start_date"); startDateStr != "" {
		if startDate, err := time.Parse(time.RFC3339, startDateStr); err == nil {
			req.StartDate = startDate
		}
	}

	if endDateStr := r.URL.Query().Get("end_date"); endDateStr != "" {
		if endDate, err := time.Parse(time.RFC3339, endDateStr); err == nil {
			req.EndDate = endDate
		}
	}

	return req, nil
}

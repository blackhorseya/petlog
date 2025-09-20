package gin

import (
	"context"
	"net/http"
	"strconv"

	"github.com/blackhorseya/petlog/internal/config"
	"github.com/blackhorseya/petlog/internal/endpoint"
	"github.com/gin-gonic/gin"
	httptransport "github.com/go-kit/kit/transport/http"
)

// RegisterHospitalRoutes 註冊醫院相關路由
func RegisterHospitalRoutes(r *gin.Engine, cfg config.Config, e endpoint.HospitalEndpoints, options ...httptransport.ServerOption) {
	// Error handler
	opts := []httptransport.ServerOption{
		httptransport.ServerErrorHandler(NewContextualLogErrorHandler()),
		httptransport.ServerErrorEncoder(encodeError),
	}
	opts = append(opts, options...)

	// Public endpoints (醫院資訊為公開資料)
	v1 := r.Group("/api/v1")
	hospitalRoutes := v1.Group("/hospitals")
	{
		hospitalRoutes.GET("", SearchHospitals(e, opts...))
		hospitalRoutes.GET("/:id", GetHospitalDetail(e, opts...))
		hospitalRoutes.GET("/nearby", ListNearbyHospitals(e, opts...))
	}
}

// SearchHospitals godoc
// @Summary      搜尋醫院
// @Description  根據關鍵字、縣市、狀態等條件搜尋醫院，支援分頁和排序
// @Tags         hospitals
// @Accept       json
// @Produce      json
// @Param        keyword      query     string  false  "搜尋關鍵字（醫院名稱、地址、獸醫師）"
// @Param        county       query     string  false  "縣市篩選"
// @Param        status       query     string  false  "狀態篩選（開業、歇業等）"
// @Param        license_type query     string  false  "執照類型篩選（動物醫院、動物診所）"
// @Param        latitude     query     number  false  "座標緯度（用於距離排序）"
// @Param        longitude    query     number  false  "座標經度（用於距離排序）"
// @Param        radius       query     number  false  "搜尋半徑（公里）"
// @Param        page         query     int     false  "頁碼（預設1）"
// @Param        limit        query     int     false  "每頁數量（預設20）"
// @Param        sort_by      query     string  false  "排序方式（distance, name）"
// @Success      200          {object}  endpoint.SearchHospitalsResponse
// @Failure      400          {object}  map[string]interface{}
// @Failure      500          {object}  map[string]interface{}
// @Router       /api/v1/hospitals [get]
func SearchHospitals(e endpoint.HospitalEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.SearchHospitalsEndpoint,
		decodeSearchHospitalsRequest,
		encodeResponse,
		options...,
	))
}

// GetHospitalDetail godoc
// @Summary      取得醫院詳細資訊
// @Description  根據醫院ID取得完整的醫院資訊
// @Tags         hospitals
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "醫院ID"
// @Success      200  {object}  endpoint.GetHospitalDetailResponse
// @Failure      400  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Router       /api/v1/hospitals/{id} [get]
func GetHospitalDetail(e endpoint.HospitalEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 直接處理 Gin 請求，不使用 go-kit wrapper
		req := endpoint.GetHospitalDetailRequest{
			HospitalID: c.Param("id"),
		}

		resp, err := e.GetHospitalDetailEndpoint(c.Request.Context(), req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if response, ok := resp.(endpoint.GetHospitalDetailResponse); ok {
			if response.Failed() != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": response.Failed().Error()})
				return
			}
			c.JSON(http.StatusOK, response)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid response type"})
		}
	}
}

// ListNearbyHospitals godoc
// @Summary      查詢附近醫院
// @Description  根據使用者位置座標搜尋指定半徑內的醫院
// @Tags         hospitals
// @Accept       json
// @Produce      json
// @Param        latitude  query     number  true   "使用者位置緯度"
// @Param        longitude query     number  true   "使用者位置經度"
// @Param        radius_km query     number  false  "搜尋半徑（公里，預設10）"
// @Param        limit     query     int     false  "結果數量限制（預設50）"
// @Success      200       {object}  endpoint.ListNearbyHospitalsResponse
// @Failure      400       {object}  map[string]interface{}
// @Failure      500       {object}  map[string]interface{}
// @Router       /api/v1/hospitals/nearby [get]
func ListNearbyHospitals(e endpoint.HospitalEndpoints, options ...httptransport.ServerOption) gin.HandlerFunc {
	return gin.WrapH(httptransport.NewServer(
		e.ListNearbyHospitalsEndpoint,
		decodeListNearbyHospitalsRequest,
		encodeResponse,
		options...,
	))
}

// Request decoders

func decodeSearchHospitalsRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var req endpoint.SearchHospitalsRequest

	// 解析查詢參數
	query := r.URL.Query()
	req.Keyword = query.Get("keyword")
	req.County = query.Get("county")
	req.Status = query.Get("status")
	req.LicenseType = query.Get("license_type")
	req.SortBy = query.Get("sort_by")

	// 解析數值參數
	if lat := query.Get("latitude"); lat != "" {
		if parsed, err := strconv.ParseFloat(lat, 64); err == nil {
			req.Latitude = parsed
		}
	}

	if lng := query.Get("longitude"); lng != "" {
		if parsed, err := strconv.ParseFloat(lng, 64); err == nil {
			req.Longitude = parsed
		}
	}

	if radius := query.Get("radius"); radius != "" {
		if parsed, err := strconv.ParseFloat(radius, 64); err == nil {
			req.Radius = parsed
		}
	}

	if page := query.Get("page"); page != "" {
		if parsed, err := strconv.Atoi(page); err == nil {
			req.Page = parsed
		}
	}

	if limit := query.Get("limit"); limit != "" {
		if parsed, err := strconv.Atoi(limit); err == nil {
			req.Limit = parsed
		}
	}

	return req, nil
}

func decodeListNearbyHospitalsRequest(_ context.Context, r *http.Request) (interface{}, error) {
	var req endpoint.ListNearbyHospitalsRequest

	query := r.URL.Query()

	// 必要參數
	if lat := query.Get("latitude"); lat != "" {
		if parsed, err := strconv.ParseFloat(lat, 64); err != nil {
			return nil, err
		} else {
			req.Latitude = parsed
		}
	}

	if lng := query.Get("longitude"); lng != "" {
		if parsed, err := strconv.ParseFloat(lng, 64); err != nil {
			return nil, err
		} else {
			req.Longitude = parsed
		}
	}

	// 選填參數
	if radius := query.Get("radius_km"); radius != "" {
		if parsed, err := strconv.ParseFloat(radius, 64); err == nil {
			req.RadiusKm = parsed
		}
	}

	if limit := query.Get("limit"); limit != "" {
		if parsed, err := strconv.Atoi(limit); err == nil {
			req.Limit = parsed
		}
	}

	return req, nil
}

package endpoint

import (
	"context"
	"errors"
	"time"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/usecase/command"
	"github.com/blackhorseya/petlog/internal/usecase/query"
	"github.com/go-kit/kit/endpoint"
)

// CreateMedicalRecordRequest 建立醫療記錄的請求結構
type CreateMedicalRecordRequest struct {
	PetID       string                  `json:"pet_id" binding:"required"`
	Type        model.MedicalRecordType `json:"type" binding:"required"`
	Description string                  `json:"description" binding:"required"`
	Date        time.Time               `json:"date" binding:"required"`
	NextDueDate *time.Time              `json:"next_due_date,omitempty"`
	Dosage      string                  `json:"dosage,omitempty"`
}

// CreateMedicalRecordResponse 建立醫療記錄的回應結構
type CreateMedicalRecordResponse struct {
	MedicalRecord *model.MedicalRecord `json:"medical_record,omitempty"`
	Err           error                `json:"error,omitempty"`
}

func (r CreateMedicalRecordResponse) Failed() error { return r.Err }

// GetMedicalRecordRequest 取得醫療記錄的請求結構
type GetMedicalRecordRequest struct {
	ID string `json:"id"`
}

// GetMedicalRecordResponse 取得醫療記錄的回應結構
type GetMedicalRecordResponse struct {
	MedicalRecord *model.MedicalRecord `json:"medical_record,omitempty"`
	Err           error                `json:"error,omitempty"`
}

func (r GetMedicalRecordResponse) Failed() error { return r.Err }

// ListMedicalRecordsByPetRequest 依寵物 ID 列出醫療記錄的請求結構
type ListMedicalRecordsByPetRequest struct {
	PetID     string    `json:"pet_id"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
}

// ListMedicalRecordsByPetResponse 依寵物 ID 列出醫療記錄的回應結構
type ListMedicalRecordsByPetResponse struct {
	MedicalRecords []*model.MedicalRecord `json:"medical_records,omitempty"`
	Err            error                  `json:"error,omitempty"`
}

func (r ListMedicalRecordsByPetResponse) Failed() error { return r.Err }

// UpdateMedicalRecordRequest 更新醫療記錄的請求結構
type UpdateMedicalRecordRequest struct {
	ID          string                  `json:"id"`
	PetID       string                  `json:"pet_id" binding:"required"`
	Type        model.MedicalRecordType `json:"type" binding:"required"`
	Description string                  `json:"description" binding:"required"`
	Date        time.Time               `json:"date" binding:"required"`
	NextDueDate *time.Time              `json:"next_due_date,omitempty"`
	Dosage      string                  `json:"dosage,omitempty"`
}

// UpdateMedicalRecordResponse 更新醫療記錄的回應結構
type UpdateMedicalRecordResponse struct {
	MedicalRecord *model.MedicalRecord `json:"medical_record,omitempty"`
	Err           error                `json:"error,omitempty"`
}

func (r UpdateMedicalRecordResponse) Failed() error { return r.Err }

// DeleteMedicalRecordRequest 刪除醫療記錄的請求結構
type DeleteMedicalRecordRequest struct {
	ID string `json:"id"`
}

// DeleteMedicalRecordResponse 刪除醫療記錄的回應結構
type DeleteMedicalRecordResponse struct {
	Err error `json:"error,omitempty"`
}

func (r DeleteMedicalRecordResponse) Failed() error { return r.Err }

// MedicalRecordEndpoints 聚合所有醫療記錄相關的 endpoints
type MedicalRecordEndpoints struct {
	CreateMedicalRecordEndpoint     endpoint.Endpoint
	GetMedicalRecordEndpoint        endpoint.Endpoint
	ListMedicalRecordsByPetEndpoint endpoint.Endpoint
	UpdateMedicalRecordEndpoint     endpoint.Endpoint
	DeleteMedicalRecordEndpoint     endpoint.Endpoint
}

// MakeMedicalRecordEndpoints 建立醫療記錄 endpoints
func MakeMedicalRecordEndpoints(
	createHandler *command.CreateMedicalRecordHandler,
	updateHandler *command.UpdateMedicalRecordHandler,
	deleteHandler *command.DeleteMedicalRecordHandler,
	getHandler *query.GetMedicalRecordByIDHandler,
	listHandler *query.ListMedicalRecordsByPetHandler,
) MedicalRecordEndpoints {
	return MedicalRecordEndpoints{
		CreateMedicalRecordEndpoint:     MakeCreateMedicalRecordEndpoint(createHandler),
		GetMedicalRecordEndpoint:        MakeGetMedicalRecordEndpoint(getHandler),
		ListMedicalRecordsByPetEndpoint: MakeListMedicalRecordsByPetEndpoint(listHandler),
		UpdateMedicalRecordEndpoint:     MakeUpdateMedicalRecordEndpoint(updateHandler),
		DeleteMedicalRecordEndpoint:     MakeDeleteMedicalRecordEndpoint(deleteHandler),
	}
}

// MakeCreateMedicalRecordEndpoint 建立新增醫療記錄的 endpoint
func MakeCreateMedicalRecordEndpoint(handler *command.CreateMedicalRecordHandler) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(CreateMedicalRecordRequest)

		medicalRecord := &model.MedicalRecord{
			PetID:       req.PetID,
			Type:        req.Type,
			Description: req.Description,
			Date:        req.Date,
			NextDueDate: req.NextDueDate,
			Dosage:      req.Dosage,
		}

		err := handler.Handle(ctx, medicalRecord)
		if err != nil {
			return CreateMedicalRecordResponse{Err: err}, nil
		}

		return CreateMedicalRecordResponse{MedicalRecord: medicalRecord}, nil
	}
}

// MakeGetMedicalRecordEndpoint 建立取得醫療記錄的 endpoint
func MakeGetMedicalRecordEndpoint(handler *query.GetMedicalRecordByIDHandler) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(GetMedicalRecordRequest)

		medicalRecord, err := handler.Handle(ctx, req.ID)
		if err != nil {
			return GetMedicalRecordResponse{Err: err}, nil
		}

		return GetMedicalRecordResponse{MedicalRecord: medicalRecord}, nil
	}
}

// MakeListMedicalRecordsByPetEndpoint 建立依寵物 ID 列出醫療記錄的 endpoint
func MakeListMedicalRecordsByPetEndpoint(handler *query.ListMedicalRecordsByPetHandler) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req, ok := request.(ListMedicalRecordsByPetRequest)
		if !ok {
			return ListMedicalRecordsByPetResponse{Err: errors.New("invalid request type")}, nil
		}
		medicalRecords, err := handler.Handle(ctx, req.PetID, req.StartDate, req.EndDate)
		if err != nil {
			return ListMedicalRecordsByPetResponse{Err: err}, nil
		}
		return ListMedicalRecordsByPetResponse{MedicalRecords: medicalRecords}, nil
	}
}

// MakeUpdateMedicalRecordEndpoint 建立更新醫療記錄的 endpoint
func MakeUpdateMedicalRecordEndpoint(handler *command.UpdateMedicalRecordHandler) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(UpdateMedicalRecordRequest)

		medicalRecord := &model.MedicalRecord{
			ID:          req.ID,
			PetID:       req.PetID,
			Type:        req.Type,
			Description: req.Description,
			Date:        req.Date,
			NextDueDate: req.NextDueDate,
			Dosage:      req.Dosage,
		}

		err := handler.Handle(ctx, medicalRecord)
		if err != nil {
			return UpdateMedicalRecordResponse{Err: err}, nil
		}

		return UpdateMedicalRecordResponse{MedicalRecord: medicalRecord}, nil
	}
}

// MakeDeleteMedicalRecordEndpoint 建立刪除醫療記錄的 endpoint
func MakeDeleteMedicalRecordEndpoint(handler *command.DeleteMedicalRecordHandler) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(DeleteMedicalRecordRequest)

		err := handler.Handle(ctx, req.ID)
		if err != nil {
			return DeleteMedicalRecordResponse{Err: err}, nil
		}

		return DeleteMedicalRecordResponse{}, nil
	}
}

package endpoint

import (
	"context"
	"time"

	"github.com/go-kit/kit/endpoint"

	"github.com/blackhorseya/petlog/internal/domain/model"
	"github.com/blackhorseya/petlog/internal/usecase/command"
	"github.com/blackhorseya/petlog/internal/usecase/query"
)

// ExpenseEndpoints collects all of the endpoints that compose an expense service.
type ExpenseEndpoints struct {
	CreateExpenseEndpoint     endpoint.Endpoint
	UpdateExpenseEndpoint     endpoint.Endpoint
	DeleteExpenseEndpoint     endpoint.Endpoint
	GetExpenseEndpoint        endpoint.Endpoint
	ListExpensesEndpoint      endpoint.Endpoint
	GetExpenseSummaryEndpoint endpoint.Endpoint
}

// MakeExpenseEndpoints returns an ExpenseEndpoints struct where each endpoint invokes
// the corresponding method on the provided service.
func MakeExpenseEndpoints(
	ch *command.CreateExpenseHandler,
	uh *command.UpdateExpenseHandler,
	dh *command.DeleteExpenseHandler,
	qh *query.GetExpenseByIDHandler,
	lh *query.ListExpensesByPetHandler,
	sh *query.GetExpenseSummaryHandler,
) ExpenseEndpoints {
	return ExpenseEndpoints{
		CreateExpenseEndpoint:     MakeCreateExpenseEndpoint(ch),
		UpdateExpenseEndpoint:     MakeUpdateExpenseEndpoint(uh),
		DeleteExpenseEndpoint:     MakeDeleteExpenseEndpoint(dh),
		GetExpenseEndpoint:        MakeGetExpenseEndpoint(qh),
		ListExpensesEndpoint:      MakeListExpensesEndpoint(lh),
		GetExpenseSummaryEndpoint: MakeGetExpenseSummaryEndpoint(sh),
	}
}

// CreateExpenseRequest 建立費用紀錄的請求結構
// 只需填寫必要欄位
// 金額 amount 為正整數，category 為預設分類之一
// 日期 date 採 RFC3339 字串
// 描述 description 可為空
// PetID 必填
// Example: {"pet_id":"xxx","category":"飼料","amount":100,"description":"買飼料","date":"2024-07-01"}
type CreateExpenseRequest struct {
	PetID       string    `json:"pet_id" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	Amount      int       `json:"amount" binding:"required,min=1"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" binding:"required"`
}

// CreateExpenseResponse 建立費用紀錄的回應結構
// 回傳完整 Expense
type CreateExpenseResponse struct {
	Expense *model.Expense `json:"expense,omitempty"`
	Err     error          `json:"error,omitempty"`
}

func (r CreateExpenseResponse) Failed() error { return r.Err }

func MakeCreateExpenseEndpoint(h *command.CreateExpenseHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(CreateExpenseRequest)
		cmd := command.CreateExpenseCommand{
			PetID:       req.PetID,
			Category:    req.Category,
			Amount:      req.Amount,
			Description: req.Description,
			Date:        req.Date,
		}

		expense, err := h.Handle(c, cmd)
		if err != nil {
			return CreateExpenseResponse{Err: err}, nil
		}
		return CreateExpenseResponse{Expense: expense, Err: nil}, nil
	}
}

// GetExpenseRequest 取得單筆費用紀錄的請求結構
type GetExpenseRequest struct {
	ID string `json:"id"`
}

// GetExpenseResponse 取得單筆費用紀錄的回應結構
type GetExpenseResponse struct {
	Expense *model.Expense `json:"expense,omitempty"`
	Err     error          `json:"error,omitempty"`
}

func (r GetExpenseResponse) Failed() error { return r.Err }

func MakeGetExpenseEndpoint(h *query.GetExpenseByIDHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(GetExpenseRequest)
		q := query.GetExpenseByIDQuery{ID: req.ID}

		expense, err := h.Handle(c, q)
		if err != nil {
			return GetExpenseResponse{Err: err}, nil
		}
		return GetExpenseResponse{Expense: expense, Err: nil}, nil
	}
}

// ListExpensesRequest 查詢費用紀錄的請求結構
type ListExpensesRequest struct {
	PetID     string `json:"pet_id,omitempty"`
	Category  string `json:"category,omitempty"`
	StartDate string `json:"start_date,omitempty"`
	EndDate   string `json:"end_date,omitempty"`
}

// ListExpensesResponse 查詢費用紀錄的回應結構
type ListExpensesResponse struct {
	Expenses []*model.Expense `json:"expenses,omitempty"`
	Err      error            `json:"error,omitempty"`
}

func (r ListExpensesResponse) Failed() error { return r.Err }

func MakeListExpensesEndpoint(h *query.ListExpensesByPetHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(ListExpensesRequest)
		q := query.ListExpensesByPetQuery{PetID: req.PetID}

		expenses, _, err := h.Handle(c, q)
		if err != nil {
			return ListExpensesResponse{Err: err}, nil
		}
		return ListExpensesResponse{Expenses: expenses, Err: nil}, nil
	}
}

// UpdateExpenseRequest 編輯費用紀錄的請求結構
type UpdateExpenseRequest struct {
	ID          string    `json:"id"`
	PetID       string    `json:"pet_id" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	Amount      int       `json:"amount" binding:"required,min=1"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" binding:"required"`
}

// UpdateExpenseResponse 編輯費用紀錄的回應結構
type UpdateExpenseResponse struct {
	Expense *model.Expense `json:"expense,omitempty"`
	Err     error          `json:"error,omitempty"`
}

func (r UpdateExpenseResponse) Failed() error { return r.Err }

func MakeUpdateExpenseEndpoint(h *command.UpdateExpenseHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(UpdateExpenseRequest)
		cmd := command.UpdateExpenseCommand{
			ID:          req.ID,
			PetID:       req.PetID,
			Amount:      req.Amount,
			Description: req.Description,
			Date:        req.Date,
		}

		expense, err := h.Handle(c, cmd)
		if err != nil {
			return UpdateExpenseResponse{Err: err}, nil
		}
		return UpdateExpenseResponse{Expense: expense, Err: nil}, nil
	}
}

// DeleteExpenseRequest 刪除費用紀錄的請求結構
type DeleteExpenseRequest struct {
	ID string `json:"id"`
}

// DeleteExpenseResponse 刪除費用紀錄的回應結構
type DeleteExpenseResponse struct {
	Err error `json:"error,omitempty"`
}

func (r DeleteExpenseResponse) Failed() error { return r.Err }

func MakeDeleteExpenseEndpoint(h *command.DeleteExpenseHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(DeleteExpenseRequest)
		cmd := command.DeleteExpenseCommand{ID: req.ID}

		err := h.Handle(c, cmd)
		if err != nil {
			return DeleteExpenseResponse{Err: err}, nil
		}
		return DeleteExpenseResponse{Err: nil}, nil
	}
}

// GetExpenseSummaryRequest 查詢費用摘要的請求結構
type GetExpenseSummaryRequest struct {
	PetID string `json:"pet_id,omitempty"`
}

// GetExpenseSummaryResponse 查詢費用摘要的回應結構
type GetExpenseSummaryResponse struct {
	TotalAmount   int              `json:"total_amount"`
	CategoryStats map[string]int   `json:"category_stats"`
	Recent        []*model.Expense `json:"recent,omitempty"`
	Err           error            `json:"error,omitempty"`
}

func (r GetExpenseSummaryResponse) Failed() error { return r.Err }

func MakeGetExpenseSummaryEndpoint(h *query.GetExpenseSummaryHandler) endpoint.Endpoint {
	return func(c context.Context, request interface{}) (interface{}, error) {
		req := request.(GetExpenseSummaryRequest)
		q := query.GetExpenseSummaryQuery{PetID: req.PetID}

		summary, err := h.Handle(c, q)
		if err != nil {
			return GetExpenseSummaryResponse{Err: err}, nil
		}
		return GetExpenseSummaryResponse{
			TotalAmount:   summary.TotalAmount,
			CategoryStats: summary.CategoryStats,
			Recent:        summary.Recent,
			Err:           nil,
		}, nil
	}
}

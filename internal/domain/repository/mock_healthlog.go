// Code generated by MockGen. DO NOT EDIT.
// Source: healthlog.go
//
// Generated by this command:
//
//	mockgen -destination=./mock_healthlog.go -package=repository -source=healthlog.go
//

// Package repository is a generated GoMock package.
package repository

import (
	context "context"
	reflect "reflect"
	time "time"

	model "github.com/blackhorseya/petlog/internal/domain/model"
	gomock "go.uber.org/mock/gomock"
)

// MockHealthLogRepository is a mock of HealthLogRepository interface.
type MockHealthLogRepository struct {
	ctrl     *gomock.Controller
	recorder *MockHealthLogRepositoryMockRecorder
	isgomock struct{}
}

// MockHealthLogRepositoryMockRecorder is the mock recorder for MockHealthLogRepository.
type MockHealthLogRepositoryMockRecorder struct {
	mock *MockHealthLogRepository
}

// NewMockHealthLogRepository creates a new mock instance.
func NewMockHealthLogRepository(ctrl *gomock.Controller) *MockHealthLogRepository {
	mock := &MockHealthLogRepository{ctrl: ctrl}
	mock.recorder = &MockHealthLogRepositoryMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockHealthLogRepository) EXPECT() *MockHealthLogRepositoryMockRecorder {
	return m.recorder
}

// CountByPetIDs mocks base method.
func (m *MockHealthLogRepository) CountByPetIDs(c context.Context, petIDs []string) (int, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "CountByPetIDs", c, petIDs)
	ret0, _ := ret[0].(int)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// CountByPetIDs indicates an expected call of CountByPetIDs.
func (mr *MockHealthLogRepositoryMockRecorder) CountByPetIDs(c, petIDs any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "CountByPetIDs", reflect.TypeOf((*MockHealthLogRepository)(nil).CountByPetIDs), c, petIDs)
}

// Create mocks base method.
func (m *MockHealthLogRepository) Create(c context.Context, log *model.HealthLog) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Create", c, log)
	ret0, _ := ret[0].(error)
	return ret0
}

// Create indicates an expected call of Create.
func (mr *MockHealthLogRepositoryMockRecorder) Create(c, log any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Create", reflect.TypeOf((*MockHealthLogRepository)(nil).Create), c, log)
}

// Delete mocks base method.
func (m *MockHealthLogRepository) Delete(c context.Context, id string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Delete", c, id)
	ret0, _ := ret[0].(error)
	return ret0
}

// Delete indicates an expected call of Delete.
func (mr *MockHealthLogRepositoryMockRecorder) Delete(c, id any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Delete", reflect.TypeOf((*MockHealthLogRepository)(nil).Delete), c, id)
}

// FindByID mocks base method.
func (m *MockHealthLogRepository) FindByID(c context.Context, id string) (*model.HealthLog, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByID", c, id)
	ret0, _ := ret[0].(*model.HealthLog)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// FindByID indicates an expected call of FindByID.
func (mr *MockHealthLogRepositoryMockRecorder) FindByID(c, id any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByID", reflect.TypeOf((*MockHealthLogRepository)(nil).FindByID), c, id)
}

// FindByPetID mocks base method.
func (m *MockHealthLogRepository) FindByPetID(c context.Context, petID string, startDate, endDate time.Time) ([]*model.HealthLog, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindByPetID", c, petID, startDate, endDate)
	ret0, _ := ret[0].([]*model.HealthLog)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// FindByPetID indicates an expected call of FindByPetID.
func (mr *MockHealthLogRepositoryMockRecorder) FindByPetID(c, petID, startDate, endDate any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindByPetID", reflect.TypeOf((*MockHealthLogRepository)(nil).FindByPetID), c, petID, startDate, endDate)
}

// Update mocks base method.
func (m *MockHealthLogRepository) Update(c context.Context, log *model.HealthLog) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Update", c, log)
	ret0, _ := ret[0].(error)
	return ret0
}

// Update indicates an expected call of Update.
func (mr *MockHealthLogRepositoryMockRecorder) Update(c, log any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Update", reflect.TypeOf((*MockHealthLogRepository)(nil).Update), c, log)
}

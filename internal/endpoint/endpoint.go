package endpoint

// Failer is an interface that should be implemented by response types.
// It allows business logic to declare its own error conditions.
type Failer interface {
	Failed() error
}

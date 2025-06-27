variable "aws_region" {
  description = "AWS 區域"
  type        = string
  default     = "ap-northeast-1"
}

variable "stage" {
  description = "部署階段（如 prod, int, dev）"
  type        = string
  default     = "int"
}

variable "mongo_uri" {
  description = "MongoDB 連線字串"
  type        = string
}

variable "auth0_domain" {
  description = "Auth0 域名"
  type        = string
}

variable "auth0_audience" {
  description = "Auth0 受眾"
  type        = string
}

variable "mongo_database" {
  description = "MongoDB 資料庫名稱"
  type        = string
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.0.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_ssm_parameter" "mongo_uri" {
  name      = "/petlog/${var.stage}/MONGO_URI"
  type      = "SecureString"
  value     = var.mongo_uri
  overwrite = true
}

resource "aws_ssm_parameter" "auth0_domain" {
  name      = "/petlog/${var.stage}/AUTH0_DOMAIN"
  type      = "String"
  value     = var.auth0_domain
  overwrite = true
}

resource "aws_ssm_parameter" "auth0_audience" {
  name      = "/petlog/${var.stage}/AUTH0_AUDIENCE"
  type      = "String"
  value     = var.auth0_audience
  overwrite = true
}

resource "aws_ssm_parameter" "mongo_database" {
  name      = "/petlog/${var.stage}/MONGO_DATABASE"
  type      = "String"
  value     = var.mongo_database
  overwrite = true
}

resource "aws_ssm_parameter" "google_maps_api_key" {
  name      = "/petlog/${var.stage}/GOOGLE_MAPS_API_KEY"
  type      = "SecureString"
  value     = var.google_maps_api_key
  overwrite = true
}

# 取得 AWS Account ID
data "aws_caller_identity" "current" {}

# Lambda 讀取 SSM 參數與 KMS 解密的 IAM Policy
resource "aws_iam_policy" "lambda_ssm_read" {
  name        = "petlog-lambda-ssm-read"
  description = "允許 Lambda 讀取 SSM 參數與 KMS 解密"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
          "kms:Decrypt"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/petlog/${var.stage}/*"
        ]
      }
    ]
  })
}

# Lambda 執行角色
resource "aws_iam_role" "lambda_exec" {
  name = "petlog-lambda-exec-${var.stage}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Attach SSM 讀取 policy 給 Lambda 執行角色
resource "aws_iam_role_policy_attachment" "lambda_ssm_read_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_ssm_read.arn
}

# Attach AWSLambdaBasicExecutionRole（CloudWatch Logs 權限）
resource "aws_iam_role_policy_attachment" "lambda_basic_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

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

terraform {
  required_version = ">= 1.0"

  # Backend remoto: los valores reales (bucket, key, region, dynamodb_table)
  # se pasan con -backend-config en `terraform init` (ver cd.yml / cd-temporal.yml).
  # Esto evita hardcodear el nombre del bucket en el repo.
  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "0.9.1"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 2. El proveedor ESPECIAL, que se usará únicamente para el WAF de CloudFront.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1" # La única región permitida para WAF + CloudFront
}

# Variables locales
locals {
  project_name = "reclamos-ciudadanos"
  environment  = var.environment

  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "Terraform"
  }
}
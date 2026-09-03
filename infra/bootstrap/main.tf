# Bootstrap do estado do Terraform da Lumarys.
#
# Roda UMA vez, com estado local, antes de qualquer coisa em infra/. Cria só o
# bucket que guarda o estado remoto do resto. Bucket próprio (e não o da YouCo)
# porque a Lumarys é outra marca e o repositório é público: separar o estado
# separa também o raio de alcance de um erro.
#
#   cd infra/bootstrap && terraform init && terraform apply

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.101.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "lumarys"
      Component   = "bootstrap"
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}

variable "aws_region" {
  description = "Região da AWS. CloudFront e ACM exigem us-east-1 no resto da stack."
  type        = string
  default     = "us-east-1"
}

resource "aws_s3_bucket" "state" {
  bucket = "lumarys-terraform-state"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket" {
  value       = aws_s3_bucket.state.id
  description = "Nome do bucket de estado, usado no backend de infra/."
}

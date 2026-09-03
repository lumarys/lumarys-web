# Infraestrutura da Lumarys — site estático, autenticação e API de progresso.
#
# Apply é HUMANO, nunca do CI: o CI só publica o build no S3, invalida o
# CloudFront e atualiza o código da Lambda. Antes de todo apply, revise o plan
# procurando qualquer mudança em registro MX ou TXT: a zona lumarys.com.br
# recebe e-mail pelo Zoho e esses registros foram criados fora do Terraform.

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.101.0"
    }
  }

  backend "s3" {
    bucket       = "lumarys-terraform-state"
    key          = "prod/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "lumarys"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

data "aws_caller_identity" "atual" {}

locals {
  conta = data.aws_caller_identity.atual.account_id
  nome  = "lumarys-${var.environment}"
  apex  = var.dominio
  www   = "www.${var.dominio}"
  api   = "api.${var.dominio}"
}

# A zona já existe e tem os registros de e-mail do Zoho. Só LEMOS a zona; nunca
# a criamos nem a gerenciamos por inteiro.
data "aws_route53_zone" "lumarys" {
  name         = "${var.dominio}."
  private_zone = false
}

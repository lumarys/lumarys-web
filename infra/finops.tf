# FinOps: o que impede a conta de crescer sozinha.
#
# A arquitetura já é barata por construção — não há NAT gateway, EC2, RDS,
# balanceador nem nada cobrado por hora. O que sobra são três riscos reais:
# lixo que se acumula, pico inesperado e falta de visibilidade.

# ── 1. Versões antigas do site ────────────────────────────────────────────────
# O bucket é versionado (protege contra um `s3 sync --delete` errado), mas cada
# deploy cria uma versão nova de cada arquivo alterado. Sem expiração isso
# cresce para sempre: dois deploys já tinham deixado 508 versões.
resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    id     = "expirar-versoes-antigas"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      # 30 dias é folga suficiente para reverter um deploy ruim; passou disso,
      # a reversão é reconstruir do git, que é a fonte da verdade.
      noncurrent_days = 30
    }
  }

  rule {
    id     = "limpar-uploads-incompletos"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      # Upload interrompido cobra armazenamento e não aparece na listagem.
      days_after_initiation = 7
    }
  }
}

# ── 2. Histórico do estado do Terraform ───────────────────────────────────────
# Aqui o histórico vale mais (é o que permite voltar um apply), então o prazo é
# maior. Ainda assim tem prazo.
resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = "lumarys-terraform-state"

  rule {
    id     = "expirar-estados-antigos"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  rule {
    id     = "limpar-uploads-incompletos"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# ── 3. Anomalia de custo ──────────────────────────────────────────────────────
# O orçamento avisa quando o mês inteiro passa do teto. A detecção de anomalia
# avisa no dia em que algo sai do padrão, que é quando ainda dá para agir. É
# gratuita.
resource "aws_ce_anomaly_monitor" "lumarys" {
  name              = "${local.nome}-anomalia"
  monitor_type      = "CUSTOM"
  monitor_dimension = null

  monitor_specification = jsonencode({
    Tags = {
      Key          = "Project"
      Values       = ["lumarys"]
      MatchOptions = ["EQUALS"]
    }
  })

  # A AWS devolve a especificação com chaves nulas a mais e o Terraform lê
  # isso como mudança, recriando o monitor a cada apply. Ignorar depois de
  # criado é o único jeito de manter o plan limpo.
  lifecycle {
    ignore_changes = [monitor_specification]
  }
}

resource "aws_ce_anomaly_subscription" "lumarys" {
  name             = "${local.nome}-anomalia"
  frequency        = "DAILY"
  monitor_arn_list = [aws_ce_anomaly_monitor.lumarys.arn]

  subscriber {
    type    = "EMAIL"
    address = var.email_operacional
  }

  threshold_expression {
    dimension {
      key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
      values        = ["5"]
      match_options = ["GREATER_THAN_OR_EQUAL"]
    }
  }
}

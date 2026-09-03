# API de progresso: HTTP API com autorizador JWT do Cognito, uma Lambda e uma
# tabela DynamoDB. Guarda o mínimo — quem é o usuário (o `sub` do token) e o
# que ele já estudou.

resource "aws_dynamodb_table" "progresso" {
  name         = "${local.nome}-progresso"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  # LGPD: conta sem uso por 24 meses expira sozinha. O `expiresAt` é renovado a
  # cada gravação pela Lambda.
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  deletion_protection_enabled = true
}

# ── Lambda ────────────────────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${local.nome}-progresso-api"
  retention_in_days = var.retencao_logs_dias
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api" {
  name               = "${local.nome}-progresso-api"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy" "api" {
  name = "progresso-api"
  role = aws_iam_role.api.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "Logs"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.api.arn}:*"
      },
      {
        Sid    = "ProgressoDoUsuario"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:BatchWriteItem",
        ]
        Resource = aws_dynamodb_table.progresso.arn
      },
      {
        # Excluir a conta apaga também o usuário no Cognito, senão o e-mail
        # continuaria guardado depois do pedido de eliminação.
        Sid      = "ExcluirConta"
        Effect   = "Allow"
        Action   = ["cognito-idp:AdminDeleteUser"]
        Resource = aws_cognito_user_pool.alunos.arn
      },
    ]
  })
}

resource "aws_lambda_function" "api" {
  function_name = "${local.nome}-progresso-api"
  role          = aws_iam_role.api.arn
  runtime       = "nodejs24.x"
  handler       = "index.handler"
  timeout       = 15
  memory_size   = 256
  architectures = ["arm64"]

  filename         = "${path.module}/../services/progress-api/dist/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../services/progress-api/dist/lambda.zip")

  environment {
    variables = {
      TABELA           = aws_dynamodb_table.progresso.name
      USER_POOL_ID     = aws_cognito_user_pool.alunos.id
      ORIGEM_PERMITIDA = "https://${local.apex}"
    }
  }

  depends_on = [aws_cloudwatch_log_group.api]

  # O código é publicado pelo CI com update-function-code. Sem isto, todo plan
  # futuro apareceria sujo com uma mudança de código que não é real.
  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

# ── HTTP API ──────────────────────────────────────────────────────────────────

resource "aws_apigatewayv2_api" "progresso" {
  name          = "${local.nome}-progresso"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins     = ["https://${local.apex}"]
    allow_methods     = ["GET", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["authorization", "content-type"]
    max_age           = 600
    allow_credentials = false
  }
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.progresso.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.web.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.alunos.id}"
  }
}

resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.progresso.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

locals {
  rotas = [
    "GET /me/progresso",
    "PUT /me/progresso/{trilha}",
    "PUT /me/cards/{trilha}",
    "GET /me/exportar",
    "DELETE /me",
  ]
}

resource "aws_apigatewayv2_route" "rotas" {
  for_each = toset(local.rotas)

  api_id             = aws_apigatewayv2_api.progresso.id
  route_key          = each.value
  target             = "integrations/${aws_apigatewayv2_integration.api.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.progresso.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = 10
    throttling_burst_limit = 20
  }
}

resource "aws_lambda_permission" "api" {
  statement_id  = "AllowAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.progresso.execution_arn}/*/*"
}

# ── Domínio da API ────────────────────────────────────────────────────────────

resource "aws_acm_certificate" "api" {
  domain_name       = local.api
  validation_method = "DNS"

  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "api_validacao" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options :
    dvo.domain_name => { name = dvo.resource_record_name, type = dvo.resource_record_type, valor = dvo.resource_record_value }
  }

  zone_id         = data.aws_route53_zone.lumarys.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.valor]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for r in aws_route53_record.api_validacao : r.fqdn]
}

resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = local.api

  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.api.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api" {
  api_id      = aws_apigatewayv2_api.progresso.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.prod.id
}

resource "aws_route53_record" "api_a" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = local.api
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# ── Alarmes ───────────────────────────────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${local.nome}-api-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5xx"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "A API de progresso está devolvendo erro de servidor."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.ses_retorno.arn]

  dimensions = {
    ApiId = aws_apigatewayv2_api.progresso.id
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_erros" {
  alarm_name          = "${local.nome}-lambda-erros"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.ses_retorno.arn]

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }
}

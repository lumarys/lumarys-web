# Limite de requisições por IP na porta de entrada da conta.
#
# O que este WAF protege é o Cognito: SignUp, InitiateAuth e
# RespondToAuthChallenge. É por ali que chega o abuso que custa dinheiro e
# reputação — cadastro em massa gera e-mail pelo SES, e tentativa repetida de
# código é o único ataque possível num login sem senha. O Cognito já limita
# tentativas por desafio; o que ele não limita é quantos desafios um mesmo IP
# abre por minuto, e é isso que entra aqui.
#
# A API de progresso fica de fora por limitação da AWS, não por escolha: WAF
# não se associa a HTTP API (apigatewayv2), só a REST API, CloudFront, Cognito
# e afins. A API já exige JWT válido antes de tocar na Lambda e tem
# throttling global no stage (10 rps, rajada 20). Para ter limite por IP nela
# seria preciso pôr um CloudFront na frente ou migrar para REST API — as duas
# são decisões maiores que este card.
#
# Custo: US$ 5/mês pelo web ACL, US$ 1/mês pela regra e US$ 0,60 por milhão de
# requisições. Com o tráfego atual, cerca de US$ 6/mês — dentro do alerta de
# orçamento de US$ 20, mas é gasto novo e recorrente.

# 100 requisições em 5 minutos por IP. Uma entrada legítima usa 3 chamadas
# (SignUp, InitiateAuth, RespondToAuthChallenge) mais a renovação de token;
# quem passa de 100 está automatizando. É o mínimo que o WAF aceita numa regra
# de taxa, e serve: o objetivo é frear script, não apertar gente.
locals {
  waf_limite_por_ip_5min = 100
}

resource "aws_wafv2_web_acl" "cognito" {
  name        = "${local.nome}-cognito"
  description = "Limite por IP nas chamadas de cadastro e login."
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "limite-por-ip"
    priority = 1

    action {
      block {
        custom_response {
          # 429 e não 403: diz ao cliente que é volume, não permissão, e o
          # front pode mostrar "tente daqui a pouco" em vez de "acesso negado".
          response_code = 429
        }
      }
    }

    statement {
      rate_based_statement {
        limit              = local.waf_limite_por_ip_5min
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.nome}-cognito-limite-por-ip"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.nome}-cognito"
    sampled_requests_enabled   = true
  }
}

resource "aws_wafv2_web_acl_association" "cognito" {
  resource_arn = aws_cognito_user_pool.alunos.arn
  web_acl_arn  = aws_wafv2_web_acl.cognito.arn
}

# Alarme quando o limite começa a bloquear de verdade. Sem isto o WAF vira
# caixa preta: a pessoa bloqueada não avisa, e o dono só descobre se olhar o
# painel. Cinco bloqueios em cinco minutos é sinal de script; um ou dois pode
# ser alguém tentando entrar de novo depois de errar.
resource "aws_cloudwatch_metric_alarm" "waf_cognito_bloqueios" {
  alarm_name          = "${local.nome}-waf-cognito-bloqueios"
  alarm_description   = "O WAF do Cognito está bloqueando requisições: possível cadastro ou login automatizado."
  namespace           = "AWS/WAFV2"
  metric_name         = "BlockedRequests"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 5
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  # Mesmo tópico dos alarmes de 5xx e de erro da Lambda: um só lugar para
  # tudo que pede olhar humano.
  alarm_actions = [aws_sns_topic.ses_retorno.arn]

  dimensions = {
    WebACL = aws_wafv2_web_acl.cognito.name
    Region = var.aws_region
    Rule   = "limite-por-ip"
  }
}

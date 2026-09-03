# Conta do aluno: login sem senha, por código de seis dígitos no e-mail.
#
# Sem senha por decisão de segurança: não existe senha para vazar, reusar ou
# ser adivinhada, e some o suporte de "esqueci minha senha". O tier Essentials
# é o que habilita EMAIL_OTP como primeiro fator, e é gratuito até 10 mil
# usuários ativos por mês.

resource "aws_cognito_user_pool" "alunos" {
  name           = "${local.nome}-alunos"
  user_pool_tier = "ESSENTIALS"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  sign_in_policy {
    allowed_first_auth_factors = ["EMAIL_OTP"]
  }

  # Não revela se um e-mail já tem conta: fecha a enumeração de usuários.
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 5
      max_length = 254
    }
  }

  email_configuration {
    email_sending_account = "DEVELOPER"
    from_email_address    = "Lumarys <no-reply@${var.dominio}>"
    source_arn            = aws_sesv2_email_identity.lumarys.arn
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Seu código de acesso à Lumarys"
    email_message        = <<-TXT
      Seu código de acesso é {####}.

      Ele vale por poucos minutos e serve para uma entrada só.

      A Lumarys nunca pede senha, e nunca pede este código por telefone ou
      mensagem. Se não foi você que pediu, ignore este e-mail.

      Este endereço não recebe respostas. Precisa falar com a gente?
      ${var.email_operacional}
    TXT
  }

  user_pool_add_ons {
    advanced_security_mode = "AUDIT"
  }

  deletion_protection = "ACTIVE"

  lifecycle {
    ignore_changes = [schema]
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.nome}-web"
  user_pool_id = aws_cognito_user_pool.alunos.id

  # Cliente público (roda no navegador): sem segredo, por definição.
  generate_secret = false

  explicit_auth_flows = ["ALLOW_USER_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  enable_token_revocation       = true
  prevent_user_existence_errors = "ENABLED"

  read_attributes  = ["email", "email_verified"]
  write_attributes = ["email"]
}

# ── Envio dos códigos ─────────────────────────────────────────────────────────
# Identidade de DOMÍNIO, verificada só por DNS: a Lumarys não tem caixa de
# e-mail e não precisa ter para enviar.

resource "aws_sesv2_email_identity" "lumarys" {
  email_identity = var.dominio

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }
}

resource "aws_route53_record" "dkim" {
  count = 3

  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = "${aws_sesv2_email_identity.lumarys.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${var.dominio}"
  type    = "CNAME"
  ttl     = 3600
  records = ["${aws_sesv2_email_identity.lumarys.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

# MAIL FROM em subdomínio próprio. O TXT do apex, que tem o SPF do Zoho, não é
# tocado — mexer nele derrubaria o e-mail humano do domínio.
resource "aws_sesv2_email_identity_mail_from_attributes" "lumarys" {
  email_identity         = aws_sesv2_email_identity.lumarys.email_identity
  mail_from_domain       = "mail.${var.dominio}"
  behavior_on_mx_failure = "USE_DEFAULT_VALUE"
}

resource "aws_route53_record" "mail_from_mx" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = "mail.${var.dominio}"
  type    = "MX"
  ttl     = 3600
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

resource "aws_route53_record" "mail_from_spf" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = "mail.${var.dominio}"
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 include:amazonses.com ~all"]
}

resource "aws_route53_record" "dmarc" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = "_dmarc.${var.dominio}"
  type    = "TXT"
  ttl     = 3600
  # p=none no começo: monitorar antes de endurecer, para não quarentenar
  # e-mail legítimo do Zoho por engano.
  records = ["v=DMARC1; p=none; np=reject; rua=mailto:${var.email_operacional}; fo=1"]
}

# Retorno de bounce e reclamação vai para a Cernyn, já que a Lumarys não tem caixa.
resource "aws_sns_topic" "ses_retorno" {
  name = "${local.nome}-ses-retorno"
}

resource "aws_sns_topic_subscription" "ses_retorno" {
  topic_arn = aws_sns_topic.ses_retorno.arn
  protocol  = "email"
  endpoint  = var.email_operacional
}

resource "aws_sesv2_configuration_set" "lumarys" {
  configuration_set_name = "${local.nome}-envio"

  delivery_options {
    tls_policy = "REQUIRE"
  }

  reputation_options {
    reputation_metrics_enabled = true
  }
}

resource "aws_sesv2_configuration_set_event_destination" "retorno" {
  configuration_set_name = aws_sesv2_configuration_set.lumarys.configuration_set_name
  event_destination_name = "bounces-e-reclamacoes"

  event_destination {
    enabled              = true
    matching_event_types = ["BOUNCE", "COMPLAINT", "REJECT"]

    sns_destination {
      topic_arn = aws_sns_topic.ses_retorno.arn
    }
  }
}

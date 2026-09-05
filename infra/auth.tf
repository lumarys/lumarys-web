# Conta do aluno: login sem senha, por código de oito dígitos no e-mail.
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

  # O Cognito recusa a criação do pool se PASSWORD não estiver na lista, mesmo
  # quando o produto é sem senha. Na prática isso não abre porta: o cliente web
  # só oferece o fluxo de código, ninguém cadastra senha, e um usuário sem
  # senha não consegue autenticar por PASSWORD. A política abaixo existe para o
  # caso de alguém criar uma senha por via administrativa.
  sign_in_policy {
    allowed_first_auth_factors = ["EMAIL_OTP", "PASSWORD"]
  }

  password_policy {
    minimum_length                   = 14
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 1
  }

  # Não revela se um e-mail já tem conta: fecha a enumeração de usuários.
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Recuperação por administrador, não por e-mail. Duas razões: não existe senha
  # para recuperar num pool sem senha, e o Cognito recusa configurar o e-mail
  # como fator de código quando o mesmo e-mail é o canal de recuperação.
  account_recovery_setting {
    recovery_mechanism {
      name     = "admin_only"
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

  # Um e-mail só para entrar. O gatilho de pré-cadastro confirma a conta no
  # SignUp, então o único e-mail que o aluno vê é o do desafio EMAIL_OTP, cujo
  # template é o de "MFA por e-mail" (é assim que o Cognito chama, e a própria
  # documentação diz que ele vale para "MFA and sign-in with email OTPs"). O
  # template de verificação fica com o mesmo texto, de reserva: só sairia se o
  # gatilho fosse removido.
  #
  # MFA fica OPCIONAL, nunca obrigatória: o Cognito recusa EMAIL_OTP como
  # primeiro fator em pool com MFA obrigatória, e recusa configurar o template
  # com MFA desligada. Opcional não pede segundo fator de ninguém — só quem
  # registra um fator preferido é desafiado, e o app nunca registra.
  mfa_configuration = "OPTIONAL"

  email_mfa_configuration {
    subject = local.email_codigo_assunto
    message = local.email_codigo_html
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = local.email_codigo_assunto
    email_message        = local.email_codigo_html
  }

  lambda_config {
    pre_sign_up = aws_lambda_function.pre_signup.arn
  }

  # Threat Protection do Cognito exige o tier PLUS, que é pago. No ESSENTIALS
  # a defesa contra tentativa em massa fica no rate limit do WAF (card de
  # débito no board) e no próprio limite de tentativas do código de e-mail.

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

# ── E-mail do código ──────────────────────────────────────────────────────────
#
# HTML simples, de tabela, como todo e-mail transacional que precisa abrir bem
# no Gmail do celular: cartão claro, código grande e copiável, aviso
# anti-phishing e o canal de contato. O {####} é onde o Cognito põe o código.

locals {
  email_codigo_assunto = "Seu código de acesso à Lumarys"

  email_codigo_html = <<-HTML
    <!doctype html>
    <html lang="pt-BR">
    <body style="margin:0;padding:0;background:#FAF8F3;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#14181F;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAF8F3;">
        <tr><td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#FFFFFF;border:1px solid #E4DFD2;border-radius:16px;">
            <tr><td style="padding:28px 28px 8px 28px;">
              <span style="display:inline-block;width:12px;height:12px;border-radius:12px;background:#F5B83D;vertical-align:middle;"></span>
              <span style="font-size:18px;font-weight:600;letter-spacing:-0.01em;vertical-align:middle;padding-left:8px;">lumarys</span>
            </td></tr>
            <tr><td style="padding:8px 28px 0 28px;font-size:16px;line-height:24px;">
              Use este código para entrar na Lumarys:
            </td></tr>
            <tr><td style="padding:20px 28px;">
              <div style="background:#0B1220;color:#F4F1EA;border-radius:12px;padding:20px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;font-family:'SF Mono',Menlo,Consolas,monospace;">{####}</div>
            </td></tr>
            <tr><td style="padding:0 28px;font-size:14px;line-height:22px;color:#5E5A50;">
              Ele vale por poucos minutos e serve para uma entrada só. Se você não pediu este código, ignore este e-mail: sem ele ninguém entra na sua conta.
            </td></tr>
            <tr><td style="padding:16px 28px 0 28px;font-size:14px;line-height:22px;color:#5E5A50;">
              A Lumarys nunca pede senha, e nunca pede este código por telefone ou mensagem.
            </td></tr>
            <tr><td style="padding:24px 28px 28px 28px;font-size:12px;line-height:18px;color:#8F8B80;border-top:1px solid #E4DFD2;">
              Este endereço não recebe respostas. Precisa falar com a gente? ${var.email_operacional}<br>
              Lumarys é uma marca da Cernyn · lumarys.com.br
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  HTML
}

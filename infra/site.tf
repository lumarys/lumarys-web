# Site estático: S3 privado + CloudFront com OAC, certificado ACM e DNS.
# Base: youco-io-core/infra/hosting-app.tf, com três diferenças deliberadas —
# não é SPA (404 é 404 de verdade), tem função de viewer-request para as URLs
# com barra final, e carrega uma política de cabeçalhos de segurança.

resource "aws_s3_bucket" "site" {
  bucket = "lumarys-site-${var.environment}"
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${local.nome}-site-oac"
  description                       = "OAC do bucket do site da Lumarys"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFront"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.site.arn}/*"
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.site.arn }
      }
    }]
  })
}

# ── Certificado ───────────────────────────────────────────────────────────────

resource "aws_acm_certificate" "site" {
  domain_name               = local.apex
  subject_alternative_names = [local.www]
  validation_method         = "DNS"

  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "site_validacao" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options :
    dvo.domain_name => { name = dvo.resource_record_name, type = dvo.resource_record_type, valor = dvo.resource_record_value }
  }

  zone_id         = data.aws_route53_zone.lumarys.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.valor]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.site_validacao : r.fqdn]
}

# ── Roteamento na borda ───────────────────────────────────────────────────────

# O export do Next escreve /caminho/index.html. O CloudFront não resolve isso
# sozinho, e ainda precisamos mandar www para o apex numa resposta só.
resource "aws_cloudfront_function" "roteamento" {
  name    = "${local.nome}-roteamento"
  runtime = "cloudfront-js-2.0"
  comment = "www -> apex (301) e /caminho/ -> /caminho/index.html"
  publish = true

  code = <<-JS
    function handler(event) {
      var request = event.request;
      var host = request.headers.host ? request.headers.host.value : "";

      if (host === "${local.www}") {
        return {
          statusCode: 301,
          statusDescription: "Moved Permanently",
          headers: { location: { value: "https://${local.apex}" + request.uri } }
        };
      }

      var uri = request.uri;
      if (uri.endsWith("/")) {
        request.uri = uri + "index.html";
      } else if (!uri.includes(".")) {
        request.uri = uri + "/index.html";
      }
      return request;
    }
  JS
}

resource "aws_cloudfront_response_headers_policy" "seguranca" {
  name    = "${local.nome}-seguranca"
  comment = "HSTS com preload, frame-ancestors e o básico; a CSP de scripts vem na página"

  # A Content-Security-Policy completa NÃO fica aqui. O Next.js hidrata a
  # página com scripts inline cujo conteúdo muda por página e por build; uma
  # política fixa no CDN teria bloqueado a hidratação — e bloqueou, no primeiro
  # dia em produção. Cada página carrega a própria política numa <meta>, com o
  # hash dos seus scripts (scripts/csp.mjs). Aqui fica só o que a <meta> não
  # consegue expressar: frame-ancestors.
  security_headers_config {
    content_security_policy {
      override                = true
      content_security_policy = "frame-ancestors 'none'"
    }

    strict_transport_security {
      override                   = true
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
    }

    content_type_options { override = true }
    frame_options {
      override     = true
      frame_option = "DENY"
    }
    referrer_policy {
      override        = true
      referrer_policy = "strict-origin-when-cross-origin"
    }
    xss_protection {
      override   = true
      protection = true
      mode_block = true
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      override = true
      # O microfone fica liberado só para a própria origem: é o simulado oral.
      value = "geolocation=(), camera=(), payment=(), usb=(), microphone=(self)"
    }
  }
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [local.apex, local.www]
  price_class         = "PriceClass_100"
  comment             = "Lumarys — site estático"

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-site"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-site"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.otimizado.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.seguranca.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.roteamento.arn
    }
  }

  # Site multi-página: 404 é 404, com a página de erro do próprio site.
  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 300
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

data "aws_cloudfront_cache_policy" "otimizado" {
  name = "Managed-CachingOptimized"
}

# ── DNS do site ───────────────────────────────────────────────────────────────
# Só A e AAAA. Nenhum MX ou TXT é criado ou alterado aqui.

resource "aws_route53_record" "apex_a" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = local.apex
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = local.apex
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_a" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = local.www
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_aaaa" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = local.www
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

# Só a Amazon pode emitir certificado para este domínio.
resource "aws_route53_record" "caa" {
  zone_id = data.aws_route53_zone.lumarys.zone_id
  name    = local.apex
  type    = "CAA"
  ttl     = 3600

  records = [
    "0 issue \"amazon.com\"",
    "0 issuewild \";\"",
    "0 iodef \"mailto:${var.email_operacional}\"",
  ]
}

output "site_bucket" {
  value       = aws_s3_bucket.site.id
  description = "Bucket do site; usado pelo passo de sync do deploy."
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.site.id
  description = "Distribuição a invalidar depois do deploy."
}

output "cloudfront_dominio" {
  value       = aws_cloudfront_distribution.site.domain_name
  description = "Domínio da distribuição, para conferência de DNS."
}

output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "Valor da variável AWS_ROLE_ARN no repositório do GitHub."
}

output "cognito_user_pool_id" {
  value       = aws_cognito_user_pool.alunos.id
  description = "Valor de NEXT_PUBLIC_COGNITO_USER_POOL_ID."
}

output "cognito_client_id" {
  value       = aws_cognito_user_pool_client.web.id
  description = "Valor de NEXT_PUBLIC_COGNITO_CLIENT_ID (cliente público, sem segredo)."
}

output "api_url" {
  value       = "https://${local.api}"
  description = "Valor de NEXT_PUBLIC_API_URL."
}

output "lambda_progresso" {
  value       = aws_lambda_function.api.function_name
  description = "Função que o CI atualiza."
}

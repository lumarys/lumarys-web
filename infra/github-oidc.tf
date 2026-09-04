# Papel que o GitHub Actions assume para publicar.
#
# O `sub` é restrito ao AMBIENTE `production`, não ao repositório inteiro: sem
# isso, qualquer branch ou pull request conseguiria publicar em produção. O
# repositório é público, então essa diferença é a que importa de verdade.

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# O GitHub passou a emitir o `sub` no formato IMUTÁVEL, com os IDs numéricos da
# organização e do repositório em vez dos nomes:
#
#   repo:<org>@<orgId>/<repo>@<repoId>:environment:production
#
# É mais seguro que o formato antigo, porque renomear a org ou o repositório não
# transfere a confiança para quem ficar com o nome livre. Aceitamos os dois
# porque repositórios criados antes da mudança ainda usam o formato por nome.
#
# Descubra os IDs com:
#   gh api /repos/<org>/<repo> --jq '"\(.owner.id) \(.id)"'
locals {
  subs_permitidos = compact([
    "repo:${var.github_repo}:environment:production",
    var.github_org_id != "" && var.github_repo_id != "" ? format(
      "repo:%s@%s/%s@%s:environment:production",
      split("/", var.github_repo)[0],
      var.github_org_id,
      split("/", var.github_repo)[1],
      var.github_repo_id,
    ) : "",
    var.github_repo_alternativo != "" ? "repo:${var.github_repo_alternativo}:environment:production" : "",
  ])
}

data "aws_iam_policy_document" "github_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = local.subs_permitidos
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "${local.nome}-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_assume.json
  description        = "Publica o site da Lumarys e atualiza o código da API"
}

resource "aws_iam_role_policy" "github_actions" {
  name = "publicar"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListarBucketDoSite"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.site.arn
      },
      {
        Sid      = "EscreverNoSite"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.site.arn}/*"
      },
      {
        Sid      = "InvalidarCache"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.site.arn
      },
      {
        Sid      = "PublicarCodigoDasLambdas"
        Effect   = "Allow"
        Action   = ["lambda:UpdateFunctionCode", "lambda:GetFunction"]
        Resource = [aws_lambda_function.api.arn, aws_lambda_function.pre_signup.arn]
      },
    ]
  })
}

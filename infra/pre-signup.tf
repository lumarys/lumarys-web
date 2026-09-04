# Gatilho de pré-cadastro do Cognito: confirma o usuário no ato do SignUp.
#
# Sem ele, a primeira entrada manda um e-mail de confirmação (6 dígitos, um
# template) e as seguintes mandam o de login (8 dígitos, outro template). Com
# a conta já confirmada, toda entrada passa pelo mesmo desafio EMAIL_OTP: um
# e-mail só, sempre igual. Custo: uma execução de milissegundos por cadastro,
# dentro do nível gratuito da Lambda.

resource "aws_cloudwatch_log_group" "pre_signup" {
  name              = "/aws/lambda/${local.nome}-pre-signup"
  retention_in_days = 30
}

resource "aws_iam_role" "pre_signup" {
  name               = "${local.nome}-pre-signup"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy" "pre_signup" {
  name = "pre-signup"
  role = aws_iam_role.pre_signup.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "Logs"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.pre_signup.arn}:*"
      },
    ]
  })
}

resource "aws_lambda_function" "pre_signup" {
  function_name = "${local.nome}-pre-signup"
  role          = aws_iam_role.pre_signup.arn
  runtime       = "nodejs24.x"
  handler       = "index.handler"
  timeout       = 5
  memory_size   = 128
  architectures = ["arm64"]

  filename         = "${path.module}/../services/pre-signup/dist/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../services/pre-signup/dist/lambda.zip")

  depends_on = [aws_cloudwatch_log_group.pre_signup]

  # O código é publicado pelo CI com update-function-code, como a API.
  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_lambda_permission" "pre_signup_cognito" {
  statement_id  = "CognitoPreSignUp"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.alunos.arn
}

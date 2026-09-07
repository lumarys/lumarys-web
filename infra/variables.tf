variable "aws_region" {
  description = "Região principal. Mantida em us-east-1 por causa de ACM para CloudFront."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Ambiente (prod)."
  type        = string
  default     = "prod"
}

variable "dominio" {
  description = "Domínio raiz do site."
  type        = string
  default     = "lumarys.com.br"
}

variable "github_repo" {
  description = "Repositório que pode publicar, no formato owner/repo."
  type        = string
  default     = "lumarys/lumarys-web"
}

variable "github_repo_alternativo" {
  description = <<-TXT
    Repositório adicional autorizado enquanto a organização lumarys não existe.
    Deixe vazio depois de transferir o repositório para a organização.
  TXT
  type        = string
  default     = ""
}

variable "github_org_id" {
  description = <<-TXT
    ID numérico da organização no GitHub, usado no formato imutável do `sub`
    do OIDC. Obtenha com: gh api /orgs/<org> --jq .id
  TXT
  type        = string
  default     = ""
}

variable "github_repo_id" {
  description = <<-TXT
    ID numérico do repositório no GitHub, usado no formato imutável do `sub`.
    Obtenha com: gh api /repos/<org>/<repo> --jq .id
  TXT
  type        = string
  default     = ""
}

variable "email_operacional" {
  description = <<-TXT
    E-mail da Cernyn que recebe relatórios DMARC, avisos de bounce do SES e
    alertas de orçamento. A Lumarys não tem caixa própria.
  TXT
  type        = string
}

variable "orcamento_mensal_usd" {
  description = "Teto mensal de gasto que dispara alerta."
  type        = number
  default     = 20
}

variable "retencao_logs_dias" {
  description = <<-TXT
    Retenção dos logs da Lambda. 14 dias cobre qualquer investigação real de um
    serviço deste tamanho; mais que isso é armazenamento pago sem uso.
  TXT
  type        = number
  default     = 14
}

variable "waf_cognito_ativo" {
  description = <<-TXT
    Liga o WAF com limite por IP no Cognito. Desligado por padrão: custa cerca
    de US$ 6/mês (30% do alerta de orçamento) e protege contra cadastro em
    massa, que só é possível depois de o SES sair do sandbox e o site ter
    tráfego de fora. Ligar quando as duas coisas forem verdade.
  TXT
  type        = bool
  default     = false
}

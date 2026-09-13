# Sair do sandbox do SES

Enquanto a conta está no sandbox, o SES entrega **apenas para identidades
verificadas**. É por isso que `diegovieira.ti@gmail.com` recebe o código de
login (é uma identidade verificada) e qualquer outro endereço não recebe. Sem
sair do sandbox, a plataforma não tem um segundo usuário.

Este documento é o estado conferido na AWS, a lacuna que falta fechar e o texto
do pedido.

## Estado conferido em 13/09/2026

| Item                        | Estado                                | Evidência                                                        |
| --------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Acesso de produção          | **Não**                               | `ProductionAccessEnabled: false`                                 |
| Cota                        | 200/dia, 1 por segundo                | Valores de sandbox                                               |
| Domínio verificado          | Sim                                   | `lumarys.com.br`, `VerificationStatus: SUCCESS`                  |
| DKIM                        | Sim, 3 tokens                         | CNAMEs `*._domainkey` publicados e resolvendo                    |
| MAIL FROM próprio           | Sim                                   | `mail.lumarys.com.br`, status `SUCCESS`                          |
| SPF do MAIL FROM            | Sim                                   | `v=spf1 include:amazonses.com ~all`                              |
| MX do MAIL FROM             | Sim                                   | `feedback-smtp.us-east-1.amazonses.com`                          |
| DMARC                       | Sim                                   | `v=DMARC1; p=none; np=reject; rua=mailto:pinus@cernyn.com; fo=1` |
| TLS na entrega              | Exigido                               | Conjunto de configuração com `TlsPolicy: REQUIRE`                |
| Métricas de reputação       | Ligadas                               | `ReputationMetricsEnabled: true`                                 |
| Eventos de retorno          | Configurados                          | `BOUNCE, COMPLAINT, REJECT` → tópico SNS                         |
| Lista de supressão da conta | Ativa                                 | `BOUNCE` e `COMPLAINT`                                           |
| Tipo de e-mail declarado    | Transacional                          | `Details.MailType: TRANSACTIONAL`                                |
| Histórico (30 dias)         | 32 enviados, 0 bounces, 0 reclamações | CloudWatch, namespace `AWS/SES`                                  |

A autenticação está completa e o histórico é limpo. Isso é a parte que costuma
reprovar pedido, e ela está pronta.

## A lacuna

**O tópico SNS de retorno tem zero assinantes.** Os eventos de bounce e
reclamação são publicados e ninguém recebe.

A assinatura existe no Terraform (`infra/auth.tf`,
`aws_sns_topic_subscription.ses_retorno`, apontando para `pinus@cernyn.com`) e
existe no estado, mas nunca foi confirmada por e-mail — e a AWS apaga assinatura
pendente depois de três dias.

Isso importa porque o formulário da AWS pergunta explicitamente como bounces e
reclamações são tratados. Com o tópico sem assinante, a resposta honesta seria
"são publicados e ninguém lê", e o pedido seria recusado com razão.

## Passo a passo

1. **`terraform apply` em `infra/`.** O plano recria
   `aws_sns_topic_subscription.ses_retorno`. Se o WAF ainda estiver desligado
   (`var.waf_cognito_ativo = false`), este é o único recurso do plano e não há
   custo novo.
2. **Confirmar a assinatura.** Chega um e-mail "AWS Notification - Subscription
   Confirmation" em `pinus@cernyn.com`. O link precisa ser clicado **em até três
   dias**, senão a assinatura some de novo.
3. **Conferir que colou:**
   ```
   aws sns list-subscriptions-by-topic \
     --topic-arn arn:aws:sns:us-east-1:664905858073:lumarys-prod-ses-retorno \
     --query 'Subscriptions[].Endpoint' --output text
   ```
   Precisa devolver `pinus@cernyn.com`. Enquanto devolver vazio, não abra o
   pedido.
4. **Abrir o pedido** no console do SES: região Leste dos EUA (Norte da
   Virgínia), _Account dashboard_, botão **Request production access**. O texto
   está abaixo.
5. **Aguardar.** A AWS costuma responder em até 24 horas úteis. Pode vir pedido
   de esclarecimento; responder no mesmo caso de suporte.

## Texto do pedido

Campos do formulário:

- **Mail type**: Transactional
- **Website URL**: `https://lumarys.com.br`
- **Use case description**: o texto abaixo
- **Additional contacts**: `pinus@cernyn.com`
- **Preferred contact language**: Português (ou inglês, se preferir responder
  em inglês)

> A Lumarys é uma plataforma de estudo para provas técnicas, operada pela
> Cernyn. O único e-mail que enviamos é o código numérico de acesso à conta:
> o login é sem senha, e a pessoa digita o próprio endereço no site para
> receber o código e entrar. Não enviamos marketing, newsletter ou qualquer
> comunicação em massa, e não usamos listas compradas ou importadas de
> terceiros. Cada envio é consequência direta de uma ação da própria pessoa,
> feita segundos antes, no nosso site.
>
> Volume esperado: hoje enviamos cerca de 30 mensagens por mês. Com a abertura
> ao público, estimamos algo entre 500 e 1.000 por mês no primeiro semestre,
> com picos abaixo de 200 por dia. Não há disparo em lote: o envio é sempre
> unitário e disparado por um pedido de login.
>
> Autenticação e entregabilidade: o domínio lumarys.com.br está verificado com
> DKIM (três chaves), com MAIL FROM próprio em mail.lumarys.com.br (SPF e MX
> dedicados) e DMARC publicado com relatórios agregados indo para
> pinus@cernyn.com. A entrega exige TLS.
>
> Tratamento de bounces e reclamações: usamos um conjunto de configuração com
> destino de eventos para BOUNCE, COMPLAINT e REJECT em um tópico SNS, que
> notifica nossa equipe por e-mail. A lista de supressão no nível da conta está
> ativa para bounces e reclamações, de modo que endereços problemáticos param de
> receber automaticamente. Bounce permanente faz o endereço ser removido da
> base; reclamação encerra qualquer envio para aquele endereço. As métricas de
> reputação estão habilitadas e são acompanhadas no CloudWatch. Nos últimos 30
> dias tivemos 32 envios, zero bounces e zero reclamações.
>
> Cancelamento: por se tratar de mensagem transacional disparada pela própria
> pessoa, não há lista da qual sair. Ainda assim, todo e-mail explica que o
> código foi solicitado naquele momento, orienta a ignorar a mensagem se não
> foi a pessoa quem pediu, informa que nunca pedimos senha e traz o canal de
> contato para quem quiser falar conosco ou pedir a exclusão da conta.

## Enquanto o pedido não sai

Dá para testar com pessoas específicas verificando o endereço de cada uma:

```
aws sesv2 create-email-identity --email-identity pessoa@exemplo.com
```

A pessoa recebe um e-mail da AWS e precisa clicar para confirmar. Serve para
beta fechado dentro da cota de 200/dia. Não serve para público.

## Depois de aprovado

- A cota inicial costuma ser 50.000/dia e 14 por segundo, e cresce sozinha
  conforme o uso saudável.
- Conferir com `aws sesv2 get-account --query ProductionAccessEnabled`.
- Vale acompanhar as taxas de bounce e reclamação nas primeiras semanas: acima
  de 5% de bounce ou 0,1% de reclamação, a AWS coloca a conta em revisão.
- Os endereços verificados individualmente podem ser removidos, já que deixam
  de ser necessários.

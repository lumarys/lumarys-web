# ADR 0003 — Progresso no dispositivo, conta opcional

Data: 2026-09-03 · Status: aceito

## Contexto

O aluno precisa saber onde parou. A saída óbvia seria exigir conta desde o
primeiro clique. Mas o primeiro uso costuma ser alguém chegando de uma busca,
com dez minutos livres — e um formulário de cadastro na frente do conteúdo é o
maior ponto de desistência que existe.

## Decisão

Estudar não exige conta. O progresso nasce em `localStorage`. Quem quiser
continuar em outro aparelho entra com um código de oito dígitos enviado por
e-mail (Cognito, sem senha), e o progresso local é **mesclado** na conta.

## Por quê

- **Sem atrito na entrada.** Todo o produto funciona sem identificação.
- **Sem senha.** Não existe senha para vazar, reusar ou esquecer, e some o
  suporte de recuperação.
- **Dado pessoal mínimo.** Guardamos e-mail e progresso. Sem nome, telefone,
  documento ou pagamento — quanto menos se guarda, menos há a proteger.
- **Mesclagem, não substituição.** Ninguém perde uma semana de estudo por ter
  entrado numa conta.

## Consequências

- A mesclagem precisa ser por item e sem regressão: tema concluído continua
  concluído, score fica no melhor, card fica na caixa mais avançada. Isso é
  testado em `tests/unit/storage.test.ts`.
- Quem estuda sem conta e limpa os dados do navegador perde o progresso. É dito
  na interface no momento em que faz diferença.
- A API só aceita operar na partição do `sub` do token, nunca em um usuário
  vindo do corpo da requisição.
- Um e-mail só para entrar. O Cognito tem dois canais (confirmação de cadastro
  com 6 dígitos e login por EMAIL_OTP com 8), e o primeiro teste real recebeu
  um de cada, com textos diferentes. Um gatilho de pré-cadastro confirma a
  conta no SignUp, e toda entrada passa pelo desafio EMAIL_OTP com o mesmo
  template. A conta passa a existir antes da prova de posse do e-mail; o que
  protege é o código, que só chega a quem tem a caixa. Decidido em 04/09/2026.

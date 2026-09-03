# Segurança

## Como reportar

Escreva para **pinus@cernyn.com** com o assunto começando em `[lumarys]`.
Descreva o que encontrou, como reproduzir e o impacto que enxerga. Respondemos
em até cinco dias úteis.

Não abra issue pública para vulnerabilidade. Não teste em produção de forma que
afete outros usuários: nada de força bruta, varredura agressiva ou tentativa de
acessar dados de terceiros.

## O que nos interessa

- Acesso ao progresso de outro usuário pela API.
- Qualquer caminho que contorne o autorizador JWT.
- Execução de script na página a partir de conteúdo (MDX) ou de dado do usuário.
- Vazamento de e-mail de usuário.
- Falha na exclusão de conta que deixe dado pessoal para trás.

## O que já sabemos

- O progresso em modo convidado fica em `localStorage`, legível por qualquer
  script na origem. É por isso que a política de conteúdo bloqueia script de
  terceiro e o site não carrega ferramenta de análise.
- Gravações de voz do simulado ficam em memória no navegador e nunca são
  enviadas.
- O identificador do cliente Cognito e a URL da API são públicos por natureza:
  o cliente não tem segredo e a autorização acontece no servidor.

## Fora de escopo

Ausência de cabeçalho em domínio que não é nosso, relatório automático de
scanner sem prova de impacto, e engenharia social.

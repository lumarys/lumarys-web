# Histórico reescrito em 06/09/2026

Os 51 commits de `main` foram reescritos para remover o trailer
`Co-Authored-By` que as ferramentas de IA acrescentavam à mensagem.

**O conteúdo não mudou.** A árvore de cada commit é idêntica à de antes; só a
mensagem perdeu aquela linha. A autoria sempre foi de Diego Vieira, e o
co-autor nunca apareceu na lista de contribuidores do repositório — só no
corpo de cada commit.

Como todo SHA mudou, referências antigas (cards do Notion, anotações, links do
GitHub) apontam para commits que não existem mais. A tabela abaixo resolve
cada uma.

Com um clone antigo em mãos:

```bash
git fetch origin && git reset --hard origin/main
```

| Antes | Depois | Commit |
| --- | --- | --- |
| `1bd9dfc` | `a1a92af` | fix: ponto duplo na data, e content-type do feed que o sync deixava passar |
| `56b414c` | `ecc43b7` | chore(conteudo): "mercado financeiro" no lugar de "carreira em banco" |
| `75327c7` | `ac4dbcb` | feat(site): reportar erro no tema, plano na agenda e feed de novidades (LUM-124) |
| `49e0b32` | `31b4294` | feat(glossario): o vocabulário vira página, e o módulo ganha folha de véspera (LUM-123) |
| `2a3f841` | `811b201` | feat(conquista): cartão para compartilhar e certificado com critério (LUM-119) |
| `e2aa342` | `92a2744` | feat(pwa): o app abre sem rede, e diz quando está sem ela (LUM-118) |
| `823fd9e` | `5629395` | feat(drills): fila do que já se errou, com endereço próprio no Hoje (LUM-116) |
| `6eb0165` | `aa30b36` | feat(checkpoint): verificação por módulo, com selo e temas para revisar (LUM-115) |
| `b595611` | `ffc6235` | fix(cards): a pergunta encosta no topo do card, em vez de boiar no meio (LUM-105) |
| `ada8fc4` | `82cf7d7` | chore(conteudo): retirar o nome do banco do site |
| `ceb3bca` | `9d54530` | feat(simulado): amostra pública indexada, com uma pergunta de cada módulo (LUM-113) |
| `78513cc` | `8803ebc` | feat(simulado): cronômetro, os quatro passos na hora certa e parar de gravar sem lembrar disso (LUM-108) |
| `b9ec903` | `169db83` | feat(simulado): histórico com tendência, na entrada e na trilha (LUM-100) |
| `5a94617` | `3ce4722` | feat(cards): placar, desfazer, previsão sempre à vista e layout que não salta (LUM-105) |
| `b60410f` | `1a03ca1` | feat(catalogo): "em breve" que aceita pedido, tabela que avisa que rola e dados estruturados (LUM-112, LUM-114) |
| `4ca6e67` | `4eef2cc` | feat(ui): tema claro completo e alternador de três estados (LUM-111) |
| `15866d9` | `18c4dfe` | feat(conta): resumo honesto do aparelho e diálogo próprio para sair e excluir (LUM-110) |
| `dbde476` | `193809d` | feat(home): perguntas frequentes, autoria com nome e contato que funciona sem JavaScript (LUM-98) |
| `a70b78d` | `6a28409` | feat(home): dizer para quem é, mostrar o produto e oferecer um caminho (LUM-96) |
| `f5d182f` | `0b610ff` | fix(avisos): parar de falhar em silêncio (LUM-103) |
| `e600b4d` | `e79b6b0` | feat(casca): cabeçalho em toda página, abas só onde há estado, menu no celular (LUM-97) |
| `7aa1e20` | `e18b9bb` | feat(tema): tamanho da letra, ouvir a explicação e modo sem distração (LUM-121) |
| `2dd2e9f` | `5630b06` | feat(tema): explicação escrita ou falada e pré-requisitos visíveis (LUM-120, LUM-122) |
| `a78ef50` | `1b75a87` | feat(tema): recibo ao concluir e Pomodoro que sobrevive à navegação (LUM-99, LUM-109) |
| `4fef6b2` | `c20efd9` | feat(tema): guardar confiança, drills e erros do quiz (LUM-107) |
| `94a5ccc` | `1f32f25` | feat(tema): sumário, âncoras, progresso de leitura e navegação entre temas (LUM-95) |
| `ab7f0bd` | `729de2a` | fix(progresso): lembrar o tema aberto, não só o concluído (LUM-94) |
| `08f645c` | `680ef93` | feat(hoje): uma ação principal, contexto do dia e prontidão explicada (LUM-94, LUM-106, LUM-104) |
| `9ea5d44` | `0664c8e` | feat(trilha): continuar de onde parou e o dia do plano no cartão da trilha (LUM-101) |
| `730e444` | `907ec13` | feat(plano): plano editável, com saída para data vencida e modo manutenção (LUM-102, LUM-117) |
| `8283e2a` | `18ebe1e` | feat(lib): extrair estado do plano e próxima ação como funções puras (LUM-102, LUM-94) |
| `c9a030c` | `d60cc67` | docs: registrar as seis regras que mantêm o código normalizado |
| `cc85819` | `22d682b` | fix(simulado): encerrar no meio registra o placar e não pune o que ficou (LUM-93) |
| `7a6cfc6` | `e15c030` | fix(cards): card nunca revisado deixa de nascer vencido (LUM-92) |
| `fcc0a66` | `18fbc60` | fix(infra): MFA opcional e recuperação por administrador, exigidas pelo template do código |
| `a6ae859` | `51d4137` | fix(progresso): histórico volta a aparecer ao reabrir tema e trilha, e a conta sincroniza ao abrir |
| `0be6f10` | `56a35f5` | feat(conta): um e-mail só para entrar, com código de 8 dígitos e template da marca (#16) |
| `f855c9b` | `c413252` | feat(marca): favicon.ico, ícone Apple, ícones PWA e manifesto (LUM-48) (#15) |
| `9e37729` | `91bc31b` | fix(conta): criar a conta no primeiro acesso; o código nunca chegava para e-mail novo (#14) |
| `1a38b18` | `38321f5` | feat(seo): imagem OG por página, hreflang, breadcrumbs e vídeos datados (LUM-73, LUM-74, LUM-75, LUM-55) (#13) |
| `25e0080` | `fa59fe0` | fix(a11y): favicon e rótulos acessíveis que contêm o texto visível |
| `fe9215d` | `e07e57b` | fix(seguranca): tirar upgrade-insecure-requests da CSP embutida |
| `f1369a5` | `ed57d81` | fix: charset antes da CSP, charset no cabeçalho e teste da jornada completa |
| `e9659a6` | `da0fc81` | fix(seguranca): CSP com hash por página; a produção estava sem hidratação |
| `fa43778` | `e49b6ba` | fix(estudo): embaralhar alternativas e dar função ao nível de certeza (#12) |
| `0200682` | `6c1e6c0` | chore: atualizar a stack e registrar a política de versões (#10) |
| `7c4d672` | `29a661d` | fix(ui): contraste dos botões, transbordamento no celular e hero de verdade |
| `96e2174` | `cb5db29` | fix(infra): sub imutável do OIDC do GitHub e tier do Cognito |
| `a1320d5` | `e1f4dc4` | fix(infra): incluir PASSWORD nos fatores de autenticação do Cognito |
| `6ce320d` | `c243d66` | feat: conta sem senha e sincronização do progresso |
| `9ec4b87` | `4863e3a` | feat: MVP da Lumarys com a trilha de Engenharia de Dados |

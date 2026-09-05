# Contribuir

## Antes de abrir um PR

```bash
npm run check
```

Se mexeu em conteúdo, rode também `npm run verify:videos` e
`npm run verify:links`.

## Commits

Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`,
`content:`. Cite o card do board quando houver: `content: tema de Spark (LUM-28)`.

## Conteúdo

Leia [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md). Três regras que barram o
PR:

1. **Vídeo sem verificação não entra.** Rode `node scripts/video-info.mjs <id>`
   e use o canal e a duração que o script imprimir.
2. **Nada de fato inventado.** Sem "esta pergunta caiu na prova da empresa X",
   sem número de mercado sem fonte. Falta um dado real? Escreva `[verificar]`.
3. **Nada de questão real de prova.** As perguntas são escritas do zero.

## Código

TypeScript estrito. Componente de interface em `src/components`, regra de
negócio em `src/lib` com teste. Alvo de toque mínimo de 44 px, nada de rolagem
horizontal em 360 px de largura.

Comentário explica **por que**, não o que o código faz.

### Seis regras que mantêm o código normalizado

1. **Decisão em `src/lib`, com teste; componente só desenha.** Se um `.tsx`
   está escolhendo o que mostrar por uma regra de negócio, essa regra vira
   função pura testável. É assim que `srs`, `readiness`, `storage`, `simulado`,
   `plano` e `proximaAcao` existem.
2. **Um primitivo por padrão de interface, em `src/components/ui`.** Botão,
   cartão, anel, diálogo, estado vazio, faixa de aviso. Página não monta o seu
   próprio: se você está escrevendo `rounded-xl bg-[var(--accent)]` num
   `.tsx` de rota, o primitivo está faltando ou não foi importado.
3. **Campo novo de progresso é opcional e aditivo.** Nada de subir `VERSAO`
   sem quebra real, e `mesclar` precisa tolerar a ausência do campo — quem
   estuda em dois aparelhos tem versões diferentes ao mesmo tempo. Todo campo
   novo entra com caso em `tests/unit/storage.test.ts`.
4. **Um arquivo de teste de tela por superfície.** `home`, `casca`, `tema-*`,
   `simulado`, `cards`. `jornada.spec.ts` é o fio condutor de ponta a ponta e
   não vira depósito de caso isolado.
5. **Tempo é argumento, não ambiente.** Função pura recebe `agora`; teste de
   tela fixa o relógio. Sequência, vencimento e saudação dependem do dia, e o
   CI roda em outro fuso.
6. **Um commit por card, citando `LUM-nn`; o pacote inteiro vai ao ar de uma
   vez.** Cada commit deixa a `main` verde sozinho, e o `push` acontece quando
   o pacote fecha — é o que torna cada deploy uma melhoria que a pessoa
   percebe, em vez de sete deploys de meia mudança.

O trabalho é organizado em **pacotes por superfície** no
[board](https://app.notion.com/p/5644ebef4018487db090e3c0e26c89b2): cada
pacote toca um conjunto de arquivos uma vez só, constrói as fundações que os
próximos consomem, e fecha com verificação no site real.

## Infra

`terraform plan` no PR, na descrição. Apply é humano. Mudança que toque em DNS
precisa dizer explicitamente que os registros de e-mail continuam intactos.

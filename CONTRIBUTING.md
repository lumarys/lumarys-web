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

## Infra

`terraform plan` no PR, na descrição. Apply é humano. Mudança que toque em DNS
precisa dizer explicitamente que os registros de e-mail continuam intactos.

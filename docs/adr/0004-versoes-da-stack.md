# ADR 0004 — Política de versões da stack

Data: 2026-09-04 · Status: aceito

## Contexto

O projeto nasceu com algumas versões pinadas por conveniência (copiadas de
outro repositório da casa) e outras já defasadas na primeira semana. Precisamos
de uma regra para decidir quando subir e quando esperar, em vez de subir tudo
que o `npm outdated` mostra.

## Decisão

**Sobe sempre:** patch e minor de qualquer dependência, e major de ferramenta
que não é gate de qualidade (empacotador, ambiente de teste, tipos).

**Só sobe com verificação:** major de qualquer coisa que participe do build ou
da validação de conteúdo. O critério de aceite é `npm run check` mais
`npm run build` mais `npm run test:e2e` passando.

**Não sobe:** major que quebre um gate de qualidade. Fica registrado aqui com
o motivo e a condição de desbloqueio.

## Estado em 2026-09-04

Subiram e estão em produção: Next 16.3.4, React 19.2.8, Vitest 5, jsdom 30,
esbuild 0.28, adm-zip 0.6, zod 4, `@types/node` 26. O provider AWS já estava em
6.63.0; a restrição passou de `>= 5.101.0` para `~> 6.63` para um major novo não
entrar sozinho num apply.

Removidos por não serem usados: `@vitejs/plugin-react` e
`@testing-library/react`. Os testes de unidade são de lógica pura; componente é
verificado no Playwright, contra o site construído.

### Bloqueados, com motivo

**TypeScript 7.** O typecheck passa e é bem mais rápido (307 ms contra alguns
segundos), e o build do Next também passa. Mas o `typescript-eslint` recusa:
"typescript-eslint does not support TS 7.0". Perder o lint custa mais do que
ganhar velocidade de typecheck. **Desbloqueia quando** o typescript-eslint
anunciar suporte ao TS 7.

**next-mdx-remote — removido.** A versão 5 tem aviso de segurança alto
(execução de código arbitrário ao renderizar MDX não confiável no servidor) e a
versão 6, que corrige, deixa de avaliar as props dos componentes: as tabelas
comparativas dos temas chegavam sem dados. Em vez de escolher entre um aviso
aberto e conteúdo quebrado, tiramos a compilação de MDX do tempo de execução.
Ver ADR 0005.

## Consequências

- O Dependabot abre PRs semanais e o CI decide: PR que passa nos gates pode
  entrar; PR que quebra vira uma linha nesta tabela.
- Uma vez por mês vale reler os bloqueados. Bloqueio sem data de revisão vira
  dívida esquecida.

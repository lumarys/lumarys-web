# Como escrever um tema da Lumarys

Um tema é **um arquivo** em `content/temas/<slug>.mdx`: frontmatter YAML com todo
o material de estudo ativo, e corpo MDX com a explicação. O nome do arquivo tem
que ser exatamente `<slug>.mdx`, com o mesmo slug do frontmatter.

**Modelo de referência:** `content/temas/big-data.mdx`. Copie a estrutura dele.

O schema está em `content/types.ts` e roda no build: qualquer campo faltando ou
fora do formato derruba o build apontando o arquivo. Rode
`node scripts/content-lint.mjs` antes de considerar um tema pronto.

## Princípios

1. **Escreva para quem vai ser arguido em voz alta**, não para quem vai fazer
   prova de múltipla escolha. O que a banca cobra é raciocínio e trade-off.
2. **Contexto bancário nos exemplos.** Cartão, PIX, extrato, fraude, cadastro,
   LGPD. Exemplo genérico de e-commerce não ajuda quem vai ser sabatinado num
   banco.
3. **Nada de encher linguiça.** Se uma seção não muda o que a pessoa vai
   responder, corte.
4. **Segunda pessoa, frases curtas, verbo de ação.** Tom de mentor direto, sem
   infantilizar e sem prometer aprovação.
5. **Nunca invente fato.** Nada de "esta pergunta caiu na prova do banco X",
   número de mercado sem fonte ou citação atribuída a alguém. Se falta um dado
   real, escreva entre colchetes: `[verificar]`.

## Frontmatter, campo a campo

| Campo | Regra |
| --- | --- |
| `slug` | kebab-case sem acento, igual ao nome do arquivo |
| `titulo` | como aparece no topo da página |
| `resumo` | 40 a 320 caracteres, uma frase que responde "o que é isso". Vai para a meta description e para o `llms.txt` |
| `minutos` | tempo realista de vídeo + leitura + prática (20 a 40 costuma ser o certo) |
| `nivel` | `fundamental`, `intermediario` ou `avancado` |
| `porQue` | metaaprendizado: por que este tema cai na sabatina |
| `comoCai` | uma frase entre aspas, no jeito que o entrevistador pergunta |
| `feynman` | desafio de explicar para alguém de negócio em 1 minuto |
| `preRequisitos` | slugs de temas que convém ver antes (pode ser vazio) |
| `errosComuns` | 2 a 8 itens; cada um é o erro **e** por que ele é erro |
| `preTeste` | 1 a 3 perguntas, **exatamente uma alternativa correta cada**, com explicação em todas as alternativas |
| `videos` | 1 principal + até 1 complementar, **só em português** |
| `artigos` | 1 a 5, domínio precisa estar na allowlist de `scripts/verify-links.mjs` |
| `flashcards` | 8 a 14 pares frente/verso |
| `drills` | 1 a 2, cada um com 3+ itens |
| `perguntas` | 3 a 10, com **pelo menos 2 orais** e **pelo menos 1 objetiva** |

### Vídeos: só entram depois de verificados

Nenhum vídeo entra por memória. O processo é:

1. Procure com busca na web restrita ao YouTube, em português.
2. Rode `node scripts/video-info.mjs <id> [<id>...]` na raiz do projeto.
3. Use exatamente o canal e a duração que o script imprimir.
4. `INDISPONIVEL` significa que o vídeo não entra. Procure outro.

O campo `porQue` do vídeo diz **por que aquele vídeo** e o que observar nele —
não repita o título.

### Perguntas orais

São o coração do simulado. Cada uma precisa de:

- `enunciado`: pergunta de cenário, do jeito que um entrevistador faria.
- `respostaModelo`: a resposta que tiraria nota máxima, escrita como fala, em
  primeira pessoa, com trade-off explícito. Entre 80 e 200 palavras.
- `rubrica`: 2 a 6 critérios **verificáveis**. "Explicou bem" não é critério;
  "Citou shuffle como causa provável e disse como confirmaria na Spark UI" é.

### Drills

Exercício curto que ataca o ponto fraco típico do tema. Formato mais útil é
classificar itens em categorias (`opcoes`) ou responder um valor curto. Cada
item tem `resposta` e, quando ajuda, `explicacao`.

## Corpo MDX

Comece com `## Em uma frase` e uma resposta direta — é o trecho que o Google e
os agentes de IA citam.

Entre 250 e 1200 palavras. Use `##` para seções (nunca `#`, o título já vem do
frontmatter).

Componentes permitidos (allowlist do lint, qualquer outro derruba o build):

```mdx
<Callout tipo="dica|atencao|erro" titulo="Título curto">
Texto do aviso.
</Callout>

<Comparativo
  colunas={["A", "B", "C"]}
  linhas={[["1", "2", "3"], ["4", "5", "6"]]}
/>

<Passos itens={["Primeiro", "Segundo", "Terceiro"]} />

<Termo nome="shuffle">Redistribuição de dados entre executores.</Termo>
```

**Proibido no corpo:** tag de script, `javascript:`, handler inline, iframe cru,
HTML bruto, texto de preenchimento.

## Antes de dar o tema por pronto

```bash
node scripts/video-info.mjs <ids do tema>   # todos precisam responder
node scripts/content-lint.mjs               # sem ERRO
```

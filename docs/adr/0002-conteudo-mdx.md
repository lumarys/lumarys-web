# ADR 0002 — Conteúdo em MDX com frontmatter validado

Data: 2026-09-03 · Status: aceito

## Contexto

Cada tema é mais do que um texto: tem pré-teste, vídeos verificados, artigos,
oito a catorze flashcards, drills, perguntas de simulado com rubrica e metadados
de método. Precisamos que isso seja escrito rápido, revisado em PR e impossível
de publicar pela metade.

## Decisão

Um arquivo `.mdx` por tema. Todo o material estruturado vai no frontmatter YAML,
validado por um schema zod (`content/types.ts`) que roda no build. O corpo MDX é
só a explicação, e pode usar uma allowlist curta de componentes.

## Por quê

- **O build é o revisor.** Um tema sem pré-teste, com sete flashcards ou sem
  vídeo derruba o build apontando o arquivo. Nenhum tema pela metade chega ao
  ar.
- **Um arquivo por tema** cabe num PR, aparece inteiro no diff e não exige
  navegar por cinco lugares para escrever um assunto.
- **Estruturado onde precisa ser.** Flashcard e rubrica são dados: a interface
  os renderiza, o simulado os sorteia, o `llms.txt` os exporta. Se fossem
  markdown livre, cada consumidor teria que adivinhar o formato.
- **MDX no corpo** permite tabela comparativa e callout sem inventar sintaxe.

## Consequências

- A allowlist de componentes é obrigatória, e o `content-lint` recusa qualquer
  outro: MDX executa código, e conteúdo é a superfície mais provável de PR
  externo.
- Frontmatter grande. Aceitável: é o preço de o build conseguir checar.
- Curadoria de vídeo é passo manual verificado por script, nunca por memória.

# Ambientes e infraestrutura como código

> Por que existem desenvolvimento, homologação e produção em dados, o que muda entre eles além do nome, e como infraestrutura como código torna os três reproduzíveis: estado, plano antes de aplicar, e o que nunca deve estar no repositório.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/devops/ambientes-e-infraestrutura-como-codigo/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Ambientes se distinguem por **quem consome**, não por tamanho; e só valem
alguma coisa se forem descritos pelo **mesmo código**, com o dado de teste
tendo a **mesma forma** do real.

## Os três ambientes, pelo papel

<Comparativo
colunas={["Ambiente", "Quem consome", "Dado", "O que precisa ser igual a produção"]}
linhas={[
["Desenvolvimento", "Quem está construindo", "Amostra pequena, mascarada ou sintética", "Topologia e permissões"],
["Homologação", "Quem valida a mudança", "Amostra com os casos de borda reais, mascarada", "Definição de infraestrutura e caminho de promoção"],
["Produção", "O negócio", "Real", "É a referência"]
]}
/>

<Callout tipo="atencao" titulo="Cópia de produção não é diligência">
Copiar a tabela de clientes crua para desenvolver parece cuidado com o
realismo e é o caminho mais comum de vazamento de dado pessoal. O que se
precisa preservar é a **forma**: tipos, categorias, casos de borda, nulos. Isso
se consegue com mascaramento ou dado sintético.
</Callout>

## Infraestrutura como código: as duas ideias

<Termo nome="declaratividade">Descrever o estado desejado, não os passos. Aplicar duas vezes dá o mesmo resultado, porque a ferramenta calcula a diferença em vez de repetir comandos.</Termo>

<Termo nome="estado">Registro do que a ferramenta já criou. É o que permite calcular a diferença e produzir um plano. Fica remoto, versionado e com bloqueio, para duas execuções não se atropelarem.</Termo>

O fluxo que se espera ouvir:

<Passos itens={[
"Escrever a mudança no código, em arquivo versionado.",
"Rodar o plano e LER: o que será criado, o que será alterado e, principalmente, o que será destruído.",
"Revisar como se revisa código, porque o plano é o diff da infraestrutura.",
"Aplicar, e deixar o estado registrar o resultado."
]} />

<Callout tipo="dica" titulo="A linha do plano que importa">
Criar e alterar costumam ser reversíveis. **Destruir um recurso com estado** —
um banco, um bucket com dado — nem sempre volta. Ler o plano é barato; aplicar
sem ler é aprovar merge sem ver o diff.
</Callout>

## O que nunca entra no repositório

Credencial, chave e token. Eles vivem num cofre — Secrets Manager, Parameter
Store — e entram por **referência**. O motivo é que repositório é histórico
permanente: apagar o segredo num commit posterior **não** o apaga do
histórico, e quem clonou antes continua com ele.

## Deriva: quando a realidade foge do código

<Termo nome="deriva de configuração">Diferença entre o que o código declara e o que existe de fato, criada quando alguém ajusta um recurso pelo console.</Termo>

A ferramenta detecta na execução seguinte. A correção é **reaplicar o código**,
não repetir o clique — e, se a mudança manual era necessária, ela vira código.
Ajuste no console "documentado depois" é a forma mais eficiente de fazer o
código deixar de descrever a realidade.

## Como responder isso em voz alta

Para a pergunta dos ambientes: **mesma definição**, **mesmo caminho de
promoção**, **mesma forma de dado** — e declare o risco residual de escala e
concorrência em vez de prometer garantia. Para a de infraestrutura como
código: o ganho é ser **revisável e reproduzível**, sustentado por
declaratividade e estado, com plano lido antes de aplicar e segredo fora do
repositório.

# Testes e reprodutibilidade em projetos de dados

> O que se testa quando o produto é um número: teste de código com pytest, teste do dado na entrada e na saída, e as condições que fazem uma análise ser reproduzível — versão fixada, dado identificado por corte e notebook sem estado escondido.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/programacao/testes-e-reprodutibilidade/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Em dados, a suíte tem **duas metades** — teste de código e teste do dado — e
reprodutibilidade tem **três pernas**: ambiente congelado, entrada
identificada e execução sem estado escondido.

## Por que testar o dado, e não só o código

A transformação pode estar perfeita e o número sair errado, porque **a entrada
mudou sem o seu código mudar**: coluna passou a vir nula, apareceu categoria
nova, surgiu duplicata, o arquivo veio vazio.

<Callout tipo="atencao" titulo="A falha mais traiçoeira">
Um pipeline que processa um **arquivo vazio** termina com sucesso. Nenhuma
exceção, nenhum alerta, tudo verde — e o relatório zerado. Só um teste de
**volume mínimo** na entrada pega isso.
</Callout>

<Comparativo
colunas={["Momento", "O que verificar"]}
linhas={[
["Entrada", "Volume dentro da faixa, campos obrigatórios não nulos, conjunto de valores aceito, esquema esperado"],
["Saída", "Unicidade da chave, integridade com as dimensões, total batendo com a origem"],
["Código", "Casos de borda das funções: divisão por zero, lista vazia, data inválida"]
]}
/>

Para **categoria nova** na entrada, prefira **alerta** a falha: categoria nova
costuma ser legítima, e você quer decidir, não quebrar a madrugada.

## O teste que passa junto com o bug

Um teste que calcula o resultado **do mesmo jeito que o código** não testa
nada: ele reproduz a lógica, inclusive o erro. Teste bom afirma o **valor
esperado**, obtido de fora — da regra escrita, de um cálculo manual, da
origem.

E os melhores testes não são imaginados: **vêm de incidentes**. Cada vez que
algo quebra, a causa vira teste. A suíte cresce a partir do que aconteceu.

## As três pernas da reprodutibilidade

<Passos itens={[
"Ambiente congelado: versões das bibliotecas fixadas em arquivo versionado, porque a mesma análise com outra versão pode arredondar ou ordenar diferente.",
"Entrada identificada: não 'a tabela de vendas', mas o corte — data de referência ou versão da tabela. A tabela de hoje não é a de seis meses atrás.",
"Execução sem estado escondido: reiniciar e rodar do zero. Notebook que funciona na tela pode não funcionar de cima para baixo."
]} />

<Callout tipo="dica" titulo="O teste do notebook">
Reinicie o núcleo e execute tudo de cima para baixo. Se falhar, o notebook
dependia de uma variável de execução anterior ou de células rodadas fora de
ordem — e ninguém, incluindo você, reproduz aquele número depois.
</Callout>

Junto com o número, entregue **o que foi assumido**. Premissa não escrita é o
que ninguém consegue recuperar seis meses depois.

## Quando sai do notebook

Indicador **recorrente** não mora em notebook. Ele vira transformação
versionada, com teste, orquestração e dono — exatamente para não depender da
sua memória nem da sua máquina. O notebook fica onde ele é bom: exploração.

## Como responder isso em voz alta

Separe as **duas metades** da suíte e dê exemplo de cada. Para
reprodutibilidade, cite as **três pernas** e o teste concreto do notebook.
Termine dizendo que os melhores testes vêm de incidentes — isso mostra que
você já operou algo, e não só leu a respeito.

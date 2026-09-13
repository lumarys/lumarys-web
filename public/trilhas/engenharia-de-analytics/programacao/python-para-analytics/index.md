# Python para analytics: pandas sem armadilha

> O Python que o engenheiro de analytics usa de verdade: ler e tipar o dado, tratar nulo sem esconder problema, agrupar e juntar sem duplicar linha, e saber a hora de parar de usar pandas e empurrar o trabalho para o banco.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/programacao/python-para-analytics/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Os três lugares onde o número sai errado em silêncio são **tipo**, **nulo** e
**grão** — e a quarta pergunta é sempre **quando parar de usar pandas** e
empurrar o trabalho para onde o dado está.

## Tipo: a inferência erra onde dói

Deixar o pandas adivinhar o tipo funciona até encontrar:

<Comparativo
colunas={["Coluna", "O que a inferência faz", "Consequência"]}
linhas={[
["Código com zero à esquerda", "Converte para número", "00123 vira 123 e a junção com o cadastro não acha nada"],
["Identificador de 18 dígitos", "Converte para ponto flutuante", "Perde precisão e termina em zeros"],
["Data em formato brasileiro", "Deixa como texto", "Ordenação alfabética, comparação errada"],
["Valor com vírgula decimal", "Deixa como texto", "Soma concatena em vez de somar"]
]}
/>

A correção é **declarar o tipo na leitura**, não converter depois: parte da
informação já se perdeu no caminho.

## Nulo: ausência não é zero

<Callout tipo="atencao" titulo="O preenchimento que muda o indicador">
Preencher nulo com zero por reflexo é o erro mais comum e o mais difícil de
detectar depois. **Zero é um valor**: entra na soma e puxa a média para baixo.
**Nulo é ausência**: deveria ser excluído da média ou tratado
explicitamente. A diferença aparece no indicador, não numa exceção.
</Callout>

Há três decisões legítimas — excluir a linha, preencher com um valor
justificado, manter nulo e tratar na agregação. Qualquer uma serve **se for
consciente e documentada**. E vale separar nulo de string vazia: elas
costumam indicar origens diferentes, e misturá-las esconde uma falha de
extração.

## Grão: a junção que dobra o faturamento

<Termo nome="grão">O que uma linha representa. "Uma linha por pedido" e "uma linha por item do pedido" são grãos diferentes.</Termo>

Ao juntar pedidos com itens, cada pedido passa a aparecer **uma vez por item**,
com o valor do pedido repetido em todas. A soma conta repetido. Não é bug: é a
junção fazendo o que foi pedida.

<Passos itens={[
"Declarar o grão em voz alta antes de juntar: depois desta junção, uma linha representa o quê?",
"Conferir se a chave é única do lado direito, e comparar a contagem de linhas antes e depois.",
"Quando o que se quer é o total, agregar ANTES de juntar: somar itens por pedido e só então juntar.",
"Para número que vira indicador, um teste comparando o total com a origem."
]} />

## Quando sair do pandas

- **O dado não cabe confortavelmente na memória.**
- **A transformação vai virar rotina** consumida por outras pessoas: aí ela
  precisa de versionamento, teste e orquestração, não de um script local.
- **O banco pode filtrar e agregar antes de enviar.** Trazer gigabytes para
  produzir duzentas linhas desperdiça rede, memória e tempo.

<Callout tipo="dica" titulo="Guarde o cru">
O arquivo como veio é a evidência. Se a regra mudar ou você errar, dá para
reprocessar. Transformar na entrada e descartar o original é o que transforma
um erro de uma tarde em um dado perdido para sempre.
</Callout>

## Como responder isso em voz alta

Para "o que você faz com este arquivo": **inspecionar amostra**, **tipar na
leitura**, **decidir o nulo por coluna**, **guardar o cru**. Para qualquer
número que mudou de repente: **grão** primeiro, depois tipo, depois fuso. E
termine dizendo onde aquilo deveria morar se virasse rotina — é o que mostra
que você pensa além do arquivo da vez.

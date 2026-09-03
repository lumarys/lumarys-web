# O que é Big Data

> Big Data não é um volume de dados nem uma ferramenta: é a situação em que volume, velocidade e variedade quebram a abordagem tradicional de um banco só. Os 3 Vs, os 2 que vieram depois e quando o rótulo não se aplica.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/fundamentos/big-data/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Big Data é a situação em que **volume, velocidade e variedade** de dados, juntos,
quebram a abordagem de resolver tudo em um banco relacional só.

## O termo descreve um problema, não um produto

Essa é a distinção que separa quem decorou de quem entendeu. Ninguém "compra Big
Data". O que existe é um perfil de carga que a arquitetura tradicional não
atende, e um conjunto de respostas que mudou ao longo do tempo: primeiro Hadoop
com HDFS e MapReduce, depois armazenamento de objetos com Spark, hoje formatos
de tabela como Delta e Iceberg por cima.

Se a sua definição de Big Data cita uma ferramenta, ela envelhece junto com a
ferramenta. Se cita o perfil do problema, ela continua válida.

## Os três Vs originais

<Comparativo
  colunas={["V", "O que mede", "Exemplo no banco"]}
  linhas={[
    ["Volume", "Quantidade de dados em repouso e por janela de processamento", "Seis anos de extratos que precisam ser recalculados quando uma regra muda"],
    ["Velocidade", "Taxa de chegada e prazo para o dado ainda ser útil", "Autorização de cartão: decisão de fraude em milissegundos"],
    ["Variedade", "Formatos e origens diferentes no mesmo caso de uso", "Cadastro relacional, clique no app, áudio de call center e PDF"]
  ]}
/>

Repare que os três aparecem **juntos** nos casos difíceis. Volume sozinho é um
arquivo grande. Velocidade sozinha é uma fila. Variedade sozinha é um problema de
parsing. O que estoura a arquitetura é a combinação.

## Os dois Vs que vieram depois

**Veracidade** é a confiabilidade do dado: de onde veio, se está duplicado, se
tem valores faltando, se a medição está certa. Sem veracidade, mais dado só
produz decisão errada mais rápido. É o V que conversa direto com o módulo de
qualidade de dados.

**Valor** cobra retorno. Guardar custa dinheiro todo mês, e dado que nunca vira
decisão é passivo, não ativo. Em banco isso também tem lado regulatório: guardar
dado pessoal sem finalidade é risco de LGPD, não é precaução.

<Callout tipo="atencao" titulo="Onde a banca aperta">
Muitos candidatos param nos 3 Vs. Acrescentar veracidade e valor, e explicar por
que eles importam para o negócio, é o que costuma diferenciar a resposta.
</Callout>

## Por que a arquitetura mudou

Durante décadas a saída para "os dados cresceram" foi **escalar verticalmente**:
comprar uma máquina maior. Isso esbarra em dois tetos. O físico, porque existe um
limite de CPU, memória e disco por máquina. E o econômico, porque o preço do
servidor grande cresce mais rápido que a capacidade dele.

Escalar **horizontalmente** troca uma máquina cara por muitas comuns, e traz
junto os problemas que definem a engenharia de dados moderna: como dividir o dado
entre máquinas (particionamento), como sobreviver à falha de uma delas
(replicação) e como coordenar o processamento (MapReduce ontem, Spark hoje).

<Callout tipo="dica" titulo="Quando o rótulo não se aplica">
Se o dado é estruturado, o volume é previsível e a consulta não tem pressa, um
banco relacional bem modelado, indexado e particionado quase sempre ganha. Dizer
isso na sabatina demonstra julgamento, não desconhecimento.
</Callout>

## Como responder isso em voz alta

Uma estrutura que funciona: comece pela definição em uma frase, cite os três Vs
com um exemplo cada, explique por que a escala vertical parou de resolver,
acrescente veracidade e valor ligando ao negócio, e feche com um caso bancário
concreto. Leva cerca de noventa segundos e cobre tudo que a rubrica procura.

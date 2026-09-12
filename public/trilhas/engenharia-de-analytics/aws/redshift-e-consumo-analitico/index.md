# Redshift e a camada de consumo analítico

> O data warehouse visto por quem entrega número para o negócio: por que o armazenamento colunar muda tudo, como chave de distribuição e de ordenação decidem o desempenho, quando usar Spectrum para ler o lake, e como o QuickSight consome o que você modelou.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/aws/redshift-e-consumo-analitico/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O Redshift é **colunar e paralelo**: o que decide o desempenho não é índice, é
**onde cada linha mora** (distribuição), **em que ordem** (ordenação) e
**quanto dado a consulta precisa ler**.

## Por que colunar muda a conversa

Num banco por linha, ler um registro é ler tudo dele junto — ótimo para
cadastro. Num banco colunar, cada coluna é guardada separada: uma consulta que
soma valor por mês lê **duas colunas** de milhões de linhas, e não as linhas
inteiras. Some a isso que valores parecidos ficam vizinhos e comprimem muito
melhor, e você tem a razão de relatórios voarem e cadastros sofrerem.

É por isso que a otimização muda de vocabulário: índice por linha perde sentido,
e entram distribuição e ordenação.

## As duas decisões que decidem o tempo

<Comparativo
colunas={["Estilo de distribuição", "O que faz", "Quando usar"]}
linhas={[
["KEY", "Linhas com o mesmo valor da chave vão para o mesmo nó", "Tabelas grandes que se juntam sempre pela mesma coluna"],
["ALL", "A tabela inteira é replicada em todos os nós", "Dimensão pequena e estável que entra em quase toda consulta"],
["EVEN", "Espalha por rodízio, sem critério", "Tabela que não participa de junção relevante"],
["AUTO", "O serviço escolhe e ajusta com o tempo", "Padrão razoável quando o padrão de consulta ainda não é claro"]
]}
/>

<Termo nome="chave de distribuição">Coluna que decide em qual nó cada linha fica. Quando duas tabelas grandes se juntam pela mesma coluna e estão distribuídas por ela, a junção acontece dentro de cada nó, sem tráfego de rede.</Termo>

<Termo nome="chave de ordenação">Coluna pela qual os blocos ficam ordenados. O cluster guarda o mínimo e o máximo de cada bloco e descarta blocos inteiros que não atendem ao filtro.</Termo>

<Callout tipo="atencao" titulo="O sintoma que você vai ouvir">
"A consulta ficou lenta depois que a tabela cresceu" quase sempre é
**redistribuição entre nós** numa junção. A resposta que impressiona não é
"aumento o cluster": é olhar o plano de execução, alinhar as chaves de
distribuição e conferir se a chave de ordenação cobre o filtro mais comum.
</Callout>

## Spectrum: o warehouse lendo o lake

<Termo nome="Redshift Spectrum">Consulta arquivos no S3 direto do cluster, sem carregá-los, cobrando por dado lido. Permite juntar tabela interna com histórico externo na mesma consulta.</Termo>

O desenho que a sabatina espera: **quente dentro, frio fora**. Meses recentes
em tabelas internas, modeladas para as consultas que existem; histórico em
Parquet particionado no S3, consultável por Spectrum. Você para de pagar
armazenamento de warehouse por dado que ninguém lê, sem tirar o acesso de
ninguém.

O trade-off precisa ser dito: consulta externa é mais lenta e cobra por dado
lido, então **formato colunar e particionamento deixam de ser detalhe e viram
requisito**.

## A camada que o negócio vê

<Termo nome="QuickSight">Ferramenta de BI da AWS. Conecta a Redshift, Athena, S3 e bancos, e tem o SPICE, um motor em memória que guarda uma cópia do conjunto para o painel responder sem consultar a origem a cada clique.</Termo>

O SPICE resolve o painel lento e cria uma pergunta que o engenheiro de
analytics precisa saber responder: **de que momento é esse número?** Ele é do
último refresh, não de agora. É a mesma conversa de Source of Record e Source
of Truth, aplicada à ferramenta.

<Callout tipo="dica" titulo="Modelagem não some no colunar">
Warehouse colunar rende com **poucas junções e grão bem definido**. Normalizar
como se fosse um sistema transacional devolve a lentidão que a compressão tinha
resolvido. Fato e dimensão existem exatamente por isso.
</Callout>

## Como responder isso em voz alta

Para qualquer pergunta de lentidão: **plano de execução** primeiro, para ver
se há redistribuição; **chaves de distribuição** alinhadas com a junção;
**chave de ordenação** cobrindo o filtro; e só então capacidade. Para custo:
**separar quente de frio**, com Spectrum sobre Parquet particionado. Quem
começa por "aumento o cluster" está oferecendo a solução mais cara antes de
entender o problema.

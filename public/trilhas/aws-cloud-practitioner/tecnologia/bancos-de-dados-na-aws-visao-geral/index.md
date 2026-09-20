# Bancos de dados: visão geral

> RDS e seus motores, Aurora, DynamoDB, Redshift, ElastiCache, Neptune, DocumentDB, MemoryDB e DMS; relacional contra não relacional e a pista de cada serviço em uma linha, no nível que a prova cobra.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/bancos-de-dados-na-aws-visao-geral/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Todos os serviços deste tema guardam dado, então a questão se decide antes do
serviço: a carga é **transacional relacional**, de **acesso por chave** ou
**analítica sobre histórico**? Respondida essa pergunta, sobra uma alternativa.

## Relacional contra não relacional

O enunciado quase sempre entrega o modelo pelo vocabulário. **Relacional** vem
com tabelas, relações, esquema fixo, SQL e o nome de um motor conhecido. **Não
relacional** vem com flexibilidade de formato, escala imprevisível e acesso por
uma chave. Não é uma escolha de qualidade: é o desenho do dado.

<Comparativo
colunas={["Serviço", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Amazon RDS", "Banco relacional gerenciado com motores conhecidos", "SQL, esquema fixo, MySQL, PostgreSQL, Oracle, SQL Server"],
["Amazon Aurora", "Motor relacional compatível com MySQL e PostgreSQL", "Compatibilidade com um dos dois mais desempenho e disponibilidade altos"],
["Amazon DynamoDB", "Banco de chave e valor sem servidor", "Não relacional, escala variável, leitura por chave em milissegundos"],
["Amazon Redshift", "Data warehouse para consulta analítica", "Relatório gerencial, análise, histórico de anos, business intelligence"],
["Amazon ElastiCache", "Cache em memória na frente de outro banco", "Acelerar leitura repetida, aliviar o banco principal"],
["Amazon MemoryDB", "Banco em memória durável compatível com Redis", "Velocidade de memória com o dado como fonte primária"],
["Amazon Neptune", "Banco de grafos", "Relações entre pessoas, recomendação por conexão, fraude em cadeia"],
["Amazon DocumentDB", "Banco de documentos compatível com MongoDB", "Documentos JSON, compatibilidade com MongoDB"],
["AWS DMS", "Migração de dados entre bancos", "Migrar, pouca indisponibilidade, sair do datacenter"]
]}
/>

<Callout tipo="dica" titulo="O trio que decide a maior parte das questões">
**RDS**, **DynamoDB** e **Redshift** aparecem juntos com muita frequência.
Separe pelo verbo do enunciado: **registrar** um pedido com relações entre
tabelas é RDS; **buscar** um item pela chave em escala é DynamoDB; **analisar**
o acumulado de anos é Redshift.
</Callout>

## Aurora dentro da família RDS

O Aurora não é um serviço paralelo ao RDS: é um dos motores que o RDS oferece,
compatível com MySQL e com PostgreSQL, com desempenho e disponibilidade maiores
do que os motores originais. Na prova, ele aparece quando o enunciado pede
compatibilidade com um desses dois bancos somada a uma exigência explícita de
alto desempenho ou de tolerância a falhas.

## Memória: cache e banco

<Callout tipo="atencao" titulo="ElastiCache não é o mesmo que MemoryDB">
Os dois guardam dado em memória e por isso trocam de lugar nas alternativas. O
**ElastiCache** é **cache**: fica na frente de outro banco, acelera leituras
repetidas e pode perder o conteúdo sem perda de informação, porque a fonte
está no banco de trás. O **MemoryDB** é **banco**: o dado que está nele é o
dado oficial, com durabilidade. Acelerar o que já existe aponta ElastiCache;
guardar de verdade com velocidade de memória aponta MemoryDB.
</Callout>

## Os especializados e a migração

Três serviços fecham o mapa. O **Neptune** guarda relações e responde a perguntas
sobre caminhos entre entidades, então o enunciado fala em rede de contatos,
recomendação por conexão ou fraude encadeada. O **DocumentDB** guarda documentos
e costuma vir com a palavra MongoDB no texto. E o **DMS** não guarda nada: ele
move o dado de um banco para outro, com a origem em uso durante a transferência,
e é a resposta quando o verbo do enunciado é migrar. Ao lado dele vem o
**AWS SCT**, a ferramenta de conversão de esquema, que entra quando a migração
troca de motor, como de Oracle para PostgreSQL: o SCT converte esquema e código,
o DMS move os dados.

Vale lembrar que gerenciado não significa sem responsabilidade. A AWS cuida do
servidor, do sistema operacional e das rotinas do banco; a modelagem, o controle
de acesso e o conteúdo dos dados continuam com o cliente.

## Como responder o cenário

Classifique a carga antes de olhar as alternativas. Se há tabelas, relações e
SQL, é RDS, e a resposta vira Aurora quando o texto pede compatibilidade com
MySQL ou PostgreSQL junto de desempenho alto. Se há leitura por chave em escala
que varia, é DynamoDB. Se há análise sobre anos de dados, é Redshift. Se o
pedido é acelerar leitura sem trocar o banco, é ElastiCache. Se o dado é grafo,
é Neptune; se é documento com MongoDB no texto, é DocumentDB. E se o verbo é
migrar, nenhum banco responde: a resposta é o DMS.

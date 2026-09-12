# Qual banco para qual caso de uso

> O cenário em que a prova descreve o dado e pergunta o serviço: relacional gerenciado (RDS, Aurora), chave-valor de escala (DynamoDB), data warehouse (Redshift), busca e log (OpenSearch), grafo (Neptune), documento (DocumentDB), série temporal e ledger. A pista está na forma da consulta.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/desempenho/banco-de-dados-por-caso-de-uso/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A AWS tem um banco por **forma de dado e de consulta**, e a questão descreve a
forma sem dizer o nome. Reconhecer a assinatura — chave, agregação, texto,
relacionamento, documento, série, ledger — é o que separa a resposta certa das
três plausíveis.

## O mapa

<Comparativo
colunas={["Serviço", "Forma do dado", "Assinatura no enunciado"]}
linhas={[
["RDS, Aurora", "Relacional", "Transação, junção, consulta ad hoc, compatibilidade com MySQL ou PostgreSQL"],
["DynamoDB", "Chave-valor e documento", "Acesso por chave conhecida, escala massiva, milissegundo de um dígito"],
["Redshift", "Colunar analítico", "Agregação sobre bilhões de linhas, relatório histórico, BI"],
["OpenSearch", "Índice de busca", "Texto livre, relevância, log, painel de observabilidade"],
["Neptune", "Grafo", "Relacionamentos, caminhos, 'amigos dos amigos', fraude por conexão"],
["DocumentDB", "Documento", "Compatível com MongoDB, JSON com consultas ricas"],
["Timestream", "Série temporal", "Métrica, sensor, IoT, janela de tempo"],
["QLDB", "Ledger", "Histórico imutável, verificável criptograficamente"],
["Athena", "SQL sobre o S3", "Dados já no S3, consulta ocasional, sem infraestrutura"]
]}
/>

## Os pares que a prova confunde

**Relacional × DynamoDB.** A pergunta que decide é se o **padrão de acesso é
conhecido**. DynamoDB exige escolher a chave de partição sabendo como o dado
será lido; em troca, entrega escala e latência constantes. Consulta ad hoc
imprevisível, com junções, é relacional.

**Redshift × Athena.** Os dois fazem SQL analítico. Athena consulta o que **já
está no S3**, sem provisionar nada, cobrando por dado lido — ideal para consulta
ocasional. Redshift entra quando há consulta frequente, muitos usuários e
necessidade de desempenho previsível, e vale manter um cluster.

**DocumentDB × DynamoDB.** Os dois guardam documentos. DocumentDB é
**compatível com MongoDB**, com consultas ricas e índices sobre campos
arbitrários; DynamoDB é chave-valor com índices que você planeja. A palavra
"MongoDB" no enunciado resolve.

<Callout tipo="atencao" titulo="Transacional não é analítico">
O distrator mais repetido é oferecer **Redshift** para carga transacional ou
**RDS** para agregação sobre bilhões de linhas. Colunar e paralelo serve para
somar muito; por linha e transacional serve para gravar e ler pouco, muitas
vezes. Quando o enunciado cita relatório histórico, é a primeira família;
quando cita pedido, cadastro e pagamento, é a segunda.
</Callout>

## Aurora, e quando ele é a resposta

Aurora aparece como versão "melhor" do relacional em três situações que o
enunciado nomeia:

- **Compatível com MySQL ou PostgreSQL** com desempenho maior e armazenamento
  que cresce sozinho em três zonas.
- **Muita leitura**: até 15 réplicas com endpoint de leitura próprio.
- **Carga intermitente ou imprevisível**: **Aurora Serverless** ajusta a
  capacidade sozinho, e é a resposta quando manter instância dimensionada para
  o pico seria desperdício.

<Callout tipo="dica" titulo="O banco em memória não é fonte de verdade">
ElastiCache guarda sessão, cache e ranking — e a prova espera que o dado tenha
origem em outro lugar. Quando a alternativa propõe ElastiCache como
armazenamento principal de dado que não pode se perder, ela está errada, mesmo
com Redis persistente.
</Callout>

## Como responder o cenário

Leia a **consulta**, não o volume: por chave (DynamoDB), com junções
(relacional), somando muito (Redshift), por texto (OpenSearch), por caminho
entre entidades (Neptune), por janela de tempo (Timestream), com prova de
imutabilidade (QLDB). Depois confira **onde o dado já está**: se está no S3 e a
consulta é ocasional, Athena elimina toda a discussão sobre qual banco usar.

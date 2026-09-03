# Ingestão e CDC

> Como o dado entra no lake sem derrubar o sistema de origem: carga full contra incremental, marca d água e dado atrasado, CDC lendo o log de transações, MERGE no destino e os conceitos de Kafka que a banca cobra.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/ingestao-e-cdc/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Ingestão é como o dado sai da origem e entra no lake; **CDC** é fazer isso lendo o
log de transações do banco de origem, de modo a capturar toda mudança sem
consultar as tabelas que atendem o cliente.

## Full ou incremental

**Carga full** copia a tabela inteira toda vez. É simples, é à prova de bug de
watermark e é o que você faz numa tabela de domínio com 400 linhas. Em tabela de
30 milhões de contas, vira leitura pesada na origem, janela longa e nenhuma
informação sobre o que mudou.

**Carga incremental** copia só o que mudou desde a última execução, guiada por
uma <Termo nome="watermark">marca do ponto até onde você já leu — um timestamp ou um identificador crescente</Termo>.
Barata, mas depende de o critério ser confiável.

<Callout tipo="atencao" titulo="O risco do dado atrasado">
Se a marca é `data_atualizacao` e um registro é gravado hoje com timestamp de
ontem — reprocessamento no core, transação em contingência, fuso mal resolvido —
ele nasce **atrás** da marca e nunca será lido. Mitigações: reler uma janela de
sobreposição, usar timestamp de commit em vez de timestamp de negócio, ou trocar
a estratégia por CDC.
</Callout>

## CDC: ler o log em vez de perguntar

O banco de origem já escreve toda alteração num log de transações, porque precisa
dele para durabilidade e recuperação. CDC consome esse log e publica cada
INSERT, UPDATE e DELETE como um evento.

Três motivos para preferir isso a consultar por timestamp:

<Passos itens={[
  "Captura DELETE — a consulta por timestamp não vê linha que sumiu",
  "Não perde atualização intermediária — o log tem cada versão, a consulta só vê a última",
  "Não pesa no OLTP — lê o log, não as tabelas que atendem autorização de cartão"
]} />

**Debezium** é o conector open source que lê o log de PostgreSQL, MySQL, SQL
Server e Oracle e publica em Kafka. **AWS DMS** é o serviço gerenciado que faz
carga inicial e replicação contínua para destinos como S3 e Redshift. Debezium dá
mais controle sobre o formato do evento; DMS dá menos operação.

<Callout tipo="erro" titulo="CDC não é de graça na origem">
Habilitar log lógico ou aumentar retenção de log consome disco e alguma CPU no
core. Diga isso na sabatina. Quem afirma que o impacto é zero entrega que nunca
negociou com um DBA.
</Callout>

## MERGE: a peça que fecha o CDC

Um fluxo de mudanças aplicado com `INSERT` transforma o destino num log, não numa
tabela. Update vira linha nova; delete não existe.

O que fecha o ciclo é **upsert**, o `MERGE`: casa pela chave de negócio, atualiza
quando existe, insere quando não existe, e trata delete — em banco, quase sempre
como marcação lógica, porque auditoria e LGPD exigem rastro do que foi removido e
quando.

## Kafka, o vocabulário que cai

<Comparativo
  colunas={["Conceito", "O que é", "Consequência prática"]}
  linhas={[
    ["Tópico", "Canal lógico nomeado por assunto", "Um tópico por evento de negócio: transacao-cartao, evento-pix"],
    ["Partição", "Divisão ordenada do tópico", "Define o teto de paralelismo de consumo"],
    ["Chave", "Valor que escolhe a partição por hash", "Número da conta como chave preserva a ordem dos eventos daquela conta"],
    ["Consumer group", "Conjunto de consumidores que dividem as partições", "Cada partição vai para um consumidor do grupo; excedentes ficam ociosos"],
    ["Offset", "Posição da última mensagem lida", "Guardado por grupo e partição; permite retomar e reprocessar"],
    ["Retenção", "Tempo ou tamanho que a mensagem permanece", "Leitura não apaga; dá para voltar no tempo"],
    ["Replicação", "Número de cópias da partição entre brokers", "Durabilidade contra perda de broker"]
  ]}
/>

## Garantias de entrega

**No máximo uma vez** pode perder. **Ao menos uma vez** pode duplicar.
**Exatamente uma vez** não faz nem um nem outro, mas exige suporte fim a fim e
custa em latência e complexidade.

O arranjo mais comum em banco é *ao menos uma vez com destino idempotente*:
aceita reentrega e resolve no `MERGE` pela chave da transação. É mais barato que
garantir exatamente uma vez em toda a cadeia e dá o mesmo resultado no relatório.

## Kinesis, em comparação curta

Kinesis Data Streams é o equivalente gerenciado na AWS: shard no lugar de
partição, chave de partição com o mesmo papel, retenção configurável. Troca o
ecossistema e o controle fino do Kafka por menos operação. Se a stack já é AWS e
o time é pequeno, é escolha defensável — e dizer isso com o critério explícito
vale mais do que torcer por uma das duas.

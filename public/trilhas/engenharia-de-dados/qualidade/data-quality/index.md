# Qualidade de dados

> Qualidade de dados é o quanto o dado serve para a decisão que ele sustenta, medido por dimensões: acurácia, completude, consistência, unicidade, atualidade e validade. E, principalmente, o que o pipeline faz quando uma delas falha.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/qualidade/data-quality/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Qualidade de dados é **o quanto o dado serve para a decisão que ele sustenta**,
medida por dimensões objetivas e defendida por testes automáticos que têm
limiar e ação declarados.

## As dimensões, com exemplo e com medição

Recitar as dimensões não vale ponto. O que vale é dizer **como se mede cada
uma**. Guarde a tabela abaixo com as duas colunas juntas.

<Comparativo
  colunas={["Dimensão", "Exemplo no banco", "Como se mede"]}
  linhas={[
    ["Acurácia", "O endereço do cliente no cadastro não é o endereço real", "Amostra confrontada com a fonte da verdade; taxa de divergência"],
    ["Completude", "12% dos cadastros sem data de nascimento", "Percentual de nulos em campo obrigatório e volume recebido contra o esperado"],
    ["Consistência", "Total de PIX do dia não bate com o core bancário", "Reconciliação do mesmo indicador entre duas fontes ou camadas"],
    ["Unicidade", "A mesma autorização de cartão gravada três vezes", "COUNT(*) contra COUNT(DISTINCT chave de negócio)"],
    ["Atualidade", "Tabela de ontem só pronta às 14h; fraude precisa às 7h", "Latência do evento até a disponibilidade, contra o prazo do SLA"],
    ["Validade", "Valor de transação negativo, moeda fora da lista", "Teste de formato, tipo e domínio por campo"]
  ]}
/>

<Callout tipo="atencao" titulo="Completude não é acurácia">
Campo preenchido com valor errado é **completo e impreciso**. Campo vazio é
**incompleto** e pode até estar correto em relação à realidade. Misturar as duas
é o escorregão mais comum nessa pergunta.
</Callout>

## Testes automatizados no pipeline

O teste vira código junto do pipeline e roda toda execução. As famílias que
cobrem quase tudo:

<Passos itens={[
  "Volume: linhas do lote dentro de uma banda em relação à média histórica da mesma janela e do mesmo dia da semana.",
  "Nulos: percentual máximo tolerado por coluna, com limiar mais rígido em campo chave.",
  "Domínio: valores permitidos por coluna categórica, e faixas para numéricas — valor de transação não negativo.",
  "Unicidade: chave de negócio sem repetição, tipicamente id da autorização com a data.",
  "Integridade referencial: toda transação aponta para uma conta que existe na dimensão.",
  "Reconciliação: total agregado confrontado com a fonte da verdade do core."
]} />

No stack de AWS e Databricks isso aparece como regras de DQDL no Glue Data
Quality ou como expectativas declaradas no pipeline do Databricks, que já
oferecem os três comportamentos nativos: avisar, descartar a linha ou falhar a
atualização.

## O que fazer quando um teste falha

Aqui é onde a banca aperta. Três ações possíveis, e o critério é **impacto do
erro contra custo do atraso**:

<Comparativo
  colunas={["Ação", "Quando usar", "Exemplo"]}
  linhas={[
    ["Falhar o pipeline", "Falha sistêmica, ou dado regulatório e financeiro em que publicar errado é pior que atrasar", "Volume caiu 96%; reconciliação regulatória não fecha"],
    ["Quarentena", "Falha localizada e pequena, resto do lote confiável, SLA precisa ser mantido", "30 transações órfãs em 12 milhões vão para uma tabela de rejeitados"],
    ["Alertar e seguir", "Coluna secundária, provável evolução legítima do domínio", "Valor novo numa coluna descritiva opcional"]
  ]}
/>

<Callout tipo="erro" titulo="O que nunca fazer">
Descartar linha ruim sem registrar. Some com transação do cliente, o teste passa
verde e a auditoria encontra o buraco depois. Quarentena existe justamente para
o dado suspeito continuar existindo em algum lugar.
</Callout>

## SLA, SLO e monitoramento

<Termo nome="SLO de dados">Meta interna e mensurável sobre um dado: por exemplo, a tabela de transações fica pronta até 6h em 99% dos dias úteis.</Termo>

SLA é o compromisso acordado com o consumidor e tem consequência quando é
rompido. Sem SLA não existe critério para decidir entre atrasar e publicar — a
decisão vira gosto pessoal, e é isso que o entrevistador quer ver você evitar.

Limiar fixo pega o erro grosseiro. O que pega o sutil é **detecção de anomalia**:
comparar a métrica do dia com a distribuição histórica, considerando
sazonalidade. Volume de PIX numa segunda-feira não se compara com o de um
domingo, e um teste ingênuo alerta todo fim de semana até alguém desligá-lo.

## O custo do dado ruim

Amarre sempre no dinheiro, porque é isso que muda a resposta de técnica para
sênior: decisão errada de crédito ou de fraude, retrabalho e reprocessamento
consumindo cluster, e risco regulatório quando o número reportado não fecha.
Some ainda o custo invisível: quando a área de negócio deixa de confiar na
tabela, ela monta a planilha paralela dela, e aí você perdeu a fonte única.

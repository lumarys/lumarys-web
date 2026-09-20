# Ferramentas de custo e orçamento

> Cost Explorer, Budgets, Cost and Usage Report, Pricing Calculator, tags de alocação de custo, Cost Anomaly Detection e Billing Conductor: qual ferramenta responde a qual pergunta sobre a fatura.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/cobranca/ferramentas-de-custo-e-orcamento/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Cada ferramenta de custo responde a **uma pergunta diferente sobre o dinheiro**,
e o enunciado da CLF entrega a pergunta quase pronta: analisar, alertar, detalhar,
estimar, separar por área ou apontar desvio.

## A pergunta de cada ferramenta

<Comparativo
colunas={["Ferramenta", "A pergunta que responde", "A pista no enunciado"]}
linhas={[
["AWS Cost Explorer", "Quanto gastei, com o quê, e para onde a tendência vai?", "Visualizar, analisar, projetar, gráfico"],
["AWS Budgets", "Passei do limite que eu mesmo defini?", "Alertar, notificar, teto, orçamento definido"],
["AWS Cost and Usage Report", "Qual é o detalhe completo da cobrança?", "Dado bruto, linha a linha, exportar para análise"],
["AWS Pricing Calculator", "Quanto vai custar o que ainda não criei?", "Estimar, orçar, proposta, antes de provisionar"],
["Tags de alocação de custo", "Quem, dentro da empresa, gastou o quê?", "Separar por projeto, time, ambiente, centro de custo"],
["AWS Cost Anomaly Detection", "Apareceu um gasto fora do padrão?", "Aumento inesperado, sem limite definido antes"],
["AWS Billing Conductor", "Como repasso o custo internamente ou a clientes?", "Cobrança personalizada, repasse, revenda"],
["AWS Compute Optimizer", "O recurso que criei é do tamanho certo?", "Instância ociosa, recomendação de tamanho, right-sizing"]
]}
/>

## Os três pares que decidem a questão

O primeiro par é **Cost Explorer contra Budgets**, e é o mais frequente. O Cost
Explorer olha para o passado e projeta o futuro em gráficos; o Budgets guarda um
número que alguém definiu e avisa quando ele é ultrapassado. Se o verbo é
analisar, é Cost Explorer; se é alertar, é Budgets.

O segundo par é **Budgets contra Cost Anomaly Detection**. Os dois avisam, mas a
origem do aviso é diferente: no Budgets o limite vem do cliente, na detecção de
anomalia o padrão é aprendido pelo próprio serviço. Quando o enunciado diz que
ninguém definiu um valor aceitável, a resposta é detecção de anomalia.

O terceiro par é **Cost Explorer contra Cost and Usage Report**. O Cost Explorer
já vem com a interface pronta para decidir; o relatório entrega o conjunto de
dados mais detalhado da cobrança em arquivo, para quem vai processar em outra
ferramenta. Detalhe máximo e exportação apontam o relatório.

<Callout tipo="atencao" titulo="Analisar, alertar e estimar são verbos diferentes">
**Analisar** o gasto que já ocorreu é Cost Explorer. **Alertar** contra um teto
definido é Budgets. **Estimar** o custo do que ainda não existe é Pricing
Calculator. Trocar um verbo pelo outro é o erro mais comum do domínio.
</Callout>

## As tags só valem quando ativadas

Marcar recursos com tags de projeto, time e ambiente é o que permite quebrar a
fatura por área. O detalhe que a prova cobra é que a tag precisa ser **ativada
como tag de alocação de custo** na cobrança para aparecer nos relatórios. Tag
aplicada e não ativada não separa nada, e o custo continua caindo em um bloco
único.

<Callout tipo="dica" titulo="Antes, durante e depois">
Antes do gasto existir: Pricing Calculator. Enquanto ele acontece: Budgets e
detecção de anomalia. Depois que virou fatura: Cost Explorer, relatório
detalhado e tags de alocação.
</Callout>

## Como responder o cenário

Localize o verbo antes de olhar as alternativas. Se o pedido é ver e entender o
gasto, é Cost Explorer. Se é ser avisado contra um valor definido, é Budgets. Se
é ser avisado sem que ninguém tenha definido valor, é detecção de anomalia. Se é
obter o detalhe completo para processar fora, é o relatório de custo e uso. Se é
saber quanto vai custar algo que ainda não existe, é a calculadora de preços. Se
é separar o custo por área interna, são as tags de alocação, ativadas na
cobrança. E se é repassar custo para áreas ou clientes com uma visão própria de
fatura, é o Billing Conductor.

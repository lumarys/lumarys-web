# Ferramentas de custo e governança financeira

> Como ver, prever e controlar a fatura: Cost Explorer para analisar, Budgets para alertar e agir, relatório de custo e uso para o detalhe fino, etiquetas de alocação para saber de quem é o gasto, e o faturamento consolidado do Organizations para somar e compartilhar descontos.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/custo/ferramentas-de-custo-e-governanca/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Três verbos diferentes, três serviços: **analisar** é Cost Explorer, **alertar**
é Budgets, **impedir** é SCP. Etiquetas dizem de quem é o gasto, e o
faturamento consolidado soma tudo para render desconto.

## Analisar, alertar, impedir

<Comparativo
colunas={["Pedido do enunciado", "Serviço", "O que ele faz"]}
linhas={[
["'Entender para onde vai o dinheiro'", "Cost Explorer", "Filtra, agrupa, mostra histórico e projeção"],
["'Ser avisado antes de estourar'", "AWS Budgets", "Limite, acompanhamento do realizado e do projetado, notificação"],
["'Impedir que aconteça'", "SCP no Organizations", "Bloqueia a ação: tipo caro, região não aprovada"],
["'Analisar num BI próprio, por hora e por recurso'", "Relatório de custo e uso", "Detalhe bruto entregue no S3"],
["'Detectar gasto fora do padrão sem definir limite'", "Detector de anomalias", "Aprendizado de máquina sobre o histórico"],
["'Estimar antes de construir'", "Calculadora de preços", "Planejamento, não acompanhamento"]
]}
/>

<Callout tipo="atencao" titulo="Budgets não bloqueia sozinho">
Ele **alerta**, e pode disparar uma **ação** que você configurou — aplicar uma
política restritiva, parar instâncias. Mas a alternativa que diz "o Budgets
impede o gasto" descreve algo que ele não faz por padrão. Impedir é papel da
**SCP**.
</Callout>

## Etiquetas: o passo que se esquece

Atribuir custo a equipes, projetos e ambientes depende de **etiquetas**, e o
fluxo tem uma etapa que as questões testam:

<Passos itens={[
"Etiquetar os recursos com um padrão combinado (equipe, projeto, ambiente).",
"ATIVAR essas etiquetas como etiquetas de alocação de custo no painel de faturamento. Sem esse passo, o custo não aparece separado por elas.",
"Analisar no Cost Explorer agrupando pela etiqueta, e criar orçamentos filtrados por ela.",
"Impor o padrão: SCP que barra a criação sem etiqueta, ou regra do Config que sinaliza o que estiver fora."
]} />

E uma limitação que vira distrator: a alocação **não é retroativa**. Ativar
hoje não reclassifica o gasto do mês passado.

## Organizations: consolidar rende dinheiro

<Termo nome="faturamento consolidado">Uma fatura para toda a organização. Soma o uso de todas as contas, o que ajuda a alcançar faixas de preço menores, e compartilha instâncias reservadas e Savings Plans entre elas.</Termo>

É por isso que a resposta para "30 contas querendo desconto por volume" é
manter a consolidação, não comprar compromisso conta a conta — fragmentar
perde as duas vantagens.

A estrutura de contas também é uma escolha de governança: **conta por equipe**
dá isolamento e limite naturais; **etiqueta por equipe** é mais simples e
depende de disciplina. A prova aceita as duas, e prefere a conta separada
quando o enunciado fala em isolamento ou limite rígido.

<Callout tipo="dica" titulo="Fecha o exame">
Este é o último tema da trilha. Os quatro domínios responderam, em ordem:
quem pode fazer o quê (seguras), o que acontece quando algo cai (resilientes),
como escolher para ir rápido (desempenho) e quanto isso custa (custo). A prova
mistura os quatro num mesmo cenário — e a palavra do enunciado continua sendo
o que decide.
</Callout>

## Como responder o cenário

Pegue o verbo: **entender** (Cost Explorer), **avisar** (Budgets), **impedir**
(SCP), **exportar em detalhe** (relatório de custo e uso), **somar entre
contas** (consolidado). Se o cenário fala em separar por equipe ou projeto,
confira se a alternativa menciona **ativar** as etiquetas — é o passo que
distingue a resposta certa da quase certa.

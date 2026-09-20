# Organizations e faturamento consolidado

> Várias contas sob uma organização, unidades organizacionais, fatura única com desconto por volume agregado, políticas de controle de serviço no nível de conceito e o Control Tower como ponto de partida de um ambiente novo.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/cobranca/organizations-e-faturamento-consolidado/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O **AWS Organizations** aparece no Domínio 4 pelo lado do dinheiro: várias
contas sob uma mesma organização pagam **uma fatura só** e têm o uso **somado**
para alcançar faixas de preço melhores, sem perder a visão de quanto cada conta
gastou.

## A estrutura, em quatro palavras

A **conta de gerenciamento** cria a organização, recebe a fatura consolidada e
aplica as políticas. As demais são **contas membro**. Entre uma e outra ficam as
**unidades organizacionais**, que agrupam contas por ambiente, área ou
finalidade e permitem aplicar uma regra de uma vez ao grupo inteiro. A conta
continua sendo o limite mais forte de isolamento da AWS e também a unidade
natural de cobrança, o que faz da separação em contas uma decisão de segurança e
de custo ao mesmo tempo.

<Comparativo
colunas={["Recurso", "O que entrega", "A pista no enunciado"]}
linhas={[
["AWS Organizations", "A organização: contas, grupos e políticas", "Várias contas sob administração comum"],
["Faturamento consolidado", "Uma fatura, custo ainda detalhado por conta", "Pagar de uma vez só, ver o gasto de cada conta"],
["Desconto por volume agregado", "O uso das contas somado para faixas melhores", "Aproveitar escala do grupo, reduzir preço unitário"],
["Unidade organizacional", "Grupo de contas onde a política incide", "Aplicar a mesma regra a um conjunto de contas"],
["Política de controle de serviço", "O teto do que a conta pode fazer", "Impedir uso mesmo do administrador local"],
["AWS Control Tower", "Ambiente de várias contas já governado", "Começar do zero, padronizado e com barreiras"]
]}
/>

## Por que a fatura única economiza

O ganho não está em receber um boleto em vez de doze. Está na **agregação**: o
consumo das contas da organização é somado, e faixas de preço que dependem de
volume ficam ao alcance de um grupo que, conta a conta, nunca chegaria lá.
Benefícios de compromisso seguem a mesma lógica: Savings Plans e instâncias
reservadas compradas na organização podem ser aproveitados por outras contas
quando o compartilhamento está ativado.

<Callout tipo="dica" titulo="Consolidar não é misturar">
A fatura é uma só, mas o custo continua **detalhado conta a conta** nos
relatórios de cobrança. Nenhum recurso passa a ser compartilhado por causa da
consolidação: o isolamento entre contas permanece intacto.
</Callout>

## Políticas e Control Tower, no nível que o Domínio 4 pede

A **política de controle de serviço** já foi tratada pelo lado da governança no
tema de conformidade deste curso. Aqui basta reter o efeito prático dentro da
organização: ela define o **teto** do que uma conta ou uma unidade
organizacional pode fazer, e não concede nada por conta própria. Permissão
continua vindo do IAM dentro da conta; a política apenas impede que esse IAM vá
além do limite.

O **AWS Control Tower** entra quando o enunciado descreve um ambiente que ainda
não existe. Ele usa o Organizations por baixo e entrega o ambiente de várias
contas já montado, com estrutura, registro de auditoria e barreiras aplicadas
desde o início. Quando o pedido é apenas fatura única ou política sobre contas
que já existem, a resposta é Organizations.

<Callout tipo="atencao" titulo="Organizations ou Control Tower">
Ambiente **já existente** que precisa de fatura única ou de política central:
Organizations. Ambiente **novo** que precisa nascer padronizado e governado:
Control Tower.
</Callout>

## Compartilhar recurso entre contas

Separar as contas não obriga a duplicar tudo. O
**AWS Resource Access Manager** (AWS RAM) compartilha recursos como sub-redes e
regras de resolução de DNS com outras contas da mesma organização, que passam a
usá-los sem cópia. A pista é **uma conta usa o recurso que outra criou**, e não
transferir permissão de identidade, que continua sendo assunto do IAM.

## Como responder o cenário

Procure quantas contas o enunciado menciona e o que ele quer delas. Se quer
pagar de uma vez e aproveitar escala, é faturamento consolidado no Organizations.
Se quer aplicar uma regra a um grupo de contas, é unidade organizacional com
política de controle de serviço. Se quer separar gasto dentro de uma mesma
conta, aí sim são tags de alocação. E se o ambiente ainda vai ser criado e
precisa nascer com as barreiras prontas, é Control Tower.

# Planos de suporte, Marketplace e parceiros

> Os cinco planos de suporte da AWS e o que muda a cada degrau, os canais gratuitos como re:Post e Knowledge Center, e onde entram Professional Services, AWS Marketplace, Partner Network e os programas de treinamento.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/cobranca/planos-de-suporte-marketplace-e-parceiros/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A questão de suporte descreve uma necessidade de atendimento e pede o
**plano mínimo** que a cobre: a escada tem cinco degraus e cada um acrescenta
algo ao anterior.

## Os cinco planos, degrau a degrau

<Comparativo
colunas={["Plano", "Para quem é", "O que acrescenta ao degrau anterior"]}
linhas={[
["Basic", "Toda conta da AWS, sem custo adicional", "Atendimento ao cliente e comunidades, documentação, AWS Health e verificações essenciais do Trusted Advisor"],
["Developer", "Ambientes de desenvolvimento e teste", "Abre o chamado técnico, no primeiro nível pago de orientação"],
["Business", "Primeira carga de produção em diante", "Suporte técnico em tempo integral por telefone, chat e e-mail e o conjunto completo do Trusted Advisor"],
["Enterprise On-Ramp", "Cargas críticas sem necessidade do topo", "Acompanhamento e orientação mais próximos do que o Business oferece"],
["Enterprise", "Cargas críticas para o negócio", "Gerente técnico de conta designado e acompanhamento proativo contínuo"]
]}
/>

Segundo a página de planos da AWS, o **Basic** já inclui atendimento ao cliente
e acesso às comunidades, documentação, o AWS Health com a visão da saúde dos
serviços e um conjunto essencial de verificações do Trusted Advisor. O que ele
não inclui é o chamado técnico, e esse é o corte que decide muitas questões.

O atendimento é organizado por **severidade**, da orientação geral até o sistema
crítico fora do ar, com prazos de resposta menores quanto maior a severidade e
mais alto o plano. Os valores exatos mudam com o tempo e ficam na página oficial
de planos; para a prova basta reter a direção: mais severidade e plano mais alto
significam resposta mais rápida.

<Callout tipo="atencao" titulo="Business contra Enterprise On-Ramp">
Esse é o par que mais confunde. Se o enunciado pede **suporte em tempo integral
para produção**, a resposta é Business. Se pede **acompanhamento mais próximo**
sem chegar ao gerente técnico designado, é Enterprise On-Ramp. Se pede o
**profissional designado que conhece a conta**, é Enterprise.
</Callout>

## O que é gratuito e o que é contratado

Antes de pagar por um plano existem caminhos sem custo. O **AWS re:Post** é a
comunidade de perguntas e respostas. O **Knowledge Center** reúne respostas
documentadas às dúvidas mais frequentes do suporte. A
**AWS Prescriptive Guidance** reúne padrões, guias e roteiros escritos pela AWS
para problemas recorrentes. Documentação, blogs e documentos técnicos também
estão abertos a qualquer conta. Quando o enunciado insiste em custo zero, a
resposta está nesse grupo.

Quando o plano é pago, o chamado técnico se abre no **AWS Support Center**, o
console de atendimento da conta. Ele é o lugar do chamado, não um plano: a
questão que pergunta _onde abrir_ aponta para ele, a que pergunta _qual
contratar_ aponta para a escada dos cinco planos.

Do lado contratado, três nomes não se misturam. O **AWS Professional Services**
é a consultoria da própria AWS dentro de um projeto do cliente. O
**AWS Partner Network** reúne empresas de consultoria e de tecnologia
credenciadas pela AWS, para quem prefere contratar um parceiro; entre elas estão
os **fornecedores independentes de software** (ISV), que publicam produto, e os
**integradores de sistemas**, que conduzem a implantação na casa do cliente. Ser
parceiro rende treinamento e certificação, acesso a eventos e desconto por
volume, e é isso que o enunciado descreve quando pergunta pelo benefício de
entrar na rede. E o
**AWS Marketplace** é o catálogo de software de terceiros pronto para implantar
na conta, com a cobrança integrada à fatura da AWS.

<Callout tipo="dica" titulo="Produto, empresa ou projeto">
**Marketplace** vende produto. **Partner Network** indica empresa.
**Professional Services** entrega gente da AWS dentro de um projeto. Três
respostas diferentes para três verbos diferentes.
</Callout>

## Denunciar abuso

Existe um canal que não é suporte nem parceiro. A equipe de
**Trust and Safety** da AWS recebe denúncia de abuso de recursos da nuvem, como
spam, varredura de portas ou ataque partindo de um endereço da AWS. O enunciado
que descreve tráfego malicioso **vindo da** AWS contra alguém de fora está
pedindo esse canal, e não um plano de suporte nem o GuardDuty.

## Capacitação

O exame também cita os programas de treinamento e certificação da AWS, com
cursos digitais, treinamento presencial e a própria trilha de certificações. A
pista no enunciado é **formar pessoas**, e não resolver um incidente nem comprar
software: quando o pedido é capacitar a equipe, nenhum plano de suporte é a
resposta.

## Como responder o cenário

Comece perguntando se o pedido é atendimento, produto, empresa, projeto ou
capacitação. Se é atendimento, suba a escada só até onde o enunciado exige:
nada pago se a dúvida cabe na comunidade, Developer para desenvolvimento e
teste, Business assim que aparece produção com suporte em tempo integral,
Enterprise On-Ramp quando o texto pede acompanhamento mais próximo e Enterprise
quando cita profissional designado ou carga crítica para o negócio. Se é
produto, Marketplace. Se é empresa credenciada, Partner Network. Se é projeto
conduzido pela AWS, Professional Services. E se é formar pessoas, os programas
de treinamento e certificação.

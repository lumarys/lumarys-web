# Migração: os 7 Rs e o Cloud Adoption Framework

> As sete estratégias de migração que a AWS nomeia, com o caso que aponta cada uma, as perspectivas do Cloud Adoption Framework e os serviços de apoio à migração no nível de reconhecimento que a CLF-C02 cobra.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/conceitos/migracao-para-a-nuvem-7-rs-e-caf/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A AWS nomeia sete estratégias para o que fazer com cada aplicação de um
inventário, e a prova descreve a decisão em uma frase e pede o nome; o Cloud
Adoption Framework é a camada acima, que organiza a jornada da organização em
vez de uma aplicação.

## Os sete Rs, com o caso que aponta cada um

<Comparativo
colunas={["Estratégia", "O que se faz", "A pista no enunciado"]}
linhas={[
["Rehost", "Move sem alterar a aplicação", "Sair do data center rápido, sem mexer em código"],
["Relocate", "Transfere a plataforma ou as instâncias para outro ambiente", "Sem comprar hardware, sem reescrever, sem mudar a operação"],
["Replatform", "Move e otimiza uma peça da pilha", "Trocar o banco instalado por um gerenciado, manter a aplicação"],
["Repurchase", "Troca a aplicação por outro produto", "Substituir o sistema atual por um contratado como serviço"],
["Refactor", "Redesenha a arquitetura da aplicação", "Monólito que atrasa entregas, limitação que só some com redesenho"],
["Retain", "Mantém onde está, por enquanto", "Dependência física, risco alto, investimento recente"],
["Retire", "Desliga o que não serve mais", "Sem acesso há meses, sem dono, sem valor de negócio"]
]}
/>

<Callout tipo="atencao" titulo="Os três pares que a prova confunde">
**Replatform contra refactor**: a primeira troca uma peça e mantém a aplicação;
a segunda muda a arquitetura da aplicação. **Repurchase contra replatform**: a
primeira troca a aplicação por outro produto; a segunda mantém a mesma
aplicação. **Retire contra retain**: a primeira desliga de vez; a segunda adia.
Em todos os casos a pergunta é a mesma: o que exatamente mudou de dono ou de
forma?
</Callout>

## Por que refactor quase nunca é a resposta

A própria AWS descreve o refactor como a estratégia mais complexa e mais cara,
e recomenda modernizar depois da migração em vez de durante. Numa questão da
CLF, refactor só é a resposta quando o enunciado diz que a limitação da
aplicação é o problema a resolver: monólito que trava as entregas, sistema que
não escala por desenho, código que ninguém consegue manter. Se o objetivo
declarado é sair do data center, é rehost; se é ganhar um serviço gerenciado no
caminho, é replatform.

## O Cloud Adoption Framework

O CAF não fala de uma aplicação: fala da **organização**. Ele identifica as
capacidades que uma empresa precisa desenvolver para usar a nuvem e organiza
isso em seis perspectivas.

<Passos itens={[
"Negócio: ligar o investimento em nuvem a resultados do negócio.",
"Pessoas: cultura, papéis e desenvolvimento das equipes.",
"Governança: gestão de risco, portfólio e medição de valor.",
"Plataforma: a base técnica onde as cargas rodam.",
"Segurança: confidencialidade, integridade e disponibilidade.",
"Operações: entregar e sustentar serviços no nível acordado."
]} />

O guia do exame também descreve os resultados que a jornada de adoção persegue,
e é assim que eles aparecem no enunciado: **redução do risco do negócio**,
melhora do desempenho **ambiental, social e de governança (ESG)**, **aumento de
receita** e **ganho de eficiência operacional**. Quando a questão fala em
benefício da adoção, e não em uma capacidade a desenvolver, é para esse conjunto
que ela aponta.

<Callout tipo="dica" titulo="CAF e Well-Architected respondem perguntas diferentes">
Se o enunciado fala em preparar a empresa, desenvolver capacidades e montar
roteiro de adoção, a resposta é **CAF**. Se fala em avaliar uma carga de
trabalho contra boas práticas de arquitetura, a resposta é **Well-Architected**.
Os dois têm pilares ou perspectivas com nomes parecidos, e é por isso que
aparecem juntos nas alternativas.
</Callout>

## Os serviços de apoio, no nível de reconhecimento

A CLF não pede operar nenhum deles, só saber para que servem.

<Comparativo
colunas={["Serviço", "Para que serve"]}
linhas={[
["AWS Migration Hub", "Acompanhar o andamento da migração num painel único"],
["AWS Application Discovery Service", "Levantar o inventário e as dependências do ambiente atual"],
["AWS Application Migration Service", "Replicar servidores inteiros para a AWS"],
["Migration Evaluator", "Estimar o custo na AWS antes de decidir a migração"],
["AWS Elastic Disaster Recovery", "Manter cópia pronta para assumir a operação se o ambiente de origem cair"],
["AWS Database Migration Service", "Migrar e replicar bancos, inclusive entre motores diferentes"],
["AWS DataSync", "Copiar arquivos entre o ambiente local e o armazenamento da AWS, pela rede"],
["Família AWS Snow", "Levar grande volume de dados em dispositivo físico quando a rede é o gargalo"]
]}
/>

## Como responder o cenário

Pergunte o que mudou. Se nada mudou na aplicação, é rehost. Se mudou uma peça
da pilha, é replatform. Se mudou a arquitetura, é refactor. Se mudou o produto,
é repurchase. Se nada foi para a nuvem e a aplicação continua viva, é retain;
se ela morreu, é retire. Nas questões de ferramenta, leia o objeto: servidor,
banco, arquivo ou volume grande com rede ruim, cada um tem o seu serviço.

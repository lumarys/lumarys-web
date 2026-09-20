# Economia da nuvem

> Despesa de capital contra despesa operacional, custo fixo contra variável, o que entra no custo total de propriedade de um data center, licenciamento próprio ou incluso, dimensionamento correto e o ganho de automatizar. É a tarefa 1.4 do guia da CLF-C02.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/conceitos/economia-da-nuvem/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Economia da nuvem é o vocabulário financeiro que a prova usa: como o dinheiro
sai (capital ou operacional), se o valor acompanha o uso (fixo ou variável),
quanto custa de verdade manter um ambiente (custo total de propriedade) e o que
se faz para gastar menos sem trocar de aplicação.

## Dois eixos que quase todo mundo mistura

<Comparativo
colunas={["Eixo", "Pergunta que ele responde", "Exemplo"]}
linhas={[
["Capital contra operacional", "Como o dinheiro sai: compra de ativo ou gasto corrente", "Comprar servidor é capital; fatura mensal do serviço é operacional"],
["Fixo contra variável", "O valor muda com o volume de uso", "Compromisso anual é fixo; cobrança por requisição é variável"]
]}
/>

<Callout tipo="atencao" titulo="Os dois eixos são independentes">
Sair da despesa de capital não transforma tudo em custo variável. Um
compromisso de um ano com desconto é **despesa operacional e custo fixo** ao
mesmo tempo: paga-se ao longo do período, mas o valor não depende do consumo.
A prova monta o distrator exatamente aqui, oferecendo "trocou fixo por
variável" quando a resposta é "trocou capital por operacional".
</Callout>

## O custo que o ambiente próprio esconde

O custo total de propriedade é a conta completa de manter uma solução, e a
prova cobra a lista do que entra nela além do equipamento.

<Passos itens={[
"Aquisição e o ciclo de troca do hardware, normalmente a cada poucos anos.",
"Energia, refrigeração e espaço físico no prédio ou no centro de dados alugado.",
"Rede, licenças de software e contratos de suporte do fabricante.",
"Pessoas: quem instala, monitora, aplica correção e atende o incidente da madrugada.",
"Capacidade ociosa comprada para o pico e paga o ano inteiro."
]} />

É essa lista que sustenta a comparação com a nuvem. Um servidor parado no data
center não custa zero: ele ocupa espaço, consome energia e envelhece.

## Licenciamento: própria ou inclusa

Quando o software é licenciado, existem dois caminhos, e o enunciado diz qual
situação a empresa está vivendo. O primeiro aparece nas alternativas pelo nome
em inglês, **bring your own license** (BYOL), e é bom reconhecer a sigla.

<Comparativo
colunas={["Caminho", "Quando faz sentido", "O que muda"]}
linhas={[
["Licença própria (BYOL)", "A empresa já pagou pela licença e o fabricante permite levá-la", "Evita pagar de novo; a gestão e a conformidade continuam com a empresa"],
["Licença inclusa", "Não há licença portável, ou a empresa quer parar de gerenciar isso", "O preço do serviço embute a licença; a gestão fica com o provedor"]
]}
/>

## Dimensionar e automatizar

Duas práticas fecham a tarefa, e as duas aparecem com pista clara:

**Dimensionamento correto** é escolher o tamanho do recurso pela carga real
medida. A pista é sempre um número de uso baixo, como instâncias rodando a
menos de 10% de processador, ou o oposto, recurso apertado demais.

**Automação** entra como conceito econômico, não técnico: tarefa manual
repetida é custo recorrente de pessoas e é onde o erro humano nasce.

<Callout tipo="dica" titulo="Otimização de uso não é economia de escala">
Economia de escala é o preço unitário cair porque o provedor compra e opera em
volume enorme. Quando a empresa desliga uma máquina ociosa e a fatura cai, isso
é otimização de uso, não economia de escala. As duas ideias aparecem juntas nas
alternativas justamente porque as pessoas as trocam.
</Callout>

## Como responder o cenário

Descubra primeiro se a questão fala de **como se paga** ou de **quanto se
gasta**. Comprar antes de usar é capital; fatura recorrente é operacional; valor
que não muda com o uso é fixo. Se o enunciado lista energia, espaço e equipe, a
resposta é custo total de propriedade. Se cita uso médio baixo, é
dimensionamento. E se cita preço unitário menor do que a empresa conseguiria
sozinha, é economia de escala, que é do provedor e não da empresa.

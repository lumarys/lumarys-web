# Well-Architected: os seis pilares

> Excelência operacional, segurança, confiabilidade, eficiência de desempenho, otimização de custo e sustentabilidade: o que cada pilar do AWS Well-Architected Framework cobre, a pista que o denuncia num enunciado e onde entra a Well-Architected Tool.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/conceitos/well-architected-os-seis-pilares/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O Well-Architected Framework é a lista de perguntas que a AWS usa para avaliar
uma carga de trabalho, organizada em seis pilares, e a prova cobra sempre a
mesma coisa: dada uma prática, de qual pilar ela é.

## Os seis pilares e a pista de cada um

<Comparativo
colunas={["Pilar", "Objetivo", "A pista no enunciado"]}
linhas={[
["Excelência operacional", "Executar, monitorar e melhorar processos e procedimentos", "Revisão de incidente, automação da operação, mudança pequena e reversível"],
["Segurança", "Proteger informação, sistemas e ativos", "Identidade, permissão, criptografia, rastreabilidade, resposta a incidente"],
["Confiabilidade", "Entregar a função esperada e se recuperar de interrupção", "Falha, redundância, recuperação, teste de resiliência"],
["Eficiência de desempenho", "Usar o recurso certo e continuar eficiente quando a demanda muda", "Tipo de recurso, latência, escala, tecnologia adequada"],
["Otimização de custo", "Entregar valor pelo menor preço", "Fatura, recurso ocioso, marcação por projeto, dimensionamento"],
["Sustentabilidade", "Reduzir o impacto ambiental das cargas", "Consumo de energia, eficiência de recurso, impacto ambiental"]
]}
/>

## As três fronteiras que decidem a questão

Os pilares se tocam de propósito: uma arquitetura boa atende a todos. A prova
resolve isso com o **objetivo declarado** no enunciado, e três pares concentram
quase toda a dúvida.

<Passos itens={[
"Confiabilidade contra eficiência de desempenho: a primeira pergunta se o sistema continua de pé e volta depois da falha; a segunda, se ele continua rápido e usa o recurso adequado quando a carga cresce.",
"Excelência operacional contra confiabilidade: a primeira olha o processo da equipe, a segunda olha o comportamento do sistema. Automatizar a resposta a um alarme é operação; sobreviver à queda de uma zona é confiabilidade.",
"Otimização de custo contra sustentabilidade: as duas cortam desperdício. Se o enunciado fala em fatura, é custo; se fala em impacto ambiental ou energia, é sustentabilidade."
]} />

<Callout tipo="atencao" titulo="A mesma prática, dois pilares">
Desligar ambientes de teste à noite aparece nas duas listas. Não adianta
procurar a prática numa tabela decorada: leia o **porquê** que o enunciado dá.
"Para reduzir a fatura" é otimização de custo. "Para diminuir o consumo de
energia" é sustentabilidade. A prática é a mesma; o pilar é o do objetivo.
</Callout>

## A ferramenta, e o que ela não faz

A **AWS Well-Architected Tool** é onde a revisão acontece na prática: você
descreve a carga de trabalho, responde às perguntas de cada pilar e recebe um
plano de melhoria com os riscos encontrados. É autosserviço e é a resposta
quando o enunciado pede avaliar uma carga existente contra as boas práticas.

<Callout tipo="dica" titulo="Não confunda com o CAF">
Well-Architected avalia **uma carga de trabalho**. O Cloud Adoption Framework
organiza **a jornada da organização** para a nuvem, com perspectivas de
negócio, pessoas e governança. Quando o enunciado fala em avaliar uma
aplicação, é Well-Architected; quando fala em preparar a empresa para adotar a
nuvem, é CAF.
</Callout>

## Como responder o cenário

Procure o objetivo, não a tecnologia. A questão descreve uma prática e quase
sempre oferece dois pilares plausíveis; o que desempata é a frase que diz para
que a prática foi adotada. Se o enunciado não declara objetivo, use o
substantivo dominante: falha aponta confiabilidade, permissão aponta segurança,
latência aponta eficiência, fatura aponta custo, energia aponta
sustentabilidade, e processo de equipe aponta excelência operacional.

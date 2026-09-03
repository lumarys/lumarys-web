# ETL e ELT

> A sigla muda de ordem, mas o que muda de verdade é onde a transformação roda e o que aterrissa no destino. ELT ganhou espaço porque armazenar ficou barato e computar no destino ficou elástico — e trouxe riscos de PII, custo e governança junto.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/processamento/etl-vs-elt/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

ETL transforma o dado **em trânsito**, antes de gravar no destino; ELT grava o
dado bruto no destino e transforma **lá dentro**.

## O que realmente muda

A ordem das letras é consequência. A decisão é sobre duas coisas: **quem paga a
conta da computação** e **o que fica gravado no destino**.

<Comparativo
  colunas={["Aspecto", "ETL", "ELT"]}
  linhas={[
    ["Onde transforma", "Motor intermediário, entre origem e destino", "No próprio destino, depois do pouso"],
    ["O que aterrissa", "Dado já limpo, tipado e conformado", "Dado bruto, como veio da origem"],
    ["Custo", "Capacidade do motor de ETL, dimensionada para o pico", "Computação elástica no destino, recorrente"],
    ["Reprocessar regra nova", "Depende de a origem ainda ter o histórico", "Recalcula a partir do bruto guardado"],
    ["Dado sensível", "Pode ser mascarado antes de gravar", "Aterrissa cru, exige controle na zona bruta"],
    ["Esquema", "Rígido: definido antes da carga", "Flexível: interpretado na leitura"]
  ]}
/>

## Por que o ELT ganhou espaço

Duas mudanças econômicas. Armazenamento de objetos ficou barato o suficiente para
guardar tudo, inclusive o que talvez nunca seja usado. E a computação no destino
ficou elástica: em vez de dimensionar um servidor de ETL para o pico do
fechamento, você liga um cluster por vinte minutos e desliga.

Somado a isso, a variedade cresceu. JSON de API, log de aplicação e arquivo de
parceiro não cabem num esquema fixo definido antes da carga. Pousar primeiro e
interpretar depois deixou de ser gambiarra e virou desenho.

## O bruto é uma apólice

<Callout tipo="dica" titulo="O argumento que mais convence banca">
Se a definição de cliente ativo mudar, o time com o bruto guardado recalcula seis
anos de indicador em uma execução. O time que só guardou o transformado precisa
pedir o histórico de volta para a origem — e o core bancário raramente ainda tem.
</Callout>

Guardar o bruto custa armazenamento. Não guardar custa a impossibilidade de
corrigir o passado. No banco, onde regra de segmentação, de provisão e de risco
muda com frequência, essa apólice se paga.

## Os riscos do ELT

<Passos itens={[
  "Dado sensível entra cru: CPF, renda e dado de saúde passam a existir numa cópia dentro do lake, fora do perímetro da origem.",
  "Custo migra para o destino: transformação vira consumo recorrente de computação, e consulta ruim sobre tabela crua grande aparece na fatura.",
  "Governança vira gargalo: sem catálogo, dono, contrato e linhagem, o bruto acumula e ninguém sabe o que é cada tabela."
]} />

<Callout tipo="erro" titulo="ELT não elimina modelagem">
Ele adia. Adiar e nunca fazer é como um data lake vira pântano: milhares de
tabelas cruas, nenhuma com dono e nenhuma com significado documentado.
</Callout>

As mitigações são conhecidas e você deve saber citá-las: tokenização dos campos
críticos já na ingestão, controle de acesso por coluna na zona bronze, retenção
definida, particionamento e formato colunar para o custo, e contrato mais teste
de qualidade como condição para promover de bronze para prata.

## Quando ETL ainda é a resposta

Quatro situações resistem, e todas aparecem em banco:

1. **Mascarar PII antes do pouso.** Se a exigência é que nenhum campo
   identificável exista na zona bruta, a transformação tem que acontecer antes de
   gravar. Não há como corrigir isso depois.
2. **Contrato rígido.** Data mart contábil e reporte regulatório precisam que o
   registro ruim seja rejeitado no caminho, não descoberto três camadas adiante.
3. **Origem que não pode ser lida duas vezes.** Fila que consome a mensagem,
   arquivo de parceiro disponível por 24 horas, janela contratada de extração de
   mainframe.
4. **Destino sem capacidade de computação.** Se o alvo é um banco operacional que
   não aguenta transformação pesada, empurrar o T para lá é criar incidente.

## Como responder em voz alta

Comece pela diferença em uma frase — onde a transformação roda. Explique a
economia que fez o ELT ganhar. Defenda o bruto pelo reprocessamento. Liste os três
riscos com uma mitigação cada. Feche com as situações em que você ainda faria ETL.
Isso mostra decisão, e não preferência.

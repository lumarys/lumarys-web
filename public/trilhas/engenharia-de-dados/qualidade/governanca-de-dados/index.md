# Governança de dados

> Governança de dados é o conjunto de políticas, papéis, processos e padrões que fazem o dado ser confiável e usável. Quem responde pelo dado, onde ele está catalogado, de onde ele veio e quem pode vê-lo.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/qualidade/governanca-de-dados/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Governança de dados é o conjunto de **políticas, papéis, processos e padrões**
que faz o dado ser confiável, encontrável, protegido e usável — com alguém
nomeado para responder por ele.

## Os três papéis, e o que cada um responde

A pergunta que abre quase toda arguição é "quem responde por um dado errado".
Quem responde "o time de dados" perde o ponto. A separação clássica é esta:

<Comparativo
  colunas={["Papel", "Responde por", "Quem costuma ser no banco"]}
  linhas={[
    ["Data owner", "Significado e regra de negócio do dado, aprovação de acesso, decisão de retenção", "Gestor da área que gera o dado: cartões, crédito, cadastro"],
    ["Data steward", "Curadoria no dia a dia: definição no catálogo, métricas de qualidade, apuração de divergência", "Analista sênior dentro do domínio de negócio"],
    ["Data custodian", "Infraestrutura, pipeline, execução do controle de acesso, backup e disponibilidade", "Engenharia de dados e engenharia de plataforma"]
  ]}
/>

A frase que resolve a pergunta: **o dono define, o steward cuida, o custodiante
opera**. Se o erro foi de regra, é do owner. Se foi de execução, é do custodian.
Quem descobre e coordena, quase sempre, é o steward.

## Catálogo: o mapa

<Termo nome="catálogo de dados">Inventário pesquisável de conjuntos de dados com dono, definição de negócio, classificação de sensibilidade, linhagem e forma de pedir acesso.</Termo>

Sem catálogo, o custo de encontrar dado é maior que o de processá-lo. Alguém
precisa da base de transações PIX, pergunta no chat, recebe três tabelas
parecidas e escolhe a errada. Catálogo bom responde quatro coisas: **o que
existe, o que significa, quem manda nisso e como eu peço acesso**. No stack de
Databricks isso normalmente vive no Unity Catalog.

## Linhagem: impacto e auditoria

Linhagem é o rastro do dado, da origem até o relatório. Ela paga duas contas
concretas:

<Passos itens={[
  "Impacto de mudança: antes de alterar o tipo de uma coluna do cadastro, você vê quais tabelas e quais painéis quebram.",
  "Auditoria e regulador: o dado do relatório de risco veio de onde, passou por quais transformações, com qual versão da regra.",
  "Investigação de incidente: número divergiu, você percorre o caminho de trás para frente até achar o ponto de virada."
]} />

<Callout tipo="dica" titulo="Linhagem em nível de coluna">
Linhagem de tabela para tabela ajuda. Linhagem de coluna para coluna é a que
resolve auditoria de verdade, porque mostra qual campo de origem alimentou qual
campo do relatório.
</Callout>

## Classificação e política de acesso

Classificar é marcar cada dado por sensibilidade: do público ao restrito,
sinalizando dado pessoal e dado pessoal sensível. A classificação não é
burocracia — é o gatilho técnico. É ela que decide se a coluna de CPF aparece
mascarada, se a tabela exige criptografia adicional, se o acesso precisa de
aprovação do owner.

Política de acesso boa é por **papel e finalidade**, não por pessoa. "Analista
de prevenção a fraude enxerga transação e device, não enxerga renda declarada" é
política. "Fulano pediu e liberaram" é dívida.

## Onde a LGPD entra

Governança é o que torna a LGPD operável. Três amarrações diretas:

- **Finalidade**: o dado foi coletado para quê. Reaproveitar cadastro de conta
  corrente em um modelo de propensão exige avaliar se a finalidade cabe.
- **Base legal**: a justificativa que autoriza o tratamento. Em banco, boa parte
  se apoia em obrigação legal e execução de contrato, não em consentimento.
- **Retenção**: por quanto tempo se guarda. Guardar dado pessoal sem finalidade
  e sem prazo é exposição, não zelo.

<Callout tipo="atencao" titulo="Não transforme isso no tema de segurança">
Na sabatina, se a pergunta é de governança, fale de finalidade, base legal,
retenção e responsabilidade. Criptografia, tokenização e IAM são a resposta do
tema de segurança e privacidade — cite de passagem e volte.
</Callout>

## Governança federada, a ponte para Data Mesh

Num banco com dezenas de domínios, comitê central único vira fila. O modelo que
escala é **federado**: o centro publica glossário, padrões de nomenclatura,
níveis de classificação, política de retenção e as métricas mínimas de
qualidade; cada domínio tem seu owner e seu steward e responde pelo dado que
publica.

O preço da federação é divergência, e ela se controla por plataforma: catálogo
único, linhagem automática, classificação obrigatória no registro e verificação
de conformidade rodando sozinha. Esse é exatamente o pilar de governança
federada computacional do Data Mesh — dizer isso conecta os dois temas na
resposta.

## Como responder isso em voz alta

Defina em uma frase, nomeie os três papéis com quem é quem no banco, mostre
catálogo e linhagem como os dois artefatos que provam governança, amarre em
LGPD por finalidade, base legal e retenção, e feche com federado por causa da
escala. Cerca de dois minutos.

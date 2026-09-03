# As zonas de um Data Lake

> Zonear é o que separa um Data Lake de um pântano de dados. As quatro zonas (transient, raw, trusted e refined), o que cada uma garante, como elas se mapeiam na arquitetura medalhão e o que fazer com dado pessoal na entrada.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/camada-de-dados/zonas-data-lake/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Zonear um Data Lake é dividir o armazenamento em camadas com **contrato,
retenção, dono e permissão próprios**, para que quem lê saiba exatamente em que
pode confiar.

## O problema: o pântano de dados

Object storage é barato e aceita qualquer coisa. Essas duas virtudes, juntas e
sem disciplina, produzem o **pântano de dados**: milhares de arquivos que
ninguém sabe de onde vieram, quem mantém, se estão corretos ou se podem ser
apagados. O custo de armazenamento continua chegando todo mês; o valor não.

O sintoma clássico no banco é a reunião em que duas áreas trazem números
diferentes para a mesma pergunta, e a discussão vira sobre qual planilha está
certa em vez de sobre a decisão.

## As quatro zonas

<Comparativo
  colunas={["Zona", "O que garante", "Retenção típica", "Quem acessa"]}
  linhas={[
    ["Transient", "Nada sobre o conteúdo: é área de pouso até a checagem de integridade", "Horas a dias, com expurgo automático", "Só o processo de ingestão"],
    ["Raw", "Fidelidade total à origem, imutável, defeitos incluídos", "Longa, presa ao prazo regulatório do dado", "Engenharia de ingestão e auditoria"],
    ["Trusted", "Dado validado, deduplicado, tipado e padronizado, com schema estável", "Média: o bastante para reconstruir a refined", "Engenharia e ciência de dados"],
    ["Refined", "Dado modelado para uma pergunta de negócio, com métrica calculada", "Presa ao ciclo de uso do relatório ou modelo", "Analistas e áreas de negócio"]
  ]}
/>

O erro comum é tratar isso como quatro pastas. Uma zona só existe quando tem
**contrato de schema, política de retenção, política de acesso, dono e regra de
qualidade na entrada**. Sem isso, você tem um diretório com nome bonito.

<Callout tipo="atencao" titulo="A raw é imutável, e isso não é preciosismo">
Se você corrige o encoding, remove duplicata ou normaliza o CPF já na raw,
perde duas coisas: a evidência de como a origem enviou o dado, que é o que a
auditoria pede, e a possibilidade de reconstruir tudo quando descobrir que a
regra de limpeza estava errada. Correção é sempre um passo rastreável a partir
da raw, nunca uma sobrescrita nela.
</Callout>

## O mapeamento para a arquitetura medalhão

Os dois vocabulários descrevem o mesmo escalonamento de confiança. Traduzir um
no outro em voz alta é a parte que a banca costuma cobrar quando troca de termo
no meio da pergunta.

<Comparativo
  colunas={["Zona", "Medalhão", "Observação"]}
  linhas={[
    ["Transient", "sem equivalente", "É área de passagem, não camada de dado persistido"],
    ["Raw", "Bronze", "Ingestão bruta, append-only, cópia fiel da origem"],
    ["Trusted", "Silver", "Limpeza, deduplicação, conformidade de schema, junção leve"],
    ["Refined", "Gold", "Modelagem dimensional, agregação, métrica de negócio"]
  ]}
/>

A diferença de ênfase é real e vale citar: o vocabulário de zonas nasceu falando
de **governança** (retenção, acesso, dono), enquanto o medalhão nasceu falando de
**qualidade progressiva** em tabelas de um lakehouse. Na prática você implementa
os dois ao mesmo tempo, com Delta Lake por cima do S3.

## Retenção: o custo e o risco andam juntos

Retenção não é só conta de armazenamento. Guardar dado pessoal além da
finalidade é exposição de LGPD, não precaução. E apagar cedo demais quebra a
capacidade de reprocessar e pode violar prazo regulatório.

<Passos itens={[
  "Descubra o prazo regulatório do dado antes de definir a política, porque ele é o piso.",
  "Defina expurgo automático em cada zona; política que depende de alguém lembrar não existe.",
  "Use classe de armazenamento fria na raw antiga em vez de apagar, quando o prazo ainda corre.",
  "Registre a finalidade de cada conjunto: é ela que justifica a existência do dado pessoal."
]} />

## Controle de acesso: a raw é a mais fechada

A intuição de muita gente é o contrário, porque a raw "não tem nada de pronto".
É justo o oposto: a raw concentra dado pessoal **sem mascaramento nenhum**,
exatamente como a origem enviou. O mascaramento e a
<Termo nome="tokenização">Substituição do valor sensível por um substituto sem
significado, reversível apenas por quem tem acesso ao cofre de tokens.</Termo>
entram na porta da trusted, que é onde ciência de dados trabalha.

Quanto mais a jusante, mais aberta a camada e menos sensível o conteúdo. Se um
analista precisa do dado da raw para fechar um número, o problema quase sempre é
de qualidade na trusted, e é lá que ele deve ser resolvido.

<Callout tipo="dica" titulo="Como fechar a resposta oral">
Diga a garantia de cada zona, não o nome; traduza para bronze, silver e gold
sem que peçam; e termine com retenção e acesso. Esses três movimentos cobrem
quase toda rubrica que essa pergunta costuma ter.
</Callout>

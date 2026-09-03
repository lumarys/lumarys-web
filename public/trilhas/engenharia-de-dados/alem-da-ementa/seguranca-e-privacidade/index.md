# Segurança e privacidade de dados em banco

> Como a LGPD chega dentro do pipeline: dado pessoal e sensível, o que anonimização, pseudonimização e tokenização mudam no escopo da lei, e como controlar quem vê qual linha e qual coluna sem travar o analista.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/seguranca-e-privacidade/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Privacidade em pipeline de banco é decidir, **campo a campo e usuário a usuário**,
quem pode ver o quê — e provar depois que foi assim que aconteceu.

## Dado pessoal, dado sensível e o teste que importa

A LGPD chama de **dado pessoal** a informação relacionada a pessoa natural
identificada ou identificável. Repare no "identificável": o teste não é o campo
isolado, é a chance de chegar na pessoa combinando campos. CEP, data de
nascimento e valor da fatura, juntos, identificam.

**Dado pessoal sensível** é uma lista fechada: origem racial ou étnica, convicção
religiosa, opinião política, filiação a sindicato ou a organização religiosa,
filosófica ou política, dado de saúde ou vida sexual, dado genético e dado
biométrico. Sensível tem base legal mais estreita e, no seu desenho, deve virar
tabela à parte com acesso nominal.

<Callout tipo="atencao" titulo="Cuidado com o dado inferido">
Score de propensão, cluster de comportamento e classificação de risco também são
dado pessoal quando ligados a alguém identificável. Muita gente protege o cadastro
e deixa a tabela de modelo aberta.
</Callout>

## Bases legais, uma linha cada

O art. 7º traz dez hipóteses. Você não precisa recitar, precisa saber que existem
dez e citar as que aparecem em banco: **consentimento**; **cumprimento de obrigação
legal ou regulatória**; **execução de políticas públicas**; **estudo por órgão de
pesquisa**; **execução de contrato**; **exercício regular de direitos** em
processo; **proteção da vida**; **tutela da saúde**; **legítimo interesse**; e
**proteção do crédito**. Em banco, a maior parte do tratamento se apoia em contrato,
obrigação legal e proteção ao crédito — não em consentimento.

Dois princípios do art. 6º mandam no seu pipeline. **Finalidade**: o dado foi
coletado para um propósito declarado e não pode migrar de propósito no silêncio.
**Necessidade**: traga o mínimo de campos que resolve o caso de uso. Ingerir a
tabela inteira do core porque é mais fácil não é precaução, é exposição.

## Direitos do titular e o que cada um cobra de você

<Comparativo
  colunas={["Direito", "O que o pipeline precisa ter"]}
  linhas={[
    ["Confirmação e acesso", "Saber onde o dado daquele titular vive: catálogo e linhagem confiáveis"],
    ["Correção", "Caminho de atualização que se propague às camadas derivadas, não só ao cadastro"],
    ["Eliminação", "Capacidade de apagar de verdade, incluindo versões antigas do formato de tabela e cópias em zonas analíticas"],
    ["Portabilidade", "Exportar os dados do titular em formato estruturado e interoperável, dentro de prazo"],
    ["Informação sobre compartilhamento", "Registro de com quem o dado foi compartilhado, o que na prática é linhagem para fora"]
  ]}
/>

Eliminação e portabilidade são as duas que mais quebram desenho. Formato imutável,
backup e log de auditoria transformam um DELETE em projeto. O **encarregado** é o
canal entre titular, ANPD e a empresa — ele não escreve o pipeline, mas depende de
você para conseguir responder no prazo.

## Anonimizar, pseudonimizar, tokenizar

<Comparativo
  colunas={["Técnica", "O que faz", "Continua sob a LGPD?"]}
  linhas={[
    ["Anonimização", "Remove a possibilidade de associação ao titular por meios razoáveis: agregação, generalização, supressão", "Não"],
    ["Pseudonimização", "Substitui o identificador por um substituto, mantendo chave de reversão em separado", "Sim"],
    ["Tokenização", "Troca o valor por um token sem significado, com o de-para em cofre", "Sim"]
  ]}
/>

Essa é a distinção que a banca procura: **anonimizado sai do escopo da lei,
pseudonimizado não**. Hash de CPF é pseudonimização, não anonimização — o universo
de CPFs é enumerável e a tabela reversa é trivial de montar.

## Mascaramento, criptografia e chave

**Mascaramento estático** grava a versão mascarada em uma cópia: bom para ambiente
de desenvolvimento e teste. **Mascaramento dinâmico** mantém o dado original e
decide na consulta o que exibir, conforme quem pergunta.

**Criptografia em repouso** protege contra quem acessa a mídia por fora: snapshot
copiado, bucket exposto. **Em trânsito**, TLS protege o dado enquanto ele viaja
entre origem, cluster e storage. Um **KMS** guarda e rotaciona as chaves fora do
sistema que guarda o dado, e registra cada uso — separar chave de dado é o que faz
a criptografia valer alguma coisa.

<Callout tipo="erro" titulo="O erro clássico">
"Está tudo criptografado" não responde à pergunta sobre um analista que vê CPF
demais. Ele tem permissão: recebe o dado já decifrado. Criptografia e controle de
acesso resolvem ameaças diferentes.
</Callout>

## Quem vê o quê: RBAC, ABAC, linha e coluna

<Termo nome="RBAC">Acesso concedido pelo papel do usuário.</Termo> é simples de
auditar e explode em número de papéis quando as regras ficam finas.
<Termo nome="ABAC">Acesso decidido por atributos do usuário e do dado no momento da
consulta.</Termo> escala melhor, custa mais para governar.

Em cima disso vêm os dois recortes: **row-level security** decide quais registros a
pessoa vê (só a regional dela); **column-level security** decide quais campos ela vê
dentro dos registros permitidos (e-mail parcialmente oculto).

## Raw, auditoria e retenção

A zona **raw** guarda o dado como veio, com a maior retenção e, normalmente, o menor
controle. É a pior combinação possível. O tratamento é proteger na entrada:
tokenizar identificadores na aterrissagem, negociar no contrato de ingestão só os
campos necessários, e tornar a raw legível por serviço, não por pessoa.

Auditoria fecha o ciclo. Você precisa registrar quem consultou o quê e quando, e
manter esse log fora do alcance de quem ele audita. Retenção é a outra metade:
guardar além do necessário é risco, não zelo — e o prazo mínimo de guarda vem de
obrigação legal e regulatória do domínio [verificar o prazo aplicável ao seu caso].

## Como responder isso em voz alta

Comece separando as duas perguntas: proteger o dado guardado é criptografia e
chave; controlar quem lê é RBAC, ABAC, linha e coluna. Depois nomeie a técnica
certa para o caso e diga o que ela **não** resolve. Fechar admitindo o limite da
sua própria solução é o que soa sênior.

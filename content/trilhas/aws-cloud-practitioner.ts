import type { Trilha } from "../types";

/**
 * Trilha de certificação AWS Certified Cloud Practitioner.
 *
 * A ementa é o guia oficial do exame, versão CLF-C02, conferida no índice
 * oficial de guias em 17/09/2026 (não existe C03). O `verify-exames` confere
 * isso a cada build: se o código sumir do índice, o build falha; se aparecer
 * uma versão mais nova, avisa.
 *
 * Diferença de nível para a SAA: a CLF descreve uma necessidade em uma ou
 * duas frases e pede o serviço, o conceito ou a prática que atende. Não se
 * desenha arquitetura aqui, se reconhece e se posiciona. Por isso os temas
 * são próprios, e não compartilhados com a SAA: uma questão de arquitetura
 * dentro de uma prova de CLF quebraria a calibração do sorteio por peso.
 *
 * Estado desta trilha: "como funciona a prova" e os Domínios 1, 2 e 3
 * completos, com o checkpoint de cada um no cronograma. Resta o Domínio 4
 * inteiro (Cobrança, preços e suporte), no card LUM-147. O `prazoSugeridoDias`
 * acompanha o que existe e cresce com ele.
 */
export const awsCloudPractitioner: Trilha = {
  slug: "aws-cloud-practitioner",
  tipo: "certificacao",
  titulo: "AWS Cloud Practitioner",
  origem: "AWS · CLF-C02",
  objetivo:
    "Passar na AWS Certified Cloud Practitioner: reconhecer o serviço, o conceito e a prática que cada necessidade pede, nos quatro domínios do exame e no peso de cada um.",
  resumo:
    "O guia oficial do exame CLF-C02 transformado em estudo ativo: um módulo por domínio, cenários curtos no estilo da prova com o porquê de cada alternativa, cards de serviço e pista, e uma prova simulada cronometrada com nota na escala da AWS.",
  formatoProva: "Prova objetiva, 65 questões em 90 minutos",
  prazoSugeridoDias: 22,
  status: "disponivel",
  exame: {
    codigo: "CLF-C02",
    minutos: 90,
    questoes: 65,
    notaCorte: 700,
    precoUSD: 100,
    guiaUrl:
      "https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html",
  },
  modulos: [
    {
      slug: "como-funciona-a-prova",
      titulo: "Como funciona a prova",
      resumo:
        "Formato, pontuação, os dois tipos de questão e o método de ler um enunciado curto: achar o pedido antes das alternativas e reconhecer o serviço que atende.",
      status: "disponivel",
      oficial: false,
      temas: ["como-ler-uma-questao-clf"],
    },
    {
      slug: "conceitos",
      titulo: "Conceitos de nuvem",
      resumo:
        "O valor da nuvem e os modelos de implantação, os seis pilares do Well-Architected, a economia da nuvem e as estratégias de migração com o Cloud Adoption Framework.",
      status: "disponivel",
      oficial: true,
      dominioExame: "Domínio 1 · Cloud Concepts",
      pesoExame: 24,
      temas: [
        "valor-da-nuvem-e-modelos-de-implantacao",
        "well-architected-os-seis-pilares",
        "economia-da-nuvem",
        "migracao-para-a-nuvem-7-rs-e-caf",
      ],
    },
    {
      slug: "seguranca",
      titulo: "Segurança e conformidade",
      resumo:
        "Responsabilidade compartilhada, IAM, governança e conformidade, os serviços de segurança e o que cada um detecta, criptografia em repouso e em trânsito.",
      status: "disponivel",
      oficial: true,
      dominioExame: "Domínio 2 · Security and Compliance",
      pesoExame: 30,
      temas: [
        "modelo-de-responsabilidade-compartilhada",
        "iam-usuarios-grupos-roles-e-politicas",
        "conformidade-e-governanca-na-aws",
        "servicos-de-seguranca-da-aws",
        "criptografia-em-repouso-e-em-transito",
      ],
    },
    {
      slug: "tecnologia",
      titulo: "Tecnologia e serviços",
      resumo:
        "Formas de implantar e operar, infraestrutura global, computação, armazenamento, rede, bancos de dados, analytics e IA, integração e gestão.",
      status: "disponivel",
      oficial: true,
      dominioExame: "Domínio 3 · Cloud Technology and Services",
      pesoExame: 34,
      temas: [
        "formas-de-operar-na-aws",
        "infraestrutura-global-da-aws",
        "computacao-na-aws",
        "armazenamento-na-aws",
        "rede-e-conectividade-na-aws",
        "bancos-de-dados-na-aws-visao-geral",
        "analytics-e-ia-na-aws",
        "integracao-de-aplicacoes-na-aws",
        "gestao-monitoramento-e-outros-servicos",
      ],
    },
    {
      slug: "cobranca",
      titulo: "Cobrança, preços e suporte",
      resumo:
        "Modelos de preço e nível gratuito, ferramentas de custo e orçamento, Organizations e faturamento consolidado, planos de suporte, Marketplace e parceiros.",
      status: "em-breve",
      oficial: true,
      dominioExame: "Domínio 4 · Billing, Pricing, and Support",
      pesoExame: 12,
      temas: [],
    },
  ],
  cronograma: [
    {
      dia: 1,
      titulo: "A prova antes do conteúdo",
      temas: ["como-ler-uma-questao-clf"],
      nota: "Leia o método e este tema antes de qualquer serviço. Na CLF o enunciado tem duas ou três linhas, e quem não fixa o pedido escolhe o serviço mais conhecido em vez do que foi pedido.",
    },
    {
      dia: 2,
      titulo: "O valor da nuvem e os modelos de implantação",
      temas: ["valor-da-nuvem-e-modelos-de-implantacao"],
      revisao: ["como-funciona-a-prova"],
      nota: "Começa o domínio de 24%. Os seis benefícios e a diferença entre IaaS, PaaS e SaaS aparecem em enunciado curto, quase sem contexto: é reconhecimento puro.",
    },
    {
      dia: 3,
      titulo: "Well-Architected: os seis pilares",
      temas: ["well-architected-os-seis-pilares"],
      revisao: ["conceitos"],
      nota: "Aqui a questão dá uma prática e pede o pilar. Leia cada pilar pela palavra que o denuncia no enunciado, não pela definição decorada.",
    },
    {
      dia: 4,
      titulo: "Economia da nuvem",
      temas: ["economia-da-nuvem"],
      revisao: ["conceitos"],
      nota: "CapEx contra OpEx, custo fixo contra variável, TCO e right-sizing. Este tema volta no Domínio 4, com as ferramentas que medem cada coisa.",
    },
    {
      dia: 5,
      titulo: "Migração: os 7 Rs e o CAF",
      temas: ["migracao-para-a-nuvem-7-rs-e-caf"],
      revisao: ["conceitos"],
      nota: "Fecha o Domínio 1. Cada R tem um caso que o enunciado descreve em uma frase; o CAF entra como as seis perspectivas da jornada, não como projeto técnico.",
    },
    {
      dia: 6,
      titulo: "Checkpoint do Domínio 1 e primeira prova simulada",
      temas: [],
      revisao: ["como-funciona-a-prova", "conceitos"],
      nota: "Checkpoint do módulo e, na sequência, a prova simulada com o banco atual, no ritmo do exame: cerca de 1,4 minuto por questão. Abaixo de 70% no checkpoint, releia o tema apontado antes da prova.",
    },
    {
      dia: 7,
      titulo: "O modelo de responsabilidade compartilhada",
      temas: ["modelo-de-responsabilidade-compartilhada"],
      revisao: ["conceitos"],
      nota: "Começa o domínio de 30%, o maior da prova. Este tema é a base dos outros quatro: sem a linha entre segurança da nuvem e segurança na nuvem, nenhuma questão do domínio fecha.",
    },
    {
      dia: 8,
      titulo: "IAM: usuários, grupos, roles e políticas",
      temas: ["iam-usuarios-grupos-roles-e-politicas"],
      revisao: ["seguranca"],
      nota: "O tema mais denso do domínio. Pare quando conseguir dizer, sem pensar, quando a resposta é role e quando é grupo.",
    },
    {
      dia: 9,
      titulo: "Conformidade e governança na AWS",
      temas: ["conformidade-e-governanca-na-aws"],
      revisao: ["seguranca"],
      nota: "Aqui a questão é sempre um pedido de documento ou de registro. Fixe dois pares: Artifact contra Audit Manager e CloudTrail contra Config.",
    },
    {
      dia: 10,
      titulo: "Os serviços de segurança e o que cada um detecta",
      temas: ["servicos-de-seguranca-da-aws"],
      revisao: ["seguranca"],
      nota: "Catálogo puro: cada serviço em uma linha e a palavra do enunciado que aponta para ele. GuardDuty, Inspector e Macie respondem por boa parte das questões.",
    },
    {
      dia: 11,
      titulo: "Criptografia em repouso e em trânsito",
      temas: ["criptografia-em-repouso-e-em-transito"],
      revisao: ["seguranca"],
      nota: "Fecha o Domínio 2. Separe o estado do dado antes de escolher o serviço, e depois responda quem tem a chave.",
    },
    {
      dia: 12,
      titulo: "Checkpoint do Domínio 2 e segunda prova simulada",
      temas: [],
      revisao: ["conceitos", "seguranca"],
      nota: "Agora com os dois domínios no banco. Compare o resultado por domínio com o da primeira prova: o de 30% precisa subir mais do que o de 24%.",
    },
    {
      dia: 13,
      titulo: "Formas de implantar e operar na AWS",
      temas: ["formas-de-operar-na-aws"],
      revisao: ["seguranca"],
      nota: "Começa o domínio de 34%, o maior da prova. A partir daqui a questão descreve a necessidade e pede o serviço, então leia o enunciado procurando o verbo do pedido antes de olhar as alternativas.",
    },
    {
      dia: 14,
      titulo: "A infraestrutura global da AWS",
      temas: ["infraestrutura-global-da-aws"],
      revisao: ["seguranca"],
      nota: "Vocabulário que sustenta o resto do domínio. Saia daqui sabendo dizer, sem pensar, quando o problema é de zona, quando é de região e quando é de borda.",
    },
    {
      dia: 15,
      titulo: "Computação na AWS",
      temas: ["computacao-na-aws"],
      revisao: ["tecnologia"],
      nota: "A categoria com mais alternativas parecidas. Fixe a escala de quanto do servidor o cliente administra: EC2, depois contêiner, depois Lambda.",
    },
    {
      dia: 16,
      titulo: "Armazenamento na AWS",
      temas: ["armazenamento-na-aws"],
      revisao: ["tecnologia"],
      nota: "Classifique o dado antes de escolher o serviço: objeto aponta S3, bloco aponta EBS, arquivo compartilhado aponta EFS. Depois disso, decida a classe pela frequência de acesso.",
    },
    {
      dia: 17,
      titulo: "Rede e conectividade na AWS",
      temas: ["rede-e-conectividade-na-aws"],
      revisao: ["tecnologia"],
      nota: "Dois pares decidem o tema: security group contra lista de controle de acesso de rede, e VPN contra Direct Connect. Tenha as duas perguntas de desempate prontas.",
    },
    {
      dia: 18,
      titulo: "Bancos de dados: visão geral",
      temas: ["bancos-de-dados-na-aws-visao-geral"],
      revisao: ["tecnologia"],
      nota: "Classifique a carga antes do serviço: transacional relacional aponta RDS ou Aurora, acesso por chave aponta DynamoDB, análise sobre histórico aponta Redshift. Esse trio responde pela maior parte das questões de banco.",
    },
    {
      dia: 19,
      titulo: "Analytics, IA e machine learning",
      temas: ["analytics-e-ia-na-aws"],
      revisao: ["tecnologia"],
      nota: "O tema com mais nomes e menos profundidade do domínio. Decore cada serviço por uma linha de função e pela entrada que ele recebe: imagem, documento, texto ou voz.",
    },
    {
      dia: 20,
      titulo: "Integração de aplicações",
      temas: ["integracao-de-aplicacoes-na-aws"],
      revisao: ["tecnologia"],
      nota: "Conte os destinos da mensagem: um consumidor que vem buscar é fila, vários inscritos de uma vez é tópico, destino que depende de regra é barramento de eventos.",
    },
    {
      dia: 21,
      titulo: "Gestão, monitoramento e as demais categorias",
      temas: ["gestao-monitoramento-e-outros-servicos"],
      revisao: ["tecnologia"],
      nota: "Fecha o Domínio 3. Separe o verbo do pedido antes das alternativas: medir, auditar, operar, recomendar ou saber de um evento da própria AWS.",
    },
    {
      dia: 22,
      titulo: "Checkpoint do Domínio 3 e terceira prova simulada",
      temas: [],
      revisao: ["seguranca", "tecnologia"],
      nota: "Checkpoint do módulo e, na sequência, a terceira prova simulada, agora com três domínios no banco. Abaixo de 70% no checkpoint, releia o tema apontado antes da prova; depois compare o resultado por domínio com o das duas provas anteriores.",
    },
  ],
};

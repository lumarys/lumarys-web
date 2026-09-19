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
 * Estado desta trilha: "como funciona a prova" e o Domínio 1 publicados. Os
 * outros três domínios já aparecem como módulos "em breve", com o peso que a
 * AWS declara, e chegam nos cards LUM-144 (Segurança e conformidade),
 * LUM-145 e LUM-146 (Tecnologia e serviços) e LUM-147 (Cobrança, preços e
 * suporte). O `prazoSugeridoDias` acompanha o que existe e cresce com eles.
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
  prazoSugeridoDias: 6,
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
      status: "em-breve",
      oficial: true,
      dominioExame: "Domínio 2 · Security and Compliance",
      pesoExame: 30,
      temas: [],
    },
    {
      slug: "tecnologia",
      titulo: "Tecnologia e serviços",
      resumo:
        "Formas de implantar e operar, infraestrutura global, computação, armazenamento, rede, bancos de dados, analytics e IA, integração e gestão.",
      status: "em-breve",
      oficial: true,
      dominioExame: "Domínio 3 · Cloud Technology and Services",
      pesoExame: 34,
      temas: [],
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
  ],
};

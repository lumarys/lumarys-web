import type { Trilha } from "../types";

/**
 * Trilha de certificação AWS Certified Solutions Architect – Associate.
 *
 * A ementa é o guia oficial do exame, versão SAA-C03 — conferida no índice
 * oficial de guias em 12/09/2026 (não existe C04; um blog dizia o contrário).
 * O `verify-exames` confere isso a cada build: se o código sumir do índice, o
 * build falha; se aparecer uma versão mais nova, avisa.
 *
 * Cada domínio do exame é um módulo, com o peso que a AWS declara. As
 * questões dos temas são cenários no estilo da prova, e a prova simulada
 * sorteia pelo peso. Os temas usam `formato: prova`: cenários objetivos em vez
 * de perguntas orais.
 *
 * Onda 1: a prova, "como ler uma questão" e os três primeiros temas do
 * Domínio 1. Os demais domínios entram um por onda; o cronograma cresce junto
 * e o prazo-alvo com a trilha completa é 42 dias.
 */
export const awsSolutionsArchitectAssociate: Trilha = {
  slug: "aws-solutions-architect-associate",
  tipo: "certificacao",
  titulo: "AWS Solutions Architect Associate",
  origem: "AWS · SAA-C03",
  objetivo:
    "Passar na AWS Certified Solutions Architect – Associate: escolher o serviço e a arquitetura certos para cada cenário, nos quatro domínios do exame e no peso de cada um.",
  resumo:
    "O guia oficial do exame SAA-C03 transformado em estudo ativo: um módulo por domínio, cenários no estilo da prova com o porquê de cada alternativa, cards de limites e números, e uma prova simulada cronometrada com nota na escala da AWS.",
  formatoProva: "Prova objetiva, 65 questões em 130 minutos",
  prazoSugeridoDias: 7,
  status: "disponivel",
  exame: {
    codigo: "SAA-C03",
    minutos: 130,
    questoes: 65,
    notaCorte: 720,
    precoUSD: 150,
    guiaUrl:
      "https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html",
  },
  modulos: [
    {
      slug: "como-funciona-a-prova",
      titulo: "Como funciona a prova",
      resumo:
        "Formato, pontuação, os dois tipos de questão e como ler um enunciado da AWS: o que 'mais barato', 'menos esforço operacional' e 'mais resiliente' querem dizer.",
      status: "disponivel",
      oficial: false,
      temas: ["como-ler-uma-questao-saa"],
    },
    {
      slug: "seguras",
      titulo: "Arquiteturas seguras",
      resumo:
        "Acesso, rede e proteção de dados: IAM além do básico, o perímetro da VPC e a criptografia que a prova cobra em quase todo cenário.",
      status: "disponivel",
      oficial: true,
      dominioExame: "Domínio 1 · Design Secure Architectures",
      pesoExame: 30,
      temas: ["iam-avancado", "seguranca-de-rede-na-vpc", "protecao-de-dados-na-aws"],
    },
    {
      slug: "resilientes",
      titulo: "Arquiteturas resilientes",
      resumo:
        "Multi-AZ e multirregião, balanceamento e Auto Scaling, réplicas, roteamento do Route 53, desacoplamento e as estratégias de DR com RTO e RPO.",
      status: "em-breve",
      oficial: true,
      dominioExame: "Domínio 2 · Design Resilient Architectures",
      pesoExame: 26,
      temas: [],
    },
    {
      slug: "desempenho",
      titulo: "Arquiteturas de alto desempenho",
      resumo:
        "Escolher armazenamento, computação, cache, banco e rede pelo caso de uso: classes S3, tipos de EBS, famílias EC2, ElastiCache, DAX, Global Accelerator.",
      status: "em-breve",
      oficial: true,
      dominioExame: "Domínio 3 · Design High-Performing Architectures",
      pesoExame: 24,
      temas: [],
    },
    {
      slug: "custo",
      titulo: "Arquiteturas otimizadas em custo",
      resumo:
        "Modelos de preço, ciclo de vida e Intelligent-Tiering no S3, right-sizing, Spot e Savings Plans, e o custo de transferência que derruba candidato.",
      status: "em-breve",
      oficial: true,
      dominioExame: "Domínio 4 · Design Cost-Optimized Architectures",
      pesoExame: 20,
      temas: [],
    },
  ],
  cronograma: [
    {
      dia: 1,
      titulo: "A prova antes do conteúdo",
      temas: ["como-ler-uma-questao-saa"],
      nota: "Leia o método e este tema antes de qualquer serviço. Metade dos erros na SAA é de leitura, não de conhecimento.",
    },
    { dia: 2, titulo: "IAM além do básico", temas: ["iam-avancado"] },
    {
      dia: 3,
      titulo: "Rede: o perímetro da VPC",
      temas: ["seguranca-de-rede-na-vpc"],
      revisao: ["como-funciona-a-prova"],
    },
    {
      dia: 4,
      titulo: "Proteção de dados",
      temas: ["protecao-de-dados-na-aws"],
      revisao: ["seguras"],
    },
    {
      dia: 5,
      titulo: "Cards e checkpoint do Domínio 1",
      temas: [],
      revisao: ["seguras"],
      nota: "Faça o checkpoint do módulo. Abaixo de 70%, releia o tema apontado antes de seguir.",
    },
    {
      dia: 6,
      titulo: "Primeira prova simulada",
      temas: [],
      revisao: ["seguras"],
      nota: "Prova simulada com o banco atual, no ritmo do exame: 2 minutos por questão. O que importa hoje é o tempo, não a nota.",
    },
    {
      dia: 7,
      titulo: "Revisão leve",
      temas: [],
      revisao: ["como-funciona-a-prova", "seguras"],
      nota: "Só cards vencidos e a folha de revisão. Os próximos domínios entram em breve; o plano cresce com eles.",
    },
  ],
};

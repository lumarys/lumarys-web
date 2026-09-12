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
 * Trilha completa: "como ler uma questão" e os quatro domínios do exame, 22
 * temas ao todo. O cronograma de 34 dias cobre um tema por dia útil, com
 * checkpoint e prova simulada ao fim de cada domínio e uma prova completa de
 * 65 questões na reta final. O plano original estimava 42 dias para cerca de
 * 32 temas; os temas saíram menos numerosos e mais densos, e o cronograma
 * acompanha o que existe em vez de esticar para a estimativa.
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
  prazoSugeridoDias: 34,
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
        "Acesso, rede, dados, borda e detecção: IAM além do básico, o perímetro da VPC, criptografia, WAF e Shield, auditoria com CloudTrail e Config, e Cognito para usuários de aplicação.",
      status: "disponivel",
      oficial: true,
      dominioExame: "Domínio 1 · Design Secure Architectures",
      pesoExame: 30,
      temas: [
        "iam-avancado",
        "seguranca-de-rede-na-vpc",
        "protecao-de-dados-na-aws",
        "protecao-de-borda-waf-shield",
        "deteccao-e-auditoria-na-aws",
        "identidade-de-usuarios-e-acesso-a-apis",
      ],
    },
    {
      slug: "resilientes",
      titulo: "Arquiteturas resilientes",
      resumo:
        "Multi-AZ e multirregião, balanceamento e Auto Scaling, réplicas, roteamento do Route 53, desacoplamento e as estratégias de DR com RTO e RPO.",
      status: "disponivel",
      oficial: true,
      dominioExame: "Domínio 2 · Design Resilient Architectures",
      pesoExame: 26,
      temas: [
        "alta-disponibilidade-e-tolerancia-a-falhas",
        "balanceamento-e-auto-scaling",
        "bancos-de-dados-resilientes",
        "route-53-roteamento-e-failover",
        "desacoplamento-com-filas-e-eventos",
        "estrategias-de-recuperacao-de-desastres",
      ],
    },
    {
      slug: "desempenho",
      titulo: "Arquiteturas de alto desempenho",
      resumo:
        "Escolher armazenamento, computação, cache, banco e rede pelo caso de uso: classes S3, tipos de EBS, famílias EC2, ElastiCache, DAX, Global Accelerator.",
      status: "disponivel",
      oficial: true,
      dominioExame: "Domínio 3 · Design High-Performing Architectures",
      pesoExame: 24,
      temas: [
        "armazenamento-por-caso-de-uso",
        "computacao-ec2-containers-e-serverless",
        "cache-e-entrega-de-conteudo",
        "banco-de-dados-por-caso-de-uso",
        "rede-de-alto-desempenho",
      ],
    },
    {
      slug: "custo",
      titulo: "Arquiteturas otimizadas em custo",
      resumo:
        "Modelos de preço, ciclo de vida e Intelligent-Tiering no S3, right-sizing, Spot e Savings Plans, e o custo de transferência que derruba candidato.",
      status: "disponivel",
      oficial: true,
      dominioExame: "Domínio 4 · Design Cost-Optimized Architectures",
      pesoExame: 20,
      temas: [
        "modelos-de-preco-da-computacao",
        "custo-de-transferencia-de-dados",
        "dimensionamento-e-custo-de-armazenamento",
        "ferramentas-de-custo-e-governanca",
      ],
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
      titulo: "Borda: WAF e Shield",
      temas: ["protecao-de-borda-waf-shield"],
      revisao: ["seguras"],
    },
    {
      dia: 6,
      titulo: "Detecção e auditoria",
      temas: ["deteccao-e-auditoria-na-aws"],
      revisao: ["seguras"],
    },
    {
      dia: 7,
      titulo: "Usuários de aplicação e APIs",
      temas: ["identidade-de-usuarios-e-acesso-a-apis"],
      revisao: ["seguras"],
    },
    {
      dia: 8,
      titulo: "Cards e checkpoint do Domínio 1",
      temas: [],
      revisao: ["seguras"],
      nota: "Faça o checkpoint do módulo. Abaixo de 70%, releia o tema apontado antes de seguir.",
    },
    {
      dia: 9,
      titulo: "Primeira prova simulada",
      temas: [],
      revisao: ["seguras"],
      nota: "Prova simulada com o banco atual, no ritmo do exame: 2 minutos por questão. O que importa hoje é o tempo, não a nota.",
    },
    {
      dia: 10,
      titulo: "Zona, região e o vocabulário da resiliência",
      temas: ["alta-disponibilidade-e-tolerancia-a-falhas"],
      revisao: ["seguras"],
      nota: "Começa o domínio de 26%. Este tema é curto e decide muita questão: é dele que sai o 'mais de uma zona'.",
    },
    {
      dia: 11,
      titulo: "Balanceamento e Auto Scaling",
      temas: ["balanceamento-e-auto-scaling"],
      revisao: ["seguras"],
    },
    {
      dia: 12,
      titulo: "Bancos resilientes",
      temas: ["bancos-de-dados-resilientes"],
      revisao: ["resilientes"],
    },
    {
      dia: 13,
      titulo: "Route 53: roteamento e failover",
      temas: ["route-53-roteamento-e-failover"],
      revisao: ["resilientes"],
    },
    {
      dia: 14,
      titulo: "Desacoplamento com filas e eventos",
      temas: ["desacoplamento-com-filas-e-eventos"],
      revisao: ["resilientes"],
    },
    {
      dia: 15,
      titulo: "Recuperação de desastres",
      temas: ["estrategias-de-recuperacao-de-desastres"],
      revisao: ["resilientes"],
      nota: "Traga os números do enunciado para o eixo RTO e RPO antes de olhar as alternativas. É o hábito que a prova cobra.",
    },
    {
      dia: 16,
      titulo: "Cards e checkpoint do Domínio 2",
      temas: [],
      revisao: ["resilientes"],
      nota: "Checkpoint do módulo. Abaixo de 70%, releia o tema apontado antes da prova de amanhã.",
    },
    {
      dia: 17,
      titulo: "Segunda prova simulada",
      temas: [],
      revisao: ["seguras", "resilientes"],
      nota: "Agora com os dois domínios no banco. Compare o resultado por domínio com o da primeira prova.",
    },
    {
      dia: 18,
      titulo: "Revisão leve",
      temas: [],
      revisao: ["como-funciona-a-prova", "seguras", "resilientes"],
      nota: "Só cards vencidos e a folha de revisão. Amanhã começa o domínio de desempenho.",
    },
    {
      dia: 19,
      titulo: "Armazenamento por caso de uso",
      temas: ["armazenamento-por-caso-de-uso"],
      revisao: ["resilientes"],
      nota: "Começa o domínio de 24%. A primeira pergunta de todo cenário aqui é: bloco, arquivo ou objeto?",
    },
    {
      dia: 20,
      titulo: "Computação: instâncias, containers e serverless",
      temas: ["computacao-ec2-containers-e-serverless"],
      revisao: ["resilientes"],
    },
    {
      dia: 21,
      titulo: "Cache e entrega de conteúdo",
      temas: ["cache-e-entrega-de-conteudo"],
      revisao: ["desempenho"],
    },
    {
      dia: 22,
      titulo: "Qual banco para qual caso de uso",
      temas: ["banco-de-dados-por-caso-de-uso"],
      revisao: ["desempenho"],
    },
    {
      dia: 23,
      titulo: "Rede de alto desempenho e híbrida",
      temas: ["rede-de-alto-desempenho"],
      revisao: ["desempenho"],
    },
    {
      dia: 24,
      titulo: "Cards e checkpoint do Domínio 3",
      temas: [],
      revisao: ["desempenho"],
      nota: "Checkpoint do módulo. Abaixo de 70%, releia o tema apontado antes da prova de amanhã.",
    },
    {
      dia: 25,
      titulo: "Terceira prova simulada",
      temas: [],
      revisao: ["seguras", "resilientes", "desempenho"],
      nota: "Três domínios no banco. Compare o resultado por domínio com o das provas anteriores e ataque o mais fraco.",
    },
    {
      dia: 26,
      titulo: "Revisão leve",
      temas: [],
      revisao: ["como-funciona-a-prova", "desempenho"],
      nota: "Só cards vencidos e a folha de revisão. Amanhã começa o último domínio.",
    },
    {
      dia: 27,
      titulo: "Modelos de preço da computação",
      temas: ["modelos-de-preco-da-computacao"],
      revisao: ["desempenho"],
      nota: "Começa o domínio de 20%, o último. Aqui o enunciado descreve o padrão de uso e espera o modelo de compra.",
    },
    {
      dia: 28,
      titulo: "Custo de transferência de dados",
      temas: ["custo-de-transferencia-de-dados"],
      revisao: ["desempenho"],
    },
    {
      dia: 29,
      titulo: "Dimensionamento e custo de armazenamento",
      temas: ["dimensionamento-e-custo-de-armazenamento"],
      revisao: ["custo"],
    },
    {
      dia: 30,
      titulo: "Ferramentas de custo e governança",
      temas: ["ferramentas-de-custo-e-governanca"],
      revisao: ["custo"],
    },
    {
      dia: 31,
      titulo: "Cards e checkpoint do Domínio 4",
      temas: [],
      revisao: ["custo"],
      nota: "Último checkpoint. Abaixo de 70%, releia o tema apontado: amanhã a prova é completa.",
    },
    {
      dia: 32,
      titulo: "Prova simulada completa",
      temas: [],
      revisao: ["seguras", "resilientes", "desempenho", "custo"],
      nota: "As 65 questões, 130 minutos, os quatro domínios no peso real. Trate como a prova: sem consultar nada, de uma vez só.",
    },
    {
      dia: 33,
      titulo: "Atacar os domínios fracos",
      temas: [],
      revisao: ["seguras", "resilientes", "desempenho", "custo"],
      nota: "Olhe o resultado por domínio da prova de ontem e releia só os temas dos dois domínios mais fracos. Refaça os drills deles.",
    },
    {
      dia: 34,
      titulo: "Véspera",
      temas: [],
      revisao: ["como-funciona-a-prova"],
      nota: "Releia como ler uma questão, passe os cards vencidos e pare. Não estude conteúdo novo na véspera: durma.",
    },
  ],
};

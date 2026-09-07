import type { Trilha } from "../types";

/**
 * Trilha de Engenharia de Analytics — ementa oficial de carreira de uma grande
 * instituição do mercado financeiro, a mesma origem da trilha de Dados.
 *
 * O que a ementa recebida sustenta é o módulo Big Data: 13 itens vieram
 * listados, e os 4 que faltam para os 17 declarados são exatamente os 4 temas
 * de Dados ausentes da lista (XML, JSON, Governança, Data Quality). Por isso o
 * módulo é o de Dados inteiro, menos Databricks, mais um tema próprio: Source
 * of Record vs Source of Truth. Os temas são COMPARTILHADOS com a trilha de
 * Dados, não copiados — o progresso conta nas duas e a URL canônica fica em
 * Dados, onde nasceram.
 *
 * Os outros seis módulos vieram sem item nenhum. Ficam declarados como "em
 * breve" e entram um por onda, construídos a partir do que o mercado cobra
 * (docs/PLANO.md §5.2), marcados `oficial: false` até o dono validar contra
 * a ementa real.
 *
 * O nome da instituição não aparece em lugar nenhum: não temos autorização
 * para usá-lo, e o conteúdo vale sem ele.
 */
export const engenhariaDeAnalytics: Trilha = {
  slug: "engenharia-de-analytics",
  tipo: "carreira",
  titulo: "Engenharia de Analytics",
  origem: "Ementa oficial · mercado financeiro",
  objetivo:
    "Passar na sabatina de ingresso na carreira de Engenharia de Analytics: a mesma base de dados da trilha de Engenharia de Dados, com ênfase em consumo analítico, consistência de números e o que o negócio faz com o dado.",
  resumo:
    "A ementa oficial de uma carreira de Engenharia de Analytics no mercado financeiro, transformada em estudo ativo. Começa pelo módulo Big Data completo e cresce módulo a módulo: AWS, banco de dados, programação, DevOps, dataviz e Data Mesh.",
  formatoProva: "Sabatina oral com banca",
  prazoSugeridoDias: 8,
  status: "disponivel",
  modulos: [
    {
      slug: "big-data",
      titulo: "Big Data",
      resumo:
        "A mesma fundação da trilha de Dados, lida com os olhos de quem consome: onde o número nasce, onde ele é oficial e por que dois relatórios divergem.",
      status: "disponivel",
      oficial: true,
      temas: [
        "big-data",
        "olap-oltp-etl",
        "data-centric-data-driven",
        "hadoop-arquitetura",
        "mapreduce",
        "batch-vs-stream",
        "etl-vs-elt",
        "particionamento-de-dados",
        "spark-introducao",
        "spark-rdd",
        "zonas-data-lake",
        "source-of-record-vs-source-of-truth",
        "classificacao-tipos-dados",
        "xml",
        "json",
        "governanca-de-dados",
        "data-quality",
      ],
    },
    {
      slug: "aws",
      titulo: "AWS",
      resumo:
        "S3, Glue, Athena, Redshift e QuickSight: a pilha analítica na nuvem que a instituição usa.",
      status: "em-breve",
      oficial: false,
      temas: [],
    },
    {
      slug: "banco-de-dados",
      titulo: "Banco de dados",
      resumo:
        "Relacional e NoSQL, ACID e BASE, normalização e modelagem dimensional, índices e SQL avançado.",
      status: "em-breve",
      oficial: false,
      temas: [],
    },
    {
      slug: "programacao",
      titulo: "Programação",
      resumo:
        "Python para dados, SQL como linguagem principal, Git e o fluxo de revisão, testes e notebooks.",
      status: "em-breve",
      oficial: false,
      temas: [],
    },
    {
      slug: "devops",
      titulo: "DevOps",
      resumo:
        "CI/CD para dados e dashboards, ambientes, Docker, infraestrutura como código e observabilidade.",
      status: "em-breve",
      oficial: false,
      temas: [],
    },
    {
      slug: "dataviz",
      titulo: "Dataviz",
      resumo:
        "Percepção visual, escolha de gráfico, storytelling, dashboards que funcionam e os erros que a banca conhece.",
      status: "em-breve",
      oficial: false,
      temas: [],
    },
    {
      slug: "data-mesh",
      titulo: "Data Mesh",
      resumo:
        "Os quatro princípios, o produto de dados, contratos, plataforma self-serve e governança federada.",
      status: "em-breve",
      oficial: false,
      temas: [],
    },
    {
      slug: "alem-da-ementa",
      titulo: "Além da ementa",
      resumo:
        "O núcleo de Analytics Engineering que a ementa não cobre: dbt, camada semântica, modelagem para BI, estatística e reconciliação de números.",
      status: "em-breve",
      oficial: false,
      temas: [],
    },
  ],
  cronograma: [
    {
      dia: 1,
      titulo: "Método e Fundamentos",
      temas: ["big-data", "olap-oltp-etl", "data-centric-data-driven"],
      nota: "Leia a página de método antes de começar. Se você já fez a trilha de Dados, estes temas estão concluídos aqui também: use o dia para os cards.",
    },
    { dia: 2, titulo: "Hadoop", temas: ["hadoop-arquitetura", "mapreduce"] },
    {
      dia: 3,
      titulo: "Processamento de dados",
      temas: ["batch-vs-stream", "etl-vs-elt", "particionamento-de-dados"],
    },
    { dia: 4, titulo: "Spark", temas: ["spark-introducao", "spark-rdd"] },
    {
      dia: 5,
      titulo: "Onde o número nasce e onde ele é oficial",
      temas: ["zonas-data-lake", "source-of-record-vs-source-of-truth"],
      nota: "O tema de Source of Record e Source of Truth é o que distingue esta trilha da de Dados. Dê a ele o tempo de dois.",
    },
    {
      dia: 6,
      titulo: "Tipos de dados",
      temas: ["classificacao-tipos-dados", "xml", "json"],
      revisao: ["big-data"],
    },
    {
      dia: 7,
      titulo: "Qualidade e simulado",
      temas: ["governanca-de-dados", "data-quality"],
      revisao: ["big-data"],
      nota: "Primeiro simulado: 8 perguntas do módulo inteiro. Ataque o que ficou abaixo de 60%.",
    },
    {
      dia: 8,
      titulo: "Revisão leve",
      temas: [],
      revisao: ["big-data"],
      nota: "Só cards vencidos, a folha de revisão do módulo e o checkpoint. Não estude conteúdo novo na véspera.",
    },
  ],
};

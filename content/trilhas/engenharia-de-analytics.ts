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
 * Os outros seis módulos vieram sem item nenhum. Foram construídos a partir
 * do que o mercado cobra (docs/PLANO.md §5.2) e seguem marcados
 * `oficial: false` até o dono validar contra a ementa real. Vários temas são
 * compartilhados com a trilha de Dados: um tema é um estudo só, e o progresso
 * conta nas duas.
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
  prazoSugeridoDias: 38,
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
        "A pilha analítica na nuvem: S3, Glue, Athena, Redshift, Lake Formation e o consumo em QuickSight. O panorama é compartilhado com a trilha de Dados; o aprofundamento em warehouse é próprio daqui.",
      status: "disponivel",
      oficial: false,
      temas: ["aws-para-dados", "redshift-e-consumo-analitico"],
    },
    {
      slug: "banco-de-dados",
      titulo: "Banco de dados",
      resumo:
        "Relacional e NoSQL, ACID e BASE, normalização e modelagem dimensional, índices, plano de execução e SQL avançado.",
      status: "disponivel",
      oficial: false,
      temas: ["relacional-vs-nosql-e-consistencia", "sql-para-dados", "modelagem-de-dados"],
    },
    {
      slug: "programacao",
      titulo: "Programação",
      resumo:
        "Python para dados sem armadilha de tipo, nulo e grão; Git e revisão de código; testes e reprodutibilidade. SQL e JSON vivem nos módulos de banco de dados e Big Data desta mesma trilha.",
      status: "disponivel",
      oficial: false,
      temas: ["python-para-analytics", "git-e-revisao-de-codigo", "testes-e-reprodutibilidade"],
    },
    {
      slug: "devops",
      titulo: "DevOps",
      resumo:
        "CI/CD para transformações e dashboards, ambientes reproduzíveis com infraestrutura como código, orquestração e observabilidade do pipeline.",
      status: "disponivel",
      oficial: false,
      temas: [
        "cicd-para-dados-e-dashboards",
        "ambientes-e-infraestrutura-como-codigo",
        "orquestracao",
        "dataops-e-observabilidade",
      ],
    },
    {
      slug: "dataviz",
      titulo: "Dataviz",
      resumo:
        "Percepção visual e escolha do gráfico pela pergunta, narrativa que transforma achado em decisão, e painéis que alguém de fato usa — com carimbo de atualização, controle de acesso e medição de uso.",
      status: "disponivel",
      oficial: false,
      temas: [
        "percepcao-e-escolha-do-grafico",
        "storytelling-com-dados",
        "dashboards-e-indicadores",
      ],
    },
    {
      slug: "data-mesh",
      titulo: "Data Mesh",
      resumo:
        "Os quatro princípios, o dado tratado como produto, contratos entre domínios, plataforma self-serve e governança federada, e quando Mesh é má ideia.",
      status: "disponivel",
      oficial: false,
      temas: [
        "principios-do-data-mesh",
        "contratos-de-dados-e-plataforma",
        "arquiteturas-de-dados",
      ],
    },
    {
      slug: "alem-da-ementa",
      titulo: "Além da ementa",
      resumo:
        "O núcleo de Analytics Engineering que a ementa não cobre: dbt, camada semântica e definição de métricas, estatística que impede conclusão errada, privacidade em dashboards e como responder na sabatina.",
      status: "disponivel",
      oficial: false,
      temas: [
        "dbt-e-transformacao-versionada",
        "camada-semantica-e-metricas",
        "estatistica-para-analytics",
        "seguranca-e-privacidade",
        "como-responder-na-sabatina",
      ],
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
      titulo: "Revisão e checkpoint do módulo Big Data",
      temas: [],
      revisao: ["big-data"],
      nota: "Cards vencidos, a folha de revisão e o checkpoint do módulo. Abaixo de 70%, releia o tema apontado.",
    },
    {
      dia: 9,
      titulo: "A pilha analítica na AWS",
      temas: ["aws-para-dados"],
      revisao: ["big-data"],
      nota: "Tema compartilhado com a trilha de Dados: se você já o concluiu lá, ele já conta aqui. Use o dia para os cards e o drill.",
    },
    {
      dia: 10,
      titulo: "Redshift e a camada de consumo",
      temas: ["redshift-e-consumo-analitico"],
      revisao: ["big-data"],
    },
    {
      dia: 11,
      titulo: "Relacional, NoSQL e consistência",
      temas: ["relacional-vs-nosql-e-consistencia"],
      revisao: ["aws"],
    },
    {
      dia: 12,
      titulo: "SQL que a banca cobra",
      temas: ["sql-para-dados"],
      revisao: ["aws"],
      nota: "Também compartilhado com a trilha de Dados. Aqui o foco é a consulta que sustenta um indicador, não o pipeline.",
    },
    {
      dia: 13,
      titulo: "Modelagem dimensional",
      temas: ["modelagem-de-dados"],
      revisao: ["banco-de-dados"],
    },
    {
      dia: 14,
      titulo: "Revisão e checkpoints",
      temas: [],
      revisao: ["big-data", "aws", "banco-de-dados"],
      nota: "Cards vencidos, folhas de revisão e os checkpoints de AWS e banco de dados.",
    },
    {
      dia: 15,
      titulo: "CI/CD para dados e dashboards",
      temas: ["cicd-para-dados-e-dashboards"],
      revisao: ["banco-de-dados"],
    },
    {
      dia: 16,
      titulo: "Ambientes e infraestrutura como código",
      temas: ["ambientes-e-infraestrutura-como-codigo"],
      revisao: ["banco-de-dados"],
    },
    {
      dia: 17,
      titulo: "Orquestração",
      temas: ["orquestracao"],
      revisao: ["devops"],
      nota: "Tema compartilhado com a trilha de Dados: se já o concluiu lá, conta aqui.",
    },
    {
      dia: 18,
      titulo: "Observabilidade do pipeline",
      temas: ["dataops-e-observabilidade"],
      revisao: ["devops"],
      nota: "Também compartilhado. Aqui a pergunta é como você descobre que o número do painel está errado antes do negócio descobrir.",
    },
    {
      dia: 19,
      titulo: "Data Mesh: os quatro princípios",
      temas: ["principios-do-data-mesh"],
      revisao: ["devops"],
    },
    {
      dia: 20,
      titulo: "Contratos de dados e plataforma",
      temas: ["contratos-de-dados-e-plataforma"],
      revisao: ["data-mesh"],
    },
    {
      dia: 21,
      titulo: "Arquiteturas de dados",
      temas: ["arquiteturas-de-dados"],
      revisao: ["data-mesh"],
      nota: "Compartilhado com Dados, e fecha o módulo: Mesh comparado a lake centralizado, Lambda e Kappa.",
    },
    {
      dia: 22,
      titulo: "Revisão e checkpoints",
      temas: [],
      revisao: ["devops", "data-mesh"],
      nota: "Cards vencidos, folhas de revisão e os checkpoints de DevOps e Data Mesh.",
    },
    {
      dia: 23,
      titulo: "Python para analytics",
      temas: ["python-para-analytics"],
      revisao: ["data-mesh"],
      nota: "Os três lugares onde o número sai errado em silêncio: tipo, nulo e grão.",
    },
    {
      dia: 24,
      titulo: "Git e revisão de código",
      temas: ["git-e-revisao-de-codigo"],
      revisao: ["programacao"],
    },
    {
      dia: 25,
      titulo: "Testes e reprodutibilidade",
      temas: ["testes-e-reprodutibilidade"],
      revisao: ["programacao"],
    },
    {
      dia: 26,
      titulo: "Revisão e checkpoint de Programação",
      temas: [],
      revisao: ["programacao", "devops"],
      nota: "Cards vencidos, folha de revisão e checkpoint do módulo.",
    },
    {
      dia: 27,
      titulo: "Percepção e escolha do gráfico",
      temas: ["percepcao-e-escolha-do-grafico"],
      revisao: ["programacao"],
      nota: "A escolha do visual se justifica por como a percepção funciona, não por gosto. É a resposta que a banca espera.",
    },
    {
      dia: 28,
      titulo: "Storytelling com dados",
      temas: ["storytelling-com-dados"],
      revisao: ["dataviz"],
    },
    {
      dia: 29,
      titulo: "Dashboards e indicadores",
      temas: ["dashboards-e-indicadores"],
      revisao: ["dataviz"],
    },
    {
      dia: 30,
      titulo: "Revisão e checkpoint de Dataviz",
      temas: [],
      revisao: ["dataviz", "programacao"],
      nota: "Cards vencidos, folha de revisão e checkpoint do módulo.",
    },
    {
      dia: 31,
      titulo: "dbt: transformação versionada",
      temas: ["dbt-e-transformacao-versionada"],
      revisao: ["dataviz"],
    },
    {
      dia: 32,
      titulo: "Camada semântica e métricas",
      temas: ["camada-semantica-e-metricas"],
      revisao: ["alem-da-ementa"],
      nota: "Este tema fecha o arco que começou em Source of Record e Source of Truth: é onde a regra de precedência vira executável.",
    },
    {
      dia: 33,
      titulo: "Estatística para analytics",
      temas: ["estatistica-para-analytics"],
      revisao: ["alem-da-ementa"],
    },
    {
      dia: 34,
      titulo: "Privacidade e dado sensível",
      temas: ["seguranca-e-privacidade"],
      revisao: ["alem-da-ementa"],
      nota: "Tema compartilhado com a trilha de Dados. Aqui a pergunta é o que pode aparecer num painel e para quem.",
    },
    {
      dia: 35,
      titulo: "Como responder na sabatina",
      temas: ["como-responder-na-sabatina"],
      revisao: ["alem-da-ementa"],
      nota: "Também compartilhado, e é o último tema de conteúdo. Depois dele, só treino.",
    },
    {
      dia: 36,
      titulo: "Simulado completo",
      temas: [],
      revisao: [
        "big-data",
        "aws",
        "banco-de-dados",
        "devops",
        "data-mesh",
        "programacao",
        "dataviz",
        "alem-da-ementa",
      ],
      nota: "Sabatina simulada com perguntas de todos os módulos. Grave as respostas e avalie pela rubrica, sem consultar nada.",
    },
    {
      dia: 37,
      titulo: "Atacar os módulos fracos",
      temas: [],
      revisao: ["big-data", "alem-da-ementa"],
      nota: "Olhe a prontidão por módulo e releia só os dois mais fracos. Refaça os drills deles.",
    },
    {
      dia: 38,
      titulo: "Véspera",
      temas: [],
      revisao: ["alem-da-ementa"],
      nota: "Releia como responder na sabatina, passe os cards vencidos e pare. Não estude conteúdo novo na véspera.",
    },
  ],
};

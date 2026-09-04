import { z } from "zod";

/* ---------------------------------------------------------------------------
   Modelo de conteúdo da Lumarys.

   Tema é a unidade de estudo e é ÚNICO por slug: o mesmo tema pode aparecer em
   mais de uma trilha (Big Data cai em Engenharia de Dados e em Engenharia de
   Analytics). Trilha só referencia temas por slug, nunca duplica conteúdo.
--------------------------------------------------------------------------- */

const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug deve ser kebab-case sem acentos");

export const videoSchema = z.object({
  /** ID do vídeo no YouTube, validado por oEmbed em scripts/verify-videos.mjs */
  id: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "id do YouTube tem 11 caracteres"),
  titulo: z.string().min(3),
  canal: z.string().min(2),
  /** Duração em minutos, arredondada. */
  duracao: z.number().int().positive().max(240),
  /** Por que este vídeo foi escolhido — aparece abaixo do player. */
  porQue: z.string().min(10),
  /**
   * Data de publicação no YouTube (AAAA-MM-DD), impressa por
   * scripts/video-info.mjs. O VideoObject do JSON-LD exige uploadDate; sem ele
   * o Rich Results Test aponta erro no tema inteiro.
   */
  publicadoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "publicadoEm no formato AAAA-MM-DD"),
  idioma: z.literal("pt-BR").default("pt-BR"),
});

export const artigoSchema = z.object({
  titulo: z.string().min(3),
  url: z.string().url(),
  fonte: z.string().min(2),
});

export const alternativaSchema = z.object({
  texto: z.string().min(1),
  correta: z.boolean(),
  /** Por que esta alternativa está certa ou errada. */
  explicacao: z.string().min(5),
});

export const preTesteSchema = z.object({
  enunciado: z.string().min(10),
  alternativas: z.array(alternativaSchema).min(2).max(5),
});

export const flashcardSchema = z.object({
  frente: z.string().min(3),
  verso: z.string().min(3),
});

export const drillItemSchema = z.object({
  enunciado: z.string().min(3),
  resposta: z.string().min(1),
  explicacao: z.string().min(5).optional(),
});

export const drillSchema = z.object({
  titulo: z.string().min(3),
  instrucao: z.string().min(10),
  /** Alternativas de classificação, quando o drill é de classificar. */
  opcoes: z.array(z.string()).optional(),
  itens: z.array(drillItemSchema).min(3),
});

export const perguntaSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("oral"),
    enunciado: z.string().min(10),
    respostaModelo: z.string().min(40),
    /** Critérios verificáveis — viram a rubrica 0 a 5 do simulado. */
    rubrica: z.array(z.string().min(5)).min(2).max(6),
  }),
  z.object({
    tipo: z.literal("unica"),
    enunciado: z.string().min(10),
    alternativas: z.array(alternativaSchema).min(3).max(5),
  }),
  z.object({
    tipo: z.literal("multipla"),
    enunciado: z.string().min(10),
    alternativas: z.array(alternativaSchema).min(4).max(6),
  }),
]);

export const temaFrontmatterSchema = z.object({
  slug: slugSchema,
  titulo: z.string().min(3),
  /** Uma frase que responde "o que é isso", para SEO e para agentes de IA. */
  resumo: z.string().min(40).max(320),
  minutos: z.number().int().positive().max(120),
  nivel: z.enum(["fundamental", "intermediario", "avancado"]),
  /** Metaaprendizado: por que este tema cai na prova. */
  porQue: z.string().min(20),
  /** Como o entrevistador costuma perguntar (uma frase entre aspas). */
  comoCai: z.string().min(10),
  /** Desafio Feynman: explique em 1 minuto para alguém de negócio. */
  feynman: z.string().min(20),
  errosComuns: z.array(z.string().min(10)).min(2).max(8),
  preTeste: z.array(preTesteSchema).min(1).max(3),
  videos: z.array(videoSchema).min(1).max(2),
  artigos: z.array(artigoSchema).min(1).max(5),
  flashcards: z.array(flashcardSchema).min(8).max(14),
  drills: z.array(drillSchema).min(1).max(2),
  perguntas: z.array(perguntaSchema).min(3).max(10),
  /** Temas que convém estudar antes deste. */
  preRequisitos: z.array(slugSchema).default([]),
});

export type TemaFrontmatter = z.infer<typeof temaFrontmatterSchema>;
export type Video = z.infer<typeof videoSchema>;
export type Artigo = z.infer<typeof artigoSchema>;
export type Flashcard = z.infer<typeof flashcardSchema>;
export type Drill = z.infer<typeof drillSchema>;
export type Pergunta = z.infer<typeof perguntaSchema>;
export type PerguntaOral = Extract<Pergunta, { tipo: "oral" }>;
export type PreTeste = z.infer<typeof preTesteSchema>;

export type Tema = TemaFrontmatter & {
  /**
   * Corpo MDX cru. Serve ao llms-full.txt e à versão Markdown de cada tema; a
   * PÁGINA não usa isto — ela renderiza o módulo compilado no build
   * (content/temas/corpos.generated.ts).
   */
  corpo: string;
};

/* --------------------------------- Trilha -------------------------------- */

export type StatusModulo = "disponivel" | "em-breve";

export type Modulo = {
  slug: string;
  titulo: string;
  resumo: string;
  status: StatusModulo;
  /** false para o módulo "Além da ementa" e outros que não vêm da ementa oficial. */
  oficial: boolean;
  temas: string[];
  /** Domínio do exame, para trilhas de certificação. */
  dominioExame?: string;
  pesoExame?: number;
};

export type DiaPlano = {
  dia: number;
  titulo: string;
  temas: string[];
  /** Slugs de módulos a revisar neste dia (repetição espaçada). */
  revisao?: string[];
  nota?: string;
};

export type Exame = {
  codigo: string;
  minutos: number;
  questoes: number;
  notaCorte: number;
  precoUSD: number;
};

export type Trilha = {
  slug: string;
  tipo: "carreira" | "certificacao";
  titulo: string;
  /** Quem publica a ementa: "Itaú · Hub de Dados e Analytics", "AWS". */
  origem: string;
  objetivo: string;
  resumo: string;
  formatoProva: string;
  prazoSugeridoDias: number;
  status: "disponivel" | "em-breve";
  modulos: Modulo[];
  cronograma: DiaPlano[];
  exame?: Exame;
};

import type { Trilha } from "../types";
import { engenhariaDeDados } from "./engenharia-de-dados";

/** Todas as trilhas do catálogo, na ordem em que aparecem na landing. */
export const trilhas: Trilha[] = [engenhariaDeDados];

export const trilhasPorSlug = new Map(trilhas.map((t) => [t.slug, t]));

/** Trilhas anunciadas no catálogo mas ainda sem conteúdo. */
export const trilhasEmBreve = [
  {
    slug: "engenharia-de-analytics",
    titulo: "Engenharia de Analytics",
    origem: "Itaú · Hub de Dados e Analytics",
    resumo: "Big Data, AWS, banco de dados, programação, DevOps, dataviz e Data Mesh.",
  },
  {
    slug: "aws-cloud-practitioner",
    titulo: "AWS Cloud Practitioner",
    origem: "AWS · CLF-C02",
    resumo: "Conceitos de nuvem, segurança, serviços e cobrança, no peso de cada domínio da prova.",
  },
  {
    slug: "aws-solutions-architect-associate",
    titulo: "AWS Solutions Architect Associate",
    origem: "AWS · SAA-C03",
    resumo: "Arquiteturas seguras, resilientes, de alto desempenho e otimizadas em custo.",
  },
] as const;

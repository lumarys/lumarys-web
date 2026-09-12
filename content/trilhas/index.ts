import type { Trilha } from "../types";
import { awsSolutionsArchitectAssociate } from "./aws-solutions-architect-associate";
import { engenhariaDeAnalytics } from "./engenharia-de-analytics";
import { engenhariaDeDados } from "./engenharia-de-dados";

/**
 * Todas as trilhas do catálogo, na ordem em que aparecem na landing.
 *
 * A ordem também decide a URL canônica de um tema compartilhado: a primeira
 * trilha que o contém é a que o buscador indexa. Dados vem antes de Analytics
 * porque foi onde os temas nasceram.
 */
export const trilhas: Trilha[] = [
  engenhariaDeDados,
  engenhariaDeAnalytics,
  awsSolutionsArchitectAssociate,
];

export const trilhasPorSlug = new Map(trilhas.map((t) => [t.slug, t]));

/** Trilhas anunciadas no catálogo mas ainda sem conteúdo. */
export const trilhasEmBreve = [
  {
    slug: "aws-cloud-practitioner",
    titulo: "AWS Cloud Practitioner",
    origem: "AWS · CLF-C02",
    resumo: "Conceitos de nuvem, segurança, serviços e cobrança, no peso de cada domínio da prova.",
  },
] as const;

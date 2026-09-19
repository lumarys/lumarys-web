import type { Trilha } from "../types";
import { awsCloudPractitioner } from "./aws-cloud-practitioner";
import { awsSolutionsArchitectAssociate } from "./aws-solutions-architect-associate";
import { engenhariaDeAnalytics } from "./engenharia-de-analytics";
import { engenhariaDeDados } from "./engenharia-de-dados";

/**
 * Todas as trilhas do catálogo, na ordem em que aparecem na landing.
 *
 * A ordem também decide a URL canônica de um tema compartilhado: a primeira
 * trilha que o contém é a que o buscador indexa. Dados vem antes de Analytics
 * porque foi onde os temas nasceram. Cloud Practitioner vem antes da SAA
 * porque é a fundacional e é por onde se começa; a ordem não disputa canônica
 * com ela, porque as duas trilhas de AWS não compartilham tema nenhum.
 */
export const trilhas: Trilha[] = [
  engenhariaDeDados,
  engenhariaDeAnalytics,
  awsCloudPractitioner,
  awsSolutionsArchitectAssociate,
];

export const trilhasPorSlug = new Map(trilhas.map((t) => [t.slug, t]));

export type TrilhaEmBreve = {
  slug: string;
  titulo: string;
  origem: string;
  resumo: string;
};

/**
 * Trilhas anunciadas no catálogo mas ainda sem conteúdo.
 *
 * Vazia desde que a Cloud Practitioner foi publicada. O export continua, com
 * tipo próprio em vez de `as const`, porque a próxima certificação entra aqui
 * antes de virar trilha; enquanto estiver vazia, a home e o catálogo omitem a
 * seção inteira em vez de mostrar um rótulo sem lista.
 */
export const trilhasEmBreve: readonly TrilhaEmBreve[] = [];

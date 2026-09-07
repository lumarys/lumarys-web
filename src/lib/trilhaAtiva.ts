import { trilhaIniciada, type Progresso } from "./storage";

/**
 * Qual trilha as telas de estudo (Hoje, Simulado) mostram.
 *
 * Com uma trilha só a pergunta não existia, e as páginas pegavam a primeira
 * do catálogo. Com duas, isso serviria o Hoje de Dados para quem estuda
 * Analytics. A regra: a que a pessoa pediu na URL, se for válida; senão a
 * última em que ela mexeu; senão a primeira do catálogo.
 */
export function trilhaAtiva(
  progresso: Progresso,
  candidatas: readonly string[],
  pedida?: string | null,
): string | undefined {
  if (pedida && candidatas.includes(pedida)) return pedida;

  let melhor: string | undefined;
  let quando = -1;
  for (const slug of candidatas) {
    const t = progresso.trilhas[slug];
    if (t && trilhaIniciada(t) && t.atualizadoEm > quando) {
      melhor = slug;
      quando = t.atualizadoEm;
    }
  }
  return melhor ?? candidatas[0];
}

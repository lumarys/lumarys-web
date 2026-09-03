"use client";

import { tokenValido } from "./auth";
import { gravar, ler, mesclar, progressoVazio, VERSAO, type Progresso, type ProgressoTrilha } from "./storage";
import type { EstadoCard } from "./srs";

/**
 * Sincronização do progresso. O dispositivo continua sendo a fonte imediata; a
 * API é uma cópia. Gravação é enfileirada com atraso para não disparar uma
 * chamada por card virado, e a mesclagem na volta nunca faz o progresso
 * regredir (ver storage.mesclar).
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const ESPERA_MS = 4000;

export const syncConfigurado = API.length > 0;

type ItemRemoto = { sk: string; [k: string]: unknown };

let temporizador: number | null = null;
let trilhasSujas = new Set<string>();

async function chamarApi(caminho: string, init: RequestInit = {}): Promise<Response | null> {
  const token = await tokenValido();
  if (!token) return null;

  return fetch(`${API}${caminho}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(20_000),
  });
}

/** Baixa o que está na conta e devolve no formato local. */
export async function baixar(): Promise<Progresso | null> {
  const resposta = await chamarApi("/me/progresso");
  if (!resposta?.ok) return null;

  const { itens } = (await resposta.json()) as { itens: ItemRemoto[] };
  const remoto: Progresso = progressoVazio();

  for (const item of itens) {
    const [tipo, slug] = item.sk.split("#");
    if (tipo === "trilha" && slug) {
      const { sk: _sk, ...dados } = item;
      remoto.trilhas[slug] = dados as unknown as ProgressoTrilha;
    } else if (tipo === "cards" && slug) {
      const cards = (item.cards ?? {}) as Record<string, EstadoCard>;
      Object.assign(remoto.cards, cards);
      if (typeof item.streakAtual === "number") {
        remoto.streak = {
          atual: item.streakAtual,
          recorde: Number(item.streakRecorde ?? item.streakAtual),
          ultimoDia: (item.streakUltimoDia as string | null) ?? null,
        };
      }
      Object.assign(remoto.minutosPorDia, (item.minutosPorDia ?? {}) as Record<string, number>);
    }
  }

  remoto.versao = VERSAO;
  return remoto;
}

/**
 * Primeira entrada na conta: junta o que foi estudado como convidado com o que
 * já estava na conta, grava dos dois lados e devolve o resultado.
 */
export async function entrarEMesclar(): Promise<Progresso> {
  const local = ler();
  const remoto = await baixar();
  if (!remoto) return local;

  const final = mesclar(local, remoto);
  gravar(final);
  await enviarTudo(final);
  return final;
}

/** Marca uma trilha como pendente de envio; envia em lote depois da pausa. */
export function agendarEnvio(trilhaSlug: string): void {
  if (!syncConfigurado) return;
  trilhasSujas.add(trilhaSlug);

  if (temporizador !== null) window.clearTimeout(temporizador);
  temporizador = window.setTimeout(() => {
    temporizador = null;
    const pendentes = [...trilhasSujas];
    trilhasSujas = new Set();
    void enviar(ler(), pendentes);
  }, ESPERA_MS);
}

async function enviar(progresso: Progresso, trilhas: string[]): Promise<void> {
  for (const slug of trilhas) {
    const trilha = progresso.trilhas[slug];
    if (!trilha) continue;

    await chamarApi(`/me/progresso/${slug}`, {
      method: "PUT",
      body: JSON.stringify(trilha),
    }).catch(() => null);

    // Cards e contadores globais viajam junto da trilha: são poucos bytes e
    // evitam um item órfão quando o aluno estuda só flashcards.
    await chamarApi(`/me/cards/${slug}`, {
      method: "PUT",
      body: JSON.stringify({
        cards: progresso.cards,
        minutosPorDia: progresso.minutosPorDia,
        streakAtual: progresso.streak.atual,
        streakRecorde: progresso.streak.recorde,
        streakUltimoDia: progresso.streak.ultimoDia,
      }),
    }).catch(() => null);
  }
}

async function enviarTudo(progresso: Progresso): Promise<void> {
  await enviar(progresso, Object.keys(progresso.trilhas));
}

export async function exportar(): Promise<Blob | null> {
  const resposta = await chamarApi("/me/exportar");
  if (!resposta?.ok) {
    // Sem conta, exporta o que existe no aparelho: o direito de portabilidade
    // não pode depender de ter criado conta.
    return new Blob([JSON.stringify({ local: ler() }, null, 2)], { type: "application/json" });
  }
  return new Blob([await resposta.text()], { type: "application/json" });
}

export async function excluirConta(): Promise<boolean> {
  const resposta = await chamarApi("/me", { method: "DELETE" });
  return Boolean(resposta?.ok);
}

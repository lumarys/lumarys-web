"use client";

import Link from "next/link";

import { Card, RotuloAcento } from "@/components/ui/Card";
import { BarraProgresso } from "@/components/ui/ProgressRing";
import { IconeCards, IconeDrill, IconeRelogio, IconeSeta } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { prontidaoDaTrilha } from "@/lib/readiness";
import { filaDoDia } from "@/lib/srs";
import { hojeISO } from "@/lib/srs";
import { diasAte } from "@/lib/utils";

export type TemaHoje = { slug: string; titulo: string; minutos: number; modulo: string; moduloTitulo: string };

export type DadosHoje = {
  trilhaSlug: string;
  trilhaTitulo: string;
  temas: TemaHoje[];
  modulos: { slug: string; titulo: string; temas: string[] }[];
};

/**
 * A tela Hoje resolve uma pergunta só: o que eu faço agora. Uma ação principal,
 * nunca um menu. Cards vencidos ganham da sequência da trilha porque revisão
 * atrasada é o que mais custa perto da prova.
 */
export function PainelHoje({ dados }: { dados: DadosHoje }) {
  const { progresso, pronto } = useProgresso();

  if (!pronto) {
    return <div className="mx-5 h-64 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  const trilha = progresso.trilhas[dados.trilhaSlug];
  const concluidos = trilha?.temasConcluidos ?? {};
  const vencidos = filaDoDia(Object.values(progresso.cards));
  const proximoTema = dados.temas.find((t) => !concluidos[t.slug]);
  const { geral, porModulo, pontoFraco } = prontidaoDaTrilha(
    dados.modulos,
    progresso,
    dados.trilhaSlug,
  );

  const minutosHoje = progresso.minutosPorDia[hojeISO()] ?? 0;
  const meta = trilha?.minutosPorDia ?? 30;
  const dias = trilha?.dataProva ? diasAte(trilha.dataProva) : null;
  const nomePontoFraco = dados.modulos.find((m) => m.slug === pontoFraco?.moduloSlug)?.titulo;

  // Cards vencidos vêm primeiro; sem eles, o próximo tema da sequência.
  const acaoCards = vencidos.length >= 8;

  return (
    <div className="flex flex-col gap-3.5 px-5 pb-8">
      <div className="grid grid-cols-3 gap-2.5">
        <Metrica rotulo="Sequência" valor={`${progresso.streak.atual}`} sufixo={progresso.streak.atual === 1 ? "dia" : "dias"} />
        <Metrica rotulo="Meta de hoje" valor={`${minutosHoje}`} sufixo={`/${meta} min`} />
        <Metrica
          rotulo={dias !== null ? "Prova em" : "Temas feitos"}
          valor={dias !== null ? `${Math.max(dias, 0)}` : `${Object.keys(concluidos).length}`}
          sufixo={dias !== null ? (dias === 1 ? "dia" : "dias") : `/${dados.temas.length}`}
        />
      </div>

      {acaoCards && vencidos.length > 0 ? (
        <AcaoPrincipal
          rotulo="Próxima ação"
          titulo={`${vencidos.length} cards vencidos`}
          descricao="A revisão atrasada rende mais que conteúdo novo. Leva poucos minutos."
          href="/cards/"
        />
      ) : proximoTema ? (
        <AcaoPrincipal
          rotulo="Próxima ação"
          titulo={proximoTema.titulo}
          descricao={`${proximoTema.moduloTitulo} · ${proximoTema.minutos} min · pré-teste, vídeo e cards.`}
          href={`/trilhas/${dados.trilhaSlug}/${proximoTema.modulo}/${proximoTema.slug}/`}
        />
      ) : (
        <AcaoPrincipal
          rotulo="Trilha completa"
          titulo="Hora de simular"
          descricao="Você concluiu todos os temas. O que falta agora é responder em voz alta."
          href={`/simulado/?trilha=${dados.trilhaSlug}`}
        />
      )}

      {!acaoCards && vencidos.length > 0 ? (
        <LinhaAcao
          href="/cards/"
          icone={<IconeCards size={20} />}
          titulo={`${vencidos.length} card${vencidos.length === 1 ? "" : "s"} vencido${vencidos.length === 1 ? "" : "s"}`}
          direita={`${Math.max(1, Math.round(vencidos.length * 0.5))} min`}
        />
      ) : null}

      {nomePontoFraco ? (
        <LinhaAcao
          href={`/simulado/?trilha=${dados.trilhaSlug}&modulo=${pontoFraco?.moduloSlug ?? ""}`}
          icone={<IconeDrill size={20} />}
          titulo={`Simulado rápido de ${nomePontoFraco}`}
          direita="8 min"
        />
      ) : null}

      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-semibold">Prontidão para a sabatina</p>
          <p className="font-display text-xl font-bold text-[var(--accent)]">{geral}%</p>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {porModulo
            .filter((m) => m.temasTotal > 0)
            .map((m) => {
              const titulo = dados.modulos.find((x) => x.slug === m.moduloSlug)?.titulo ?? m.moduloSlug;
              return (
                <div key={m.moduloSlug} className="flex items-center gap-2.5">
                  <span className="w-28 shrink-0 truncate text-xs text-[var(--text-2)]">{titulo}</span>
                  <BarraProgresso
                    valor={m.score}
                    cor={m.score >= 60 ? "var(--color-success)" : m.score >= 25 ? "var(--accent)" : "var(--color-danger)"}
                    className="flex-1"
                  />
                  <span className="w-7 shrink-0 text-right text-xs text-[var(--text-2)]">
                    {m.score}
                  </span>
                </div>
              );
            })}
        </div>
        {nomePontoFraco ? (
          <p className="mt-3 text-xs text-[var(--muted)]">
            Ponto fraco: {nomePontoFraco}. Os cards de hoje já priorizam esse módulo.
          </p>
        ) : (
          <p className="mt-3 text-xs text-[var(--muted)]">
            A prontidão sobe com quiz, cards e simulado — não só com temas marcados como
            concluídos.
          </p>
        )}
      </Card>

      <Link
        href={`/trilhas/${dados.trilhaSlug}/plano/`}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold no-underline"
      >
        <IconeRelogio size={16} /> Ver o plano completo
      </Link>
    </div>
  );
}

function Metrica({ rotulo, valor, sufixo }: { rotulo: string; valor: string; sufixo: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-[11px] font-semibold text-[var(--muted)]">{rotulo}</p>
      <p className="font-display mt-0.5 text-xl font-bold">
        {valor}
        <span className="ml-1 text-[13px] font-medium text-[var(--text-2)]">{sufixo}</span>
      </p>
    </div>
  );
}

function AcaoPrincipal({
  rotulo,
  titulo,
  descricao,
  href,
}: {
  rotulo: string;
  titulo: string;
  descricao: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--elevated)] to-[var(--surface)] p-4.5">
      <RotuloAcento>{rotulo}</RotuloAcento>
      <p className="font-display mt-2 text-xl font-semibold leading-snug">{titulo}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-2)]">{descricao}</p>
      <Link
        href={href}
        className="mt-3.5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] no-underline"
      >
        Começar <IconeSeta size={18} />
      </Link>
    </div>
  );
}

function LinhaAcao({
  href,
  icone,
  titulo,
  direita,
}: {
  href: string;
  icone: React.ReactNode;
  titulo: string;
  direita: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 no-underline"
    >
      <span className="flex items-center gap-2.5 text-sm font-medium text-[var(--text)]">
        <span className="text-[var(--text-2)]">{icone}</span>
        {titulo}
      </span>
      <span className="text-xs text-[var(--muted)]">{direita}</span>
    </Link>
  );
}

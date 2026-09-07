"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { IconeCheck } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { montarIcs, type EventoDeEstudo } from "@/lib/ics";
import { datasDoPlano, estadoDoPlano, ritmoDoPlano } from "@/lib/plano";
import { definirModo, definirPlano } from "@/lib/storage";
import { hojeISO, somarDias } from "@/lib/srs";
import { cx } from "@/lib/utils";

function formatarDiaMes(dataISO: string): string {
  if (!dataISO) return "";
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
}

export type DiaVisual = {
  dia: number;
  titulo: string;
  nota?: string;
  temas: { slug: string; titulo: string; minutos: number; href: string }[];
  revisao: string[];
};

/**
 * Onboarding em três toques (data da prova, minutos por dia) e o plano do
 * cronograma da trilha ancorado nessa data.
 */
export function Plano({
  trilhaSlug,
  prazoSugerido,
  dias,
  totalTemas,
}: {
  trilhaSlug: string;
  prazoSugerido: number;
  dias: DiaVisual[];
  totalTemas: number;
}) {
  const { progresso, pronto } = useProgresso();
  const trilha = progresso.trilhas[trilhaSlug];
  const [editando, setEditando] = useState(false);
  const [dataProva, setDataProva] = useState("");
  const [minutos, setMinutos] = useState<number | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  if (!pronto) {
    return <div className="mx-5 h-48 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  const estado = estadoDoPlano(trilha?.dataProva, dias.length);
  const emManutencao = trilha?.modo === "manutencao";
  const meta = trilha?.minutosPorDia ?? 30;
  const concluidos = trilha?.temasConcluidos ?? {};
  const diaAtual = estado.dia;

  function gerar(data: string, min: number) {
    definirPlano(trilhaSlug, data, min);
    setEditando(false);
    setConfirmado(true);
  }

  /* ----------------------------- formulário ----------------------------- */

  if (estado.situacao === "sem-plano" || editando) {
    // Editar parte do que já existe: errar a data e não ter como corrigir era
    // o defeito mais simples e mais irritante desta tela.
    const sugestao = trilha?.dataProva ?? somarDias(hojeISO(), prazoSugerido);
    const dataEscolhida = dataProva || sugestao;
    const minEscolhido = minutos ?? meta;

    return (
      <div className="flex flex-col gap-3.5 px-5">
        <Card destaque>
          <RotuloAcento>{editando ? "Ajustar o plano" : "Montar o plano"}</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            {editando
              ? "Mude a data ou o tempo por dia. O cronograma se reorganiza sozinho."
              : `Duas respostas e eu distribuo os ${dias.length} dias de estudo até a sua prova.`}
          </p>

          <label className="mt-4 block">
            <span className="text-[13px] font-semibold">Quando é a prova?</span>
            <input
              type="date"
              value={dataEscolhida}
              min={hojeISO()}
              onChange={(e) => setDataProva(e.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-[15px] text-[var(--text)]"
            />
          </label>

          <fieldset className="mt-4 border-0 p-0">
            <legend className="text-[13px] font-semibold">Quantos minutos por dia?</legend>
            <div className="mt-1.5 flex gap-2">
              {[20, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutos(m)}
                  className={cx(
                    "min-h-12 flex-1 rounded-xl text-sm font-semibold",
                    minEscolhido === m
                      ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                      : "bg-[var(--elevated)] text-[var(--text-2)]",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => gerar(dataEscolhida, minEscolhido)}
            className="mt-4 min-h-13 w-full rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]"
          >
            {editando ? "Salvar plano" : "Gerar plano"}
          </button>

          {editando ? (
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="mt-2 min-h-11 w-full text-[13px] text-[var(--muted)]"
            >
              Cancelar
            </button>
          ) : null}
        </Card>
      </div>
    );
  }

  /* --------------------------- cartão de estado -------------------------- */

  const minutosHoje = progresso.minutosPorDia[hojeISO()] ?? 0;
  const pedeHoje = dias[diaAtual - 1]?.temas.reduce((a, t) => a + t.minutos, 0) ?? 0;
  const ritmo = ritmoDoPlano(estado, Object.keys(concluidos).length, totalTemas);

  function baixarCalendario(dataProva: string, minutosPorDia: number) {
    const datas = datasDoPlano(dataProva, dias.length);
    const eventos: EventoDeEstudo[] = dias.flatMap((dia, i) => {
      const data = datas[i];
      if (!data || dia.temas.length === 0) return [];
      return [
        {
          data,
          // 19h é palpite, mas é palpite editável: o evento entra na agenda e
          // a pessoa arrasta. Sem horário nenhum, viraria um dia inteiro.
          hora: 19,
          minutos: Math.max(
            dia.temas.reduce((a, t) => a + t.minutos, 0),
            minutosPorDia,
          ),
          titulo: `Lumarys · dia ${dia.dia}: ${dia.titulo}`,
          descricao: dia.temas.map((t) => t.titulo).join("; "),
        },
      ];
    });

    const arquivo = new Blob([montarIcs(eventos, trilhaSlug)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(arquivo);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lumarys-plano.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3.5 px-5">
      {confirmado ? (
        <p className="rounded-xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 px-3.5 py-3 text-sm text-[var(--color-success)]">
          Plano salvo. A tela Hoje já está seguindo ele.
        </p>
      ) : null}

      <Card destaque>
        <div className="flex items-baseline justify-between gap-3">
          <RotuloAcento>{emManutencao ? "Manutenção" : "Seu plano"}</RotuloAcento>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="min-h-11 text-xs text-[var(--accent)] underline underline-offset-4"
          >
            Editar
          </button>
        </div>

        {estado.situacao === "vencido" && !emManutencao ? (
          <>
            <p className="mt-1 text-[15px] font-semibold">
              A prova foi há {Math.abs(estado.faltam)}{" "}
              {Math.abs(estado.faltam) === 1 ? "dia" : "dias"}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-2)]">
              Ou você tem uma prova nova pela frente, ou o objetivo agora é não esquecer o que
              estudou. As duas coisas têm plano.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => definirModo(trilhaSlug, "manutencao")}
                className="min-h-12 rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--accent-ink)]"
              >
                Manter na memória
              </button>
              <button
                type="button"
                onClick={() => setEditando(true)}
                className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold"
              >
                Marcar uma nova prova
              </button>
            </div>
          </>
        ) : emManutencao ? (
          <>
            <p className="mt-1 text-[15px] font-semibold">Cuidando do que você já sabe</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-2)]">
              Sem cronograma novo. Os cards que você acertou voltam em 30 e em 90 dias, que é o
              intervalo que sustenta memória de longo prazo.
            </p>
            <Link
              href="/cards/"
              className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--accent-ink)] no-underline"
            >
              Ver a revisão de hoje
            </Link>
          </>
        ) : estado.situacao === "prova-hoje" ? (
          <>
            <p className="mt-1 text-[15px] font-semibold">A prova é hoje</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-2)]">
              Só cards vencidos e leitura do que você já escreveu. Conteúdo novo na véspera não
              entra.
            </p>
          </>
        ) : estado.situacao === "aguardando" ? (
          <>
            <p className="mt-1 text-[15px] font-semibold">Faltam {estado.faltam} dias</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-2)]">
              O cronograma de {estado.total} dias começa em {formatarDiaMes(estado.comecaEm ?? "")}.
              Até lá, estude na ordem que quiser: o plano existe para a reta final.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-[15px] font-semibold">
              Dia {estado.dia} de {estado.total} · faltam {estado.faltam}{" "}
              {estado.faltam === 1 ? "dia" : "dias"}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-2)]">
              {ritmo.atraso > 0
                ? `Atrasado ${ritmo.atraso} ${ritmo.atraso === 1 ? "tema" : "temas"}: o cronograma esperava ${ritmo.esperado} a esta altura.`
                : "No ritmo do plano."}{" "}
              Hoje pede {pedeHoje || meta} min e você fez {minutosHoje} de {meta}.
            </p>
            <a
              href={`#dia-${estado.dia}`}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] no-underline"
            >
              Ir para o dia de hoje
            </a>
          </>
        )}
      </Card>

      {/* O plano vivia só dentro do site: fechada a aba, era preciso lembrar
          sozinho de estudar. Um .ics põe os dias na agenda que a pessoa já
          olha, sem conta, sem permissão de notificação e sem servidor. */}
      {trilha?.dataProva && !emManutencao ? (
        <button
          type="button"
          onClick={() => baixarCalendario(trilha.dataProva!, meta)}
          className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold"
        >
          Pôr o plano na minha agenda
        </button>
      ) : null}

      <Rotulo>Cronograma</Rotulo>
      <ol className="flex list-none flex-col gap-2 p-0">
        {dias.map((dia) => {
          const passado = dia.dia < diaAtual;
          const hoje = dia.dia === diaAtual;
          const todosFeitos = dia.temas.length > 0 && dia.temas.every((t) => concluidos[t.slug]);

          return (
            <li key={dia.dia} id={`dia-${dia.dia}`} className="scroll-mt-4">
              <details
                open={hoje}
                className={cx(
                  "rounded-2xl border bg-[var(--surface)]",
                  hoje ? "border-[var(--accent)] bg-[var(--elevated)]" : "border-[var(--border)]",
                )}
              >
                <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      className={cx(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        todosFeitos
                          ? "bg-[var(--color-success)] text-[var(--bg)]"
                          : hoje
                            ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                            : passado
                              ? "bg-[var(--elevated)] text-[var(--muted)]"
                              : "border border-[var(--border)] text-[var(--text-2)]",
                      )}
                    >
                      {todosFeitos ? <IconeCheck size={14} /> : dia.dia}
                    </span>
                    <span
                      className={cx(
                        "text-sm",
                        hoje ? "font-semibold" : "font-medium text-[var(--text-2)]",
                      )}
                    >
                      {dia.titulo}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[var(--muted)]">
                    {dia.temas.reduce((a, t) => a + t.minutos, 0) || "—"}
                    {dia.temas.length ? " min" : ""}
                  </span>
                </summary>

                <div className="flex flex-col gap-1 px-4 pb-3">
                  {dia.temas.map((tema) => (
                    <Link
                      key={tema.slug}
                      href={tema.href}
                      className="flex min-h-11 items-center justify-between gap-3 border-t border-[var(--border)] py-2 text-sm no-underline"
                    >
                      <span
                        className={cx(
                          concluidos[tema.slug]
                            ? "text-[var(--muted)] line-through"
                            : "text-[var(--text)]",
                        )}
                      >
                        {tema.titulo}
                      </span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {tema.minutos} min
                      </span>
                    </Link>
                  ))}
                  {dia.revisao.length > 0 ? (
                    <p className="border-t border-[var(--border)] pt-2 text-xs text-[var(--text-2)]">
                      Revisar: {dia.revisao.join(", ")}
                    </p>
                  ) : null}
                  {dia.nota ? (
                    <p className="mt-1 rounded-lg bg-[var(--bg)] px-3 py-2 text-xs leading-relaxed text-[var(--text-2)]">
                      {dia.nota}
                    </p>
                  ) : null}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

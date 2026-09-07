"use client";

import { Card, Rotulo } from "@/components/ui/Card";
import { Recolhivel } from "@/components/ui/Recolhivel";
import { useProgresso } from "@/features/progresso/useProgresso";
import { historico, melhorPorModulo, tendencia, type Registro } from "@/lib/historicoSimulados";
import { cx, formatarData } from "@/lib/utils";

/**
 * O que os últimos ensaios disseram. O progresso guardava vinte simulados
 * desde sempre e nenhuma tela mostrava um: a pessoa terminava, via a nota e
 * ela sumia — sem saber se tinha melhorado desde a semana passada.
 */
export function HistoricoSimulados({
  trilhaSlug,
  titulosDeModulo,
}: {
  trilhaSlug: string;
  titulosDeModulo: Record<string, string>;
}) {
  const { progresso, pronto } = useProgresso();
  if (!pronto) return null;

  const registros = historico(progresso.trilhas[trilhaSlug]?.simulados ?? []);
  if (registros.length === 0) return null;

  const [ultimo] = registros;
  if (!ultimo) return null;
  const curva = tendencia(registros);
  const melhor = melhorPorModulo(registros);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Rotulo>Seus simulados</Rotulo>
        {curva ? <Tendencia curva={curva} /> : null}
      </div>

      <p className="font-display mt-2 text-3xl font-bold">
        {ultimo.percentual}%
        <span className="ml-2 text-sm font-normal text-[var(--text-2)]">
          no último, em {formatarData(ultimo.em)}
        </span>
      </p>
      {ultimo.variacao !== null ? (
        <p className="mt-1 text-[13px] text-[var(--text-2)]">
          {ultimo.variacao === 0
            ? "Mesma nota do anterior."
            : `${sinal(ultimo.variacao)} ponto${Math.abs(ultimo.variacao) === 1 ? "" : "s"} em relação ao anterior.`}
        </p>
      ) : (
        <p className="mt-1 text-[13px] text-[var(--text-2)]">
          Primeiro simulado. O próximo já mostra se subiu.
        </p>
      )}

      <Recolhivel
        titulo="Todos os simulados"
        nota={`${registros.length}`}
        className="mt-3.5 border-0 bg-transparent"
      >
        <ul className="flex list-none flex-col gap-3 p-0">
          {registros.map((registro) => (
            <li key={registro.em}>
              <Linha registro={registro} titulos={titulosDeModulo} melhor={melhor} />
            </li>
          ))}
        </ul>
      </Recolhivel>
    </Card>
  );
}

function sinal(variacao: number): string {
  return variacao > 0 ? `+${variacao}` : String(variacao);
}

function Tendencia({ curva }: { curva: "subindo" | "descendo" | "estavel" }) {
  const rotulo = { subindo: "Subindo", descendo: "Caindo", estavel: "Estável" }[curva];
  const cor = {
    subindo: "text-[var(--color-success)]",
    descendo: "text-[var(--color-danger)]",
    estavel: "text-[var(--text-2)]",
  }[curva];
  const seta = { subindo: "M7 14l5-5 5 5", descendo: "M7 10l5 5 5-5", estavel: "M6 12h12" }[curva];

  return (
    <span className={cx("flex items-center gap-1 text-xs font-semibold", cor)}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={seta} />
      </svg>
      {rotulo}
      <span className="sr-only"> nos últimos três simulados</span>
    </span>
  );
}

function Linha({
  registro,
  titulos,
  melhor,
}: {
  registro: Registro;
  titulos: Record<string, string>;
  melhor: Record<string, { percentual: number; em: number }>;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-[var(--text-2)]">{formatarData(registro.em)}</span>
        <span className="font-display font-bold tabular-nums">
          {registro.percentual}%
          <span className="ml-1.5 text-[11px] font-normal text-[var(--muted)]">
            {registro.nota}/{registro.maximo}
          </span>
        </span>
      </div>
      <ul className="mt-1.5 flex list-none flex-col gap-1 p-0">
        {registro.porModulo.map((m) => (
          <li key={m.slug} className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="min-w-0 truncate text-[var(--muted)]">
              {titulos[m.slug] ?? m.slug}
            </span>
            <span className="shrink-0 tabular-nums text-[var(--text-2)]">
              {m.percentual}%
              {melhor[m.slug]?.em === registro.em ? (
                <span className="ml-1 text-[var(--accent)]">melhor</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

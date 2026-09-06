"use client";

import { useEffect, useRef, useState } from "react";

import { cx } from "@/lib/utils";

/**
 * Sumário do tema: onde estou e para onde pular.
 *
 * A página do tema tinha 23 mil pixels de altura no celular e treze blocos em
 * ordem fixa, sem nenhuma forma de saber a posição nem de saltar. Ler no
 * ônibus significava rolar às cegas. Esta barra resolve as duas coisas com o
 * mesmo elemento: os chips levam a cada etapa, e a linha fina no topo mostra
 * quanto da página já passou.
 */

export type SecaoTema = { id: string; rotulo: string };

export function SumarioTema({ secoes }: { secoes: SecaoTema[] }) {
  const [ativa, setAtiva] = useState<string | null>(secoes[0]?.id ?? null);
  const [lido, setLido] = useState(0);
  const faixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvos = secoes
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (alvos.length === 0) return;

    // A margem inferior negativa faz "ativa" ser a seção que está no topo da
    // tela, não a que ocupa mais área: é o que corresponde a onde a pessoa lê.
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setAtiva(visivel.target.id);
      },
      { rootMargin: "-56px 0px -70% 0px", threshold: 0 },
    );

    for (const alvo of alvos) observador.observe(alvo);
    return () => observador.disconnect();
  }, [secoes]);

  useEffect(() => {
    function aoRolar() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setLido(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // O chip ativo acompanha a leitura movendo só a faixa. `scrollIntoView` era
  // o caminho óbvio e estava errado: ele rola a página junto, e como rolar
  // muda a seção ativa, a página não parava quieta enquanto se lia.
  useEffect(() => {
    const strip = faixa.current;
    if (!ativa || !strip) return;
    const chip = strip.querySelector<HTMLElement>(`[data-secao="${ativa}"]`);
    if (!chip) return;
    const alvo = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, alvo), behavior: "smooth" });
  }, [ativa]);

  if (secoes.length < 2) return null;

  return (
    <div
      data-casca="sumario"
      className="sticky top-0 z-20 -mx-5 border-b border-[var(--border)]/70 bg-[var(--bg)]/95 backdrop-blur-md"
    >
      <div
        className="h-0.5 bg-[var(--accent)] transition-[width] duration-150"
        style={{ width: `${lido}%` }}
        aria-hidden="true"
      />
      <nav aria-label="Seções do tema">
        <div ref={faixa} className="flex gap-1.5 overflow-x-auto px-5 py-2 [scrollbar-width:none]">
          {secoes.map((secao) => (
            <a
              key={secao.id}
              href={`#${secao.id}`}
              data-secao={secao.id}
              aria-current={ativa === secao.id ? "true" : undefined}
              className={cx(
                "flex min-h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold no-underline transition-colors",
                ativa === secao.id
                  ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "bg-[var(--elevated)] text-[var(--text-2)]",
              )}
            >
              {secao.rotulo}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

/** Volta ao topo depois de uma tela de rolagem. Fica acima da barra de abas. */
export function VoltarAoTopo() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    function aoRolar() {
      setVisivel(window.scrollY > window.innerHeight);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  if (!visivel) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      data-casca="topo"
      className="fixed bottom-24 right-4 z-30 flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] shadow-lg"
      aria-label="Voltar ao topo da página"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

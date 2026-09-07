"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Rotulo } from "@/components/ui/Card";
import { IconeConta } from "@/components/ui/icons";
import { SeletorDeTrilha } from "@/components/ui/SeletorDeTrilha";
import { useProgresso } from "@/features/progresso/useProgresso";
import { trilhaAtiva } from "@/lib/trilhaAtiva";

import { PainelHoje, type DadosHoje } from "./PainelHoje";

/**
 * Decide de qual trilha é o Hoje. A página recebe os dados de todas e a
 * escolha acontece aqui, no cliente, porque depende do progresso: a última
 * trilha em que a pessoa mexeu, ou a pedida na URL.
 *
 * Antes a página pegava a primeira do catálogo. Com uma trilha só dava na
 * mesma; com duas, quem estuda Analytics veria o Hoje de Dados.
 */
export function HojeAtivo({ trilhas }: { trilhas: DadosHoje[] }) {
  const params = useSearchParams();
  const { progresso } = useProgresso();

  const slug = trilhaAtiva(
    progresso,
    trilhas.map((t) => t.trilhaSlug),
    params.get("trilha"),
  );
  const dados = trilhas.find((t) => t.trilhaSlug === slug) ?? trilhas[0];
  if (!dados) return null;

  return (
    <>
      <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <Rotulo>Hoje</Rotulo>
          <h1 className="font-display mt-1 text-[22px] font-semibold">{dados.trilhaTitulo}</h1>
        </div>
        <Link
          href="/conta/"
          aria-label="Minha conta"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--elevated)] text-[var(--text-2)] no-underline"
        >
          <IconeConta size={22} />
        </Link>
      </header>
      <SeletorDeTrilha
        base="/hoje/"
        trilhas={trilhas.map((t) => ({ slug: t.trilhaSlug, titulo: t.trilhaTitulo }))}
        ativa={dados.trilhaSlug}
        className="px-5 pb-3"
      />
      {/* A key reinicia o painel ao trocar de trilha: sem ela, memos e estado
          de uma trilha vazariam para a outra. */}
      <PainelHoje key={dados.trilhaSlug} dados={dados} />
    </>
  );
}

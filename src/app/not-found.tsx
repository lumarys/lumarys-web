import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Card, Rotulo } from "@/components/ui/Card";
import { listarTrilhas } from "@/lib/content";

export const metadata = { title: "Página não encontrada" };

export default function NaoEncontrada() {
  const trilhas = listarTrilhas();

  return (
    <AppShell comAbas={false} comCabecalho>
      <div className="px-5 pb-8 pt-12">
        <Rotulo>Erro 404</Rotulo>
        <h1 className="font-display mt-1.5 text-[26px] font-bold">Esta página não existe</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--text-2)]">
          O endereço pode ter mudado ou o conteúdo ainda não foi publicado.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/hoje/"
            className="flex min-h-13 items-center justify-center rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] no-underline"
          >
            Ir para o que estudar hoje
          </Link>
          {trilhas.map((t) => (
            <Link key={t.slug} href={`/trilhas/${t.slug}/`} className="no-underline">
              <Card>
                <p className="text-sm font-semibold text-[var(--text)]">{t.titulo}</p>
                <p className="mt-0.5 text-[13px] text-[var(--text-2)]">{t.origem}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

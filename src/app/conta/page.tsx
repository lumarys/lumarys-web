import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { Conta } from "@/features/conta/Conta";

export const metadata: Metadata = {
  title: "Minha conta",
  description: "Salve seu progresso para continuar de onde parou em qualquer aparelho.",
  alternates: { canonical: "/conta/" },
  robots: { index: false, follow: true },
};

export default function PaginaConta() {
  return (
    <AppShell comRodape={false}>
      <header className="px-5 pb-4 pt-5">
        <Rotulo>Conta</Rotulo>
        <h1 className="font-display mt-1 text-[22px] font-semibold">Seu progresso</h1>
      </header>
      <Conta />
      <p className="px-5 pb-8 pt-5 text-[13px] leading-relaxed text-[var(--muted)]">
        Como tratamos seus dados está na{" "}
        <Link href="/privacidade/">política de privacidade</Link>.
      </p>
    </AppShell>
  );
}

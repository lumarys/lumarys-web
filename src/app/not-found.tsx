import { AppShell } from "@/components/layout/AppShell";
import { BotaoLink } from "@/components/ui/Botao";
import { Rotulo } from "@/components/ui/Card";
import { listarTrilhas } from "@/lib/content";

export const metadata = { title: "Página não encontrada" };

export default function NaoEncontrada() {
  const trilhas = listarTrilhas();

  return (
    <AppShell>
      <div className="px-5 pb-8 pt-12">
        <Rotulo>Erro 404</Rotulo>
        <h1 className="font-display mt-1.5 text-[26px] font-bold">Esta página não existe</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--text-2)]">
          O endereço pode ter mudado ou o conteúdo ainda não foi publicado.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <BotaoLink href="/">Voltar para a página inicial</BotaoLink>
          {trilhas.map((t) => (
            <BotaoLink key={t.slug} href={`/trilhas/${t.slug}/`} variante="secundario">
              Ver a trilha de {t.titulo}
            </BotaoLink>
          ))}
          <BotaoLink href="/hoje/" variante="fantasma">
            Ou vá direto para o que estudar hoje
          </BotaoLink>
        </div>
      </div>
    </AppShell>
  );
}

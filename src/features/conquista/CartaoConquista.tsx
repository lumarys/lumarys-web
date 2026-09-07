"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Card, Rotulo } from "@/components/ui/Card";
import { useProgresso } from "@/features/progresso/useProgresso";
import { conquistaDaTrilha, faltaParaCertificado } from "@/lib/conquista";
import { cx } from "@/lib/utils";

import { desenharCartao, paraArquivo } from "./desenhar";

type Tipo = "conquista" | "certificado";

/**
 * O cartão que sai do site. Concluir a trilha passava em branco, e é o único
 * canal de aquisição orgânica previsto além da busca.
 *
 * Compartilhar pelo sistema quando o navegador deixa; baixar quando não deixa.
 * Nada é enviado para lugar nenhum: a imagem é desenhada e entregue aqui.
 */
export function CartaoConquista({
  trilhaSlug,
  trilhaTitulo,
  modulos,
  totalTemas,
}: {
  trilhaSlug: string;
  trilhaTitulo: string;
  modulos: { slug: string; temas: string[] }[];
  totalTemas: number;
}) {
  const { progresso, pronto } = useProgresso();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tipo, setTipo] = useState<Tipo>("conquista");
  const [aviso, setAviso] = useState<string | null>(null);

  const conquista = conquistaDaTrilha(progresso, trilhaSlug, modulos, totalTemas);
  const falta = faltaParaCertificado(conquista);
  const podeCertificado = conquista.podeCertificado;

  const desenhar = useCallback(
    (qual: Tipo) => {
      if (!canvas.current) return;
      void desenharCartao(canvas.current, {
        trilhaTitulo,
        conquista,
        tipo: qual,
        data: new Date(),
      });
    },
    // `conquista` é recalculada a cada render; depender dela redesenharia sem
    // parar. Os números que o cartão mostra são estes:
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      trilhaTitulo,
      conquista.temasConcluidos,
      conquista.totalTemas,
      conquista.prontidao,
      conquista.sequencia,
      conquista.notaSimulado,
    ],
  );

  useEffect(() => {
    if (pronto) desenhar(tipo);
  }, [pronto, tipo, desenhar]);

  // Nada a comemorar antes do primeiro tema.
  if (!pronto || conquista.temasConcluidos === 0) return null;

  async function compartilhar() {
    setAviso(null);
    if (!canvas.current) return;

    const nome = tipo === "certificado" ? "lumarys-certificado.png" : "lumarys-progresso.png";
    const arquivo = await paraArquivo(canvas.current, nome);
    if (!arquivo) {
      setAviso("Não consegui gerar a imagem neste navegador.");
      return;
    }

    // navigator.share só existe em contexto seguro e, em vários navegadores de
    // computador, não aceita arquivo. Baixar é a saída que sempre funciona.
    if (navigator.canShare?.({ files: [arquivo] })) {
      try {
        await navigator.share({ files: [arquivo], title: trilhaTitulo });
        return;
      } catch {
        // Cancelar o compartilhamento não é erro; cair para o download seria
        // baixar sem a pessoa ter pedido.
        return;
      }
    }

    const url = URL.createObjectURL(arquivo);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <Rotulo>{tipo === "certificado" ? "Seu certificado" : "Seu progresso"}</Rotulo>
        {podeCertificado ? (
          <div className="flex gap-1 rounded-full border border-[var(--border)] p-0.5">
            {(["conquista", "certificado"] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setTipo(opcao)}
                className={cx(
                  "min-h-9 rounded-full px-3 text-xs font-semibold",
                  tipo === opcao
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "text-[var(--text-2)]",
                )}
              >
                {opcao === "conquista" ? "Progresso" : "Certificado"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <canvas
        ref={canvas}
        aria-label={`Cartão com ${conquista.temasConcluidos} de ${conquista.totalTemas} temas concluídos e prontidão de ${conquista.prontidao}%`}
        className="mt-2.5 w-full rounded-xl border border-[var(--border)]"
      />

      <button
        type="button"
        onClick={compartilhar}
        className="mt-3 min-h-12 w-full rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--accent-ink)]"
      >
        Compartilhar
      </button>

      {!podeCertificado ? (
        <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--muted)]">
          <span className="font-semibold text-[var(--text-2)]">Certificado:</span> sai com a trilha
          inteira concluída e um simulado acima de 70%. {falta}
        </p>
      ) : null}

      {aviso ? <p className="mt-2 text-[13px] text-[var(--color-danger)]">{aviso}</p> : null}
    </Card>
  );
}

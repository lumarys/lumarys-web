"use client";

import { useEffect, useRef, useState } from "react";

import { IconeSimulado } from "@/components/ui/icons";
import { cx } from "@/lib/utils";

/**
 * Gravação para você se ouvir. Fica **só no aparelho**: o áudio nunca sai do
 * navegador, não vai para a conta e é descartado ao trocar de pergunta. Sem
 * permissão de microfone, o bloco vira só um cronômetro.
 */
export function Gravador({ chave }: { chave: string }) {
  const [estado, setEstado] = useState<"parado" | "gravando" | "pronto" | "negado">("parado");
  const [segundos, setSegundos] = useState(0);
  const [audio, setAudio] = useState<string | null>(null);
  const gravador = useRef<MediaRecorder | null>(null);
  const pedacos = useRef<Blob[]>([]);

  // Trocar de pergunta descarta o áudio anterior.
  useEffect(() => {
    return () => {
      gravador.current?.stream.getTracks().forEach((t) => t.stop());
      if (audio) URL.revokeObjectURL(audio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  useEffect(() => {
    setEstado("parado");
    setSegundos(0);
    setAudio((atual) => {
      if (atual) URL.revokeObjectURL(atual);
      return null;
    });
  }, [chave]);

  useEffect(() => {
    if (estado !== "gravando") return;
    const id = window.setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [estado]);

  async function alternar() {
    if (estado === "gravando") {
      gravador.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      pedacos.current = [];
      mr.ondataavailable = (e) => pedacos.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setAudio(URL.createObjectURL(new Blob(pedacos.current, { type: mr.mimeType })));
        setEstado("pronto");
      };
      gravador.current = mr;
      mr.start();
      setSegundos(0);
      setEstado("gravando");
    } catch {
      setEstado("negado");
    }
  }

  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <button
        type="button"
        onClick={alternar}
        disabled={estado === "negado"}
        aria-label={estado === "gravando" ? "Parar a gravação" : "Gravar sua resposta"}
        className={cx(
          "flex size-22 items-center justify-center rounded-full transition-shadow disabled:opacity-40",
          estado === "gravando"
            ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_0_0_12px_rgba(245,184,61,0.12)]"
            : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)]",
        )}
      >
        <IconeSimulado size={34} />
      </button>

      <p className="font-display text-sm font-semibold tabular-nums">
        {mm}:{ss}
      </p>

      <p className="text-center text-[13px] text-[var(--muted)]">
        {estado === "gravando"
          ? "Gravando · fica só no seu aparelho"
          : estado === "pronto"
            ? "Ouça sua resposta antes de se avaliar"
            : estado === "negado"
              ? "Sem permissão de microfone. Responda em voz alta assim mesmo."
              : "Toque para gravar, ou responda em voz alta sem gravar"}
      </p>

      {audio ? <audio controls src={audio} className="w-full max-w-sm" /> : null}
    </div>
  );
}

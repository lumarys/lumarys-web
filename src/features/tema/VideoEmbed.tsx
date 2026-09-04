"use client";

import { useState } from "react";

import { IconePlay } from "@/components/ui/icons";
import type { Video } from "@content/types";

/**
 * Fachada: até o toque, é só uma imagem e um botão. O iframe do YouTube só
 * entra depois do clique — economiza cerca de meio megabyte por tema no
 * carregamento e evita cookie de terceiro em quem nunca assiste.
 */
export function VideoEmbed({ video }: { video: Video }) {
  const [tocando, setTocando] = useState(false);

  return (
    <figure className="m-0">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--elevated)]">
        {tocando ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&hl=pt-BR`}
            title={video.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setTocando(true)}
            aria-label={`Assistir: ${video.titulo}. ${video.canal}, ${video.duracao} min`}
            className="group absolute inset-0 size-full cursor-pointer border-0 p-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="size-full object-cover opacity-70 transition-opacity group-hover:opacity-90"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] shadow-lg">
                <IconePlay size={26} />
              </span>
            </span>
            <span className="absolute inset-x-3 bottom-3 flex items-center justify-between text-xs text-[var(--text-2)]">
              <span className="rounded bg-black/60 px-2 py-1">{video.canal}</span>
              <span className="rounded bg-black/60 px-2 py-1">{video.duracao} min</span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
        {video.porQue}
      </figcaption>
    </figure>
  );
}

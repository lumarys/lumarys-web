import type { SVGProps } from "react";

/**
 * Ícones de traço, grade 24, largura 1.75 — nunca emoji. Todos herdam a cor do
 * texto (`currentColor`) para funcionar nos dois temas.
 */
type Props = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 22, children, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconeHoje = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
  </Base>
);

export const IconeTrilha = (p: Props) => (
  <Base {...p}>
    <path d="M4 19c4-1 5-4 6-8s3-7 8-7" />
    <circle cx="4" cy="19" r="1.5" />
    <circle cx="18" cy="4" r="2.5" />
  </Base>
);

export const IconeCards = (p: Props) => (
  <Base {...p}>
    <rect x="3" y="6" width="14" height="14" rx="2" />
    <path d="M7 4h12a2 2 0 0 1 2 2v12" />
  </Base>
);

export const IconeSimulado = (p: Props) => (
  <Base {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Base>
);

export const IconePlay = (p: Props) => (
  <Base {...p}>
    <polygon points="9 6 19 12 9 18 9 6" />
  </Base>
);

export const IconeRelogio = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const IconeCheck = (p: Props) => (
  <Base {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Base>
);

export const IconeEstrela = (p: Props) => (
  <Base {...p}>
    <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.3 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z" />
  </Base>
);

export const IconeVoltar = (p: Props) => (
  <Base {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Base>
);

export const IconeFechar = (p: Props) => (
  <Base {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Base>
);

export const IconeDrill = (p: Props) => (
  <Base {...p}>
    <path d="M4 20L20 4M14 4h6v6" />
  </Base>
);

export const IconeConta = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </Base>
);

export const IconeSeta = (p: Props) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const IconeCopiar = (p: Props) => (
  <Base {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Base>
);

export const IconeAlerta = (p: Props) => (
  <Base {...p}>
    <path d="M12 4l9 16H3L12 4z" />
    <path d="M12 10v4M12 17.5v.5" />
  </Base>
);

/** Marca: ponto de luz e o arco da trajetória. */
export function Marca({ size = 28, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d="M10 40 C 14 20, 32 10, 48 14"
        stroke="var(--accent)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx="46" cy="14" r="8" fill="var(--accent)" />
      <circle cx="11" cy="42" r="3" fill="currentColor" />
    </svg>
  );
}

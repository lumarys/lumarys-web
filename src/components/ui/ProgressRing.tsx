export function ProgressRing({
  valor,
  tamanho = 56,
  espessura = 6,
  rotulo,
}: {
  /** 0 a 100 */
  valor: number;
  tamanho?: number;
  espessura?: number;
  rotulo?: string;
}) {
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = Math.max(0, Math.min(100, valor)) / 100;

  return (
    <div className="relative shrink-0" style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} aria-hidden="true">
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="var(--elevated)"
          strokeWidth={espessura}
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - preenchido)}
          transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
        />
      </svg>
      {rotulo ? (
        <span className="font-display absolute inset-0 flex items-center justify-center text-sm font-bold">
          {rotulo}
        </span>
      ) : null}
    </div>
  );
}

export function BarraProgresso({
  valor,
  cor = "var(--accent)",
  className,
}: {
  valor: number;
  cor?: string;
  className?: string;
}) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-[var(--elevated)] ${className ?? ""}`}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, valor))}%`, background: cor }}
      />
    </div>
  );
}

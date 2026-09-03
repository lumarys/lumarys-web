export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatarMinutos(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function diasAte(dataISO: string, agora: Date = new Date()): number {
  const alvo = new Date(`${dataISO}T00:00:00`);
  const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.round((alvo.getTime() - base.getTime()) / 86_400_000);
}

export function plural(n: number, singular: string, plural_: string): string {
  return `${n} ${n === 1 ? singular : plural_}`;
}

/** Fisher-Yates com semente, para simulados reproduzíveis dentro do mesmo dia. */
export function embaralhar<T>(itens: T[], semente = Date.now()): T[] {
  const saida = [...itens];
  let estado = semente >>> 0;
  const proximo = () => {
    estado = (estado * 1_664_525 + 1_013_904_223) >>> 0;
    return estado / 0x1_0000_0000;
  };
  for (let i = saida.length - 1; i > 0; i--) {
    const j = Math.floor(proximo() * (i + 1));
    const a = saida[i];
    const b = saida[j];
    if (a !== undefined && b !== undefined) {
      saida[i] = b;
      saida[j] = a;
    }
  }
  return saida;
}

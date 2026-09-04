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

/**
 * Semente estável a partir de um texto (FNV-1a). Serve para embaralhar sempre
 * do mesmo jeito a mesma pergunta: a ordem deixa de ser previsível sem ficar
 * pulando a cada renderização.
 */
export function sementeDeTexto(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
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

/** "4 de set." — só para texto renderizado no cliente, depois de hidratar. */
export function formatarData(ms: number): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(new Date(ms));
}

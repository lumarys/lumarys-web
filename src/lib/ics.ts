/**
 * Arquivo de calendário do plano de estudo.
 *
 * O plano existia só dentro do site: quem fechasse a aba precisava lembrar
 * sozinho de estudar. Um `.ics` põe os dias na agenda que a pessoa já olha, e
 * funciona em qualquer calendário — não precisa de conta, de permissão de
 * notificação nem de servidor.
 */

export type EventoDeEstudo = {
  /** AAAA-MM-DD */
  data: string;
  titulo: string;
  descricao: string;
  /** Hora local de início, 0 a 23. */
  hora: number;
  minutos: number;
};

/** RFC 5545 quebra linhas em 75 octetos; um `\n` cru invalida o arquivo. */
function escapar(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** "2026-09-18" + 19h -> "20260918T190000" (hora local, sem fuso no carimbo). */
function carimbo(data: string, hora: number, maisMinutos = 0): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const d = new Date(ano ?? 1970, (mes ?? 1) - 1, dia ?? 1, hora, maisMinutos);
  const dois = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${dois(d.getMonth() + 1)}${dois(d.getDate())}` +
    `T${dois(d.getHours())}${dois(d.getMinutes())}00`
  );
}

/**
 * Monta o calendário. `agora` entra como argumento por causa do DTSTAMP, que
 * é obrigatório — sem isso o teste dependeria do relógio da máquina.
 */
export function montarIcs(
  eventos: EventoDeEstudo[],
  identificador: string,
  agora: Date = new Date(),
): string {
  const dois = (n: number) => String(n).padStart(2, "0");
  const stamp =
    `${agora.getUTCFullYear()}${dois(agora.getUTCMonth() + 1)}${dois(agora.getUTCDate())}` +
    `T${dois(agora.getUTCHours())}${dois(agora.getUTCMinutes())}${dois(agora.getUTCSeconds())}Z`;

  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lumarys//Plano de estudo//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Lumarys — plano de estudo",
  ];

  for (const evento of eventos) {
    linhas.push(
      "BEGIN:VEVENT",
      // O id é estável: reimportar substitui o evento em vez de duplicá-lo.
      `UID:${identificador}-${evento.data}@lumarys.com.br`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${carimbo(evento.data, evento.hora)}`,
      `DTEND:${carimbo(evento.data, evento.hora, evento.minutos)}`,
      `SUMMARY:${escapar(evento.titulo)}`,
      `DESCRIPTION:${escapar(evento.descricao)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT10M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapar(evento.titulo)}`,
      "END:VALARM",
      "END:VEVENT",
    );
  }

  linhas.push("END:VCALENDAR");
  // CRLF é exigido pela norma, e alguns calendários recusam sem ele.
  return linhas.map(dobrar).join("\r\n") + "\r\n";
}

/** Dobra linhas acima de 75 octetos, com um espaço no começo da continuação. */
function dobrar(linha: string): string {
  if (linha.length <= 75) return linha;
  const partes: string[] = [linha.slice(0, 75)];
  let resto = linha.slice(75);
  while (resto.length > 74) {
    partes.push(` ${resto.slice(0, 74)}`);
    resto = resto.slice(74);
  }
  if (resto) partes.push(` ${resto}`);
  return partes.join("\r\n");
}

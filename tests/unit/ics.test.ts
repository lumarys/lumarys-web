import { describe, expect, it } from "vitest";

import { montarIcs } from "@/lib/ics";

const AGORA = new Date("2026-09-06T15:04:05Z");

const evento = {
  data: "2026-09-18",
  titulo: "Dia 1 · Fundamentos",
  descricao: "Big Data; OLAP, OLTP e ETL",
  hora: 19,
  minutos: 45,
};

describe("montar ics", () => {
  it("abre e fecha o calendário, com CRLF", () => {
    const ics = montarIcs([evento], "ed", AGORA);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it("o fim do evento respeita os minutos do plano", () => {
    const ics = montarIcs([evento], "ed", AGORA);
    expect(ics).toContain("DTSTART:20260918T190000");
    expect(ics).toContain("DTEND:20260918T194500");
  });

  it("passar da meia-noite rola para o dia seguinte", () => {
    const ics = montarIcs([{ ...evento, hora: 23, minutos: 90 }], "ed", AGORA);
    expect(ics).toContain("DTEND:20260919T003000");
  });

  it("o id é estável: reimportar substitui em vez de duplicar", () => {
    const um = montarIcs([evento], "ed", AGORA);
    const dois = montarIcs([evento], "ed", new Date("2027-01-01T00:00:00Z"));
    expect(um).toContain("UID:ed-2026-09-18@lumarys.com.br");
    expect(dois).toContain("UID:ed-2026-09-18@lumarys.com.br");
  });

  it("escapa vírgula e ponto e vírgula, que separam campos na norma", () => {
    // String.raw porque a asserção anterior escrevia "\;", que em JavaScript
    // é só ";": o teste passava afirmando exatamente o defeito que existia no
    // código. Aqui o que se compara é o texto literal que vai para o arquivo.
    const ics = montarIcs([{ ...evento, descricao: "Big Data; OLAP, OLTP" }], "ed", AGORA);
    expect(ics).toContain(String.raw`Big Data\; OLAP\, OLTP`);
  });

  it("dobra linha longa, como a norma exige", () => {
    const ics = montarIcs([{ ...evento, descricao: "x".repeat(200) }], "ed", AGORA);
    for (const linha of ics.split("\r\n")) expect(linha.length).toBeLessThanOrEqual(75);
  });

  it("cada evento traz um lembrete dez minutos antes", () => {
    const ics = montarIcs([evento], "ed", AGORA);
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT10M");
  });

  it("sem evento nenhum, ainda é um calendário válido", () => {
    const ics = montarIcs([], "ed", AGORA);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });
});

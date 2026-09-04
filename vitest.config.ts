import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Os testes cobrem lógica pura: repetição espaçada, mesclagem de progresso e
 * prontidão. Componente é testado no Playwright, contra o site construído, que
 * é onde os defeitos de tela realmente aparecem — por isso aqui não há plugin
 * de React nem biblioteca de renderização.
 */
export default defineConfig({
  test: {
    // jsdom porque o módulo de progresso conversa com window.localStorage.
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts"],
    // Fuso fixo. "Hoje" é uma data local, e o CI roda em UTC: sem fixar, o
    // teste que prova o comportamento noturno passa na máquina do Brasil e
    // falha no runner — foi exatamente o que aconteceu.
    env: { TZ: "America/Sao_Paulo" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@content": fileURLToPath(new URL("./content", import.meta.url)),
    },
  },
});

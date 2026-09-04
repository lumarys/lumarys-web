import { defineConfig, devices } from "@playwright/test";

/**
 * Testes de ponta a ponta contra o site estático já construído. O alvo é
 * celular: é onde o aluno estuda, e é onde quebra primeiro.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:8099",
    trace: "on-first-retry",
  },
  projects: [
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
    { name: "iphone-15", use: { ...devices["iPhone 15"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // Servidor da própria máquina: nada para baixar, e o export é só arquivo.
    command: "python3 -m http.server 8099 --directory out --bind 127.0.0.1",
    url: "http://127.0.0.1:8099",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

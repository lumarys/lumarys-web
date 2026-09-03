import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // A detecção automática de versão do eslint-plugin-react usa uma API que
    // mudou no ESLint 10 e estoura. Declarar a versão evita a detecção.
    settings: { react: { version: "19.2" } },
    rules: {
      // Descarte explícito com sublinhado é intencional: separa o que não vai
      // para o cliente (chave interna, TTL) do resto do objeto.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "services/**/dist/**",
    "*.config.js",
    "*.config.mjs",
    "scripts/**",
  ]),
]);

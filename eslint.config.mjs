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
      /**
       * Acessibilidade. O `eslint-config-next` já registra o plugin jsx-a11y,
       * mas liga só 6 regras, todas como aviso. Estas são as que pegam os
       * erros que um site mobile-first comete de verdade, e entram como erro
       * porque aviso ninguém lê.
       *
       * As regras são declaradas pelo namespace que o Next já registrou: o
       * pacote ainda declara compatibilidade até o ESLint 9, e instalá-lo
       * direto quebraria o `npm ci` por conflito de peer.
       */
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-activedescendant-has-tabindex": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/autocomplete-valid": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/iframe-has-title": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/media-has-caption": "error",
      "jsx-a11y/mouse-events-have-key-events": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/no-distracting-elements": "error",
      // A lista de handlers é explícita para a regra não confundir `onError`
      // de <img> com interação: onError é o navegador avisando que o arquivo
      // não carregou, não alguém clicando.
      "jsx-a11y/no-noninteractive-element-interactions": [
        "error",
        {
          handlers: ["onClick", "onMouseDown", "onMouseUp", "onKeyPress", "onKeyDown", "onKeyUp"],
        },
      ],
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/scope": "error",
      "jsx-a11y/tabindex-no-positive": "error",

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

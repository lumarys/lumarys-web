/**
 * Cada tema é um módulo MDX compilado no build pelo @next/mdx. O componente
 * exportado aceita o mapa de componentes da allowlist (Callout, Comparativo,
 * Passos, Termo).
 */
declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType<{
    components?: Record<string, ComponentType<Record<string, unknown>>>;
  }>;

  export default MDXComponent;
}

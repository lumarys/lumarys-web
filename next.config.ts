import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx"],
};

/**
 * MDX compilado no BUILD, não em tempo de execução.
 *
 * Antes usávamos next-mdx-remote, que compila a cada renderização. Ele tem um
 * aviso de segurança alto para conteúdo MDX não confiável, e a versão que
 * corrige deixa de avaliar as props dos componentes — o que quebra as tabelas
 * comparativas dos temas. Como todo tema é conhecido no build e mora no
 * próprio repositório, compilar no build resolve os dois problemas: some a
 * dependência com aviso e some o custo por requisição.
 *
 * O remark-frontmatter existe para o bloco YAML no topo de cada tema não virar
 * texto na página: o frontmatter continua sendo lido pelo zod, no servidor.
 */
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // O Turbopack serializa as opções do loader, então o plugin entra pelo
    // NOME do pacote, não pela função importada.
    remarkPlugins: [["remark-frontmatter", { type: "yaml", marker: "-" }]],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);

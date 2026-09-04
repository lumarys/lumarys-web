import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";

import { JsonLd, SITE, alternativas, jsonLdOrganizacao } from "@/lib/seo";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Lumarys — trilhas de estudo para provas e certificações",
    template: "%s | Lumarys",
  },
  description: SITE.descricao,
  applicationName: SITE.nome,
  authors: [{ name: "Cernyn", url: "https://cernyn.com/" }],
  creator: "Cernyn",
  publisher: "Cernyn",
  alternates: alternativas("/"),
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.nome,
    title: "Lumarys — Life long Learning 4 Ever",
    description: SITE.descricao,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--accent-ink)]"
        >
          Pular para o conteúdo
        </a>
        {children}
        <JsonLd dados={jsonLdOrganizacao()} />
      </body>
    </html>
  );
}

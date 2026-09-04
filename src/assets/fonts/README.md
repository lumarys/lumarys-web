# Fontes para a imagem de compartilhamento

Sora (600, 700) e Inter (400, 600), em WOFF, baixadas do Google Fonts. Servem
ao renderizador de Open Graph (`src/lib/og.tsx`), que precisa do arquivo bruto
no build, e ao gerador da marca (`design/marca/gerar.mjs`, que usa a Sora 600
para o wordmark); a página usa `next/font`, que cuida das próprias cópias.

Licença: SIL Open Font License 1.1, nas duas famílias.

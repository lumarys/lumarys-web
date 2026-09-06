/**
 * Uma regra só para a casca do site, em vez de cada página decidir por conta
 * própria — era assim que a home ficava sem barra de abas, a trilha ficava sem
 * cabeçalho, e /sobre oferecia "Cards" e "Simulado" a quem nunca estudou.
 *
 * Telas de estado são as que só fazem sentido com progresso do aluno. Elas
 * ganham a barra de abas; todas as páginas ganham cabeçalho.
 */

const PREFIXOS_DE_ESTADO = ["/hoje", "/cards", "/simulado", "/conta"];

export function ehTelaDeEstado(caminho: string): boolean {
  if (PREFIXOS_DE_ESTADO.some((p) => caminho === p || caminho.startsWith(`${p}/`))) return true;
  // Dentro de uma trilha (plano, módulo, tema) o aluno está estudando; o
  // catálogo em /trilhas/ é vitrine pública.
  return /^\/trilhas\/[^/]+\//.test(caminho);
}

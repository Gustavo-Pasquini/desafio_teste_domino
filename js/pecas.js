// Peças do dominó (duplo-seis): criar, embaralhar e distribuir.
// Uma peça é um par [a, b] de números de 0 a 6.

export const MAIOR_NUMERO = 6;
export const PECAS_POR_JOGADOR = 7;

/** As 28 peças, de 0-0 a 6-6, sem repetir. */
export function criarPecas() {
  const pecas = [];
  for (let a = 0; a <= MAIOR_NUMERO; a++) {
    for (let b = a; b <= MAIOR_NUMERO; b++) pecas.push([a, b]);
  }
  return pecas;
}

/** Cópia embaralhada (Fisher–Yates). `aleatorio` pode ser trocado para sorteios previsíveis. */
export function embaralhar(pecas, aleatorio = Math.random) {
  const copia = [...pecas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** 7 peças para cada jogador; o resto vira o monte. */
export function distribuir(pecas, aleatorio = Math.random) {
  const sorteadas = embaralhar(pecas, aleatorio);
  return {
    j1: sorteadas.slice(0, PECAS_POR_JOGADOR),
    j2: sorteadas.slice(PECAS_POR_JOGADOR, 2 * PECAS_POR_JOGADOR),
    monte: sorteadas.slice(2 * PECAS_POR_JOGADOR),
  };
}

/** Nome canônico da peça, com o menor número primeiro (ex.: [6, 3] → "3-6"). */
export function nomeDaPeca([a, b]) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

/** Lê uma lista de peças no formato da URL ("6-6,1-3"). Texto vazio → nenhuma peça. */
export function lerPecas(texto) {
  return texto
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split('-').map(Number));
}

/** Cenário vindo da URL (`j1`, `j2`, `monte`). Se nenhum deles foi passado, devolve null. */
export function cenarioDaUrl(busca) {
  const params = new URLSearchParams(busca);
  if (!['j1', 'j2', 'monte'].some((p) => params.has(p))) return null;
  const ler = (p) => lerPecas(params.get(p) ?? '');
  return { j1: ler('j1'), j2: ler('j2'), monte: ler('monte') };
}

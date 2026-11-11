// Mesa: pontas, onde a peça encaixa e como ela é girada.
// A mesa é a lista de peças da esquerda para a direita, cada uma já na orientação em que está.

/** Números das pontas: { esquerda, direita }. Mesa vazia → null. */
export function pontas(mesa) {
  if (mesa.length === 0) return null;
  return { esquerda: mesa[0][0], direita: mesa[mesa.length - 1][1] };
}

/**
 * Lados em que a peça encaixa: [], ['esquerda'], ['direita'] ou os dois (o jogador escolhe).
 * Mesa vazia, ou pontas com o mesmo número: a peça entra à direita, sem perguntar.
 */
export function ladosPossiveis(mesa, peca) {
  const ponta = pontas(mesa);
  if (!ponta) return ['direita'];
  const lados = ['esquerda', 'direita'].filter((lado) => peca.includes(ponta[lado]));
  return ponta.esquerda === ponta.direita ? lados.slice(-1) : lados;
}

/** Coloca a peça no lado pedido, girada para o número igual ficar encostado na ponta. */
export function encaixar(mesa, [a, b], lado) {
  const ponta = pontas(mesa);
  if (!ponta) return [[a, b]];
  if (lado === 'esquerda') return [b === ponta.esquerda ? [a, b] : [b, a], ...mesa];
  return [...mesa, a === ponta.direita ? [a, b] : [b, a]];
}

// Comprar do monte e passar a vez.
import { ladosDaJogada, outroJogador } from './jogo.js';
import { nomeDaPeca } from './pecas.js';

/** O jogador (por padrão, o da vez) tem alguma peça que pode jogar agora? */
export function temJogada(estado, jogador = estado.vez) {
  return estado.maos[jogador].some((p) => ladosDaJogada(estado, nomeDaPeca(p), jogador).length > 0);
}

/** Só compra quem não tem peça jogável, e só se ainda houver monte. */
export function podeComprar(estado) {
  return estado.monte.length > 0 && !temJogada(estado);
}

/** O jogador da vez compra uma peça (a primeira do monte). Sem direito a comprar → null. */
export function comprar(estado) {
  if (!podeComprar(estado)) return null;
  const [comprada, ...monte] = estado.monte;
  return { ...estado, monte, maos: { ...estado.maos, [estado.vez]: [...estado.maos[estado.vez], comprada] } };
}

/** Só passa quem não tem peça jogável e não tem mais o que comprar. */
export function podePassar(estado) {
  return estado.monte.length === 0 && !temJogada(estado);
}

/** O jogador da vez passa; a vez vai para o outro. Sem direito a passar → null. */
export function passar(estado) {
  if (!podePassar(estado)) return null;
  return { ...estado, vez: outroJogador(estado.vez) };
}

// Fim da partida: batida, jogo trancado e pontuação.
import { JOGADORES, outroJogador } from './jogo.js';
import { temJogada } from './compra.js';

const pontosDaMao = (mao) => mao.reduce((total, [a, b]) => total + a + b, 0);

/**
 * Resultado da partida, ou null se ela continua.
 * Batida: quem ficou sem peças vence e marca os pontos da mão do adversário.
 * Trancado: monte vazio e ninguém consegue jogar; vence quem tem menos pontos na mão
 * e marca os pontos da mão do adversário. Somas iguais → empate (ninguém pontua).
 */
export function verificarFim(estado) {
  const bateu = JOGADORES.find((j) => estado.maos[j].length === 0);
  if (bateu) return { tipo: 'batida', vencedor: bateu, pontos: pontosDaMao(estado.maos[outroJogador(bateu)]) };

  const trancado = estado.monte.length === 0 && JOGADORES.every((j) => !temJogada(estado, j));
  if (!trancado) return null;
  const [menor, maior] = [...JOGADORES].sort((x, y) => pontosDaMao(estado.maos[x]) - pontosDaMao(estado.maos[y]));
  if (pontosDaMao(estado.maos[menor]) === pontosDaMao(estado.maos[maior])) return { tipo: 'empate', vencedor: null, pontos: 0 };
  return { tipo: 'trancado', vencedor: menor, pontos: pontosDaMao(estado.maos[maior]) };
}

/** Texto da mensagem de fim de partida. */
export function mensagemDoFim(fim) {
  if (fim.tipo === 'empate') return 'Empate';
  const venceu = `Jogador ${fim.vencedor.slice(1)} venceu!`;
  return fim.tipo === 'trancado' ? `Jogo trancado — ${venceu}` : venceu;
}

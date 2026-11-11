// Regras da partida: quem começa e turnos.
import { nomeDaPeca } from './pecas.js';
import { encaixar, ladosPossiveis } from './mesa.js';

export const JOGADORES = ['j1', 'j2'];
export const outroJogador = (jogador) => (jogador === 'j1' ? 'j2' : 'j1');

const ehDupla = ([a, b]) => a === b;
const soma = ([a, b]) => a + b;

/** Força da peça para abrir a partida: qualquer dupla vence qualquer não dupla; depois, a maior. */
function forcaDeAbertura(peca) {
  return ehDupla(peca) ? 100 + peca[0] : soma(peca);
}

const melhorForca = (mao) => Math.max(-1, ...mao.map(forcaDeAbertura));

/** Quem começa: quem tem a maior dupla; sem duplas, quem tem a peça de maior soma. */
export function quemComeca(maos) {
  return melhorForca(maos.j2) > melhorForca(maos.j1) ? 'j2' : 'j1';
}

/** Peças com que o jogador pode abrir a partida: as de maior força da mão dele. */
export function pecasDeAbertura(mao) {
  const melhor = melhorForca(mao);
  return mao.filter((p) => forcaDeAbertura(p) === melhor).map(nomeDaPeca);
}

/** Começa uma partida com as mãos e o monte dados. */
export function novoJogo({ j1, j2, monte }) {
  const maos = { j1, j2 };
  return { maos, monte, mesa: [], vez: quemComeca(maos) };
}

const pecaDaMao = (mao, nome) => mao.find((p) => nomeDaPeca(p) === nome);

/**
 * Lados em que o jogador (por padrão, o da vez) pode jogar a peça `nome` ("a-b"):
 * [] = jogada inválida; um lado = joga direto; os dois = o jogador escolhe.
 */
export function ladosDaJogada(estado, nome, jogador = estado.vez) {
  const mao = estado.maos[jogador];
  const peca = pecaDaMao(mao, nome);
  if (!peca) return [];
  if (estado.mesa.length === 0 && !pecasDeAbertura(mao).includes(nome)) return [];
  return ladosPossiveis(estado.mesa, peca);
}

/** O jogador da vez joga a peça `nome` no `lado` (se omitido, o único possível). Inválida → null. */
export function jogar(estado, nome, lado) {
  const lados = ladosDaJogada(estado, nome);
  const escolhido = lado ?? (lados.length === 1 ? lados[0] : null);
  if (!lados.includes(escolhido)) return null;
  const mao = estado.maos[estado.vez];
  const peca = pecaDaMao(mao, nome);
  return {
    ...estado,
    maos: { ...estado.maos, [estado.vez]: mao.filter((p) => p !== peca) },
    mesa: encaixar(estado.mesa, peca, escolhido),
    vez: outroJogador(estado.vez),
  };
}

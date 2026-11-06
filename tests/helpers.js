// Helpers dos testes de interface (tarefa G1). Contrato: seção 3 do PLANEJAMENTO.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, vi } from 'vitest';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/**
 * Abre o jogo como um jogador abriria a página.
 * @param {Record<string,string>} params parâmetros de URL da seção 3 (cenário fixo)
 * @param {object} opcoesUser repassado a userEvent.setup (ex.: { advanceTimers: vi.advanceTimersByTime })
 * @returns user do user-event, para clicar como o jogador
 */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  vi.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

/** Clique direito como o jogador faria. */
export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };

/**
 * CENARIO_JOGADAS: J1 = 6-6, 1-3, 0-0; J2 = 3-6, 1-6, 2-2; monte vazio. J1 começa (tem 6-6).
 * Com j1/j2/monte na URL, a partida já começa ao abrir a página.
 */
export const CENARIO_JOGADAS = { j1: '6-6,1-3,0-0', j2: '3-6,1-6,2-2', monte: '' };

/** Peças na mão de 'j1' ou 'j2'. */
export const pecasNaMao = (jogador) => within(screen.getByTestId(`mao-${jogador}`)).queryAllByTestId(/^peca-\d-\d$/);
/** Clica na peça `a-b` (a ≤ b) da mão do jogador. */
export async function jogarPeca(user, jogador, peca) {
  await user.click(within(screen.getByTestId(`mao-${jogador}`)).getByTestId(`peca-${peca}`));
}
/** Peças da mesa, da esquerda para a direita, na orientação em que estão (data-peca). */
export const pecasDaMesa = () => [...screen.getByTestId('mesa').children].map((p) => p.getAttribute('data-peca'));

// Testes de batida, jogo trancado e nova partida (Breno — B4 e B5).
import { test, expect } from 'vitest';
import { abrirJogo, screen, within, jogarPeca } from './helpers.js';

test.each([
  ['Jogador 1', { j1: '6-6,3-6', j2: '1-6,2-4,0-0', monte: '' }, [['j1', '6-6'], ['j2', '1-6'], ['j1', '3-6']], 'pontos-j1', 6],
  ['Jogador 2', { j1: '6-6,1-6,2-4,0-0', j2: '3-6', monte: '' }, [['j1', '6-6'], ['j2', '3-6']], 'pontos-j2', 13],
])('TC-DO-14 batida de %s soma os pontos adversários', async (vencedor, cenario, jogadas, placar, pontos) => {
  const user = await abrirJogo(cenario);
  for (const [jogador, peca] of jogadas) await jogarPeca(user, jogador, peca);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(`${vencedor} venceu!`);
  expect(screen.getByTestId(placar)).toHaveTextContent(new RegExp(`^${pontos}$`));
  expect(within(screen.getByTestId('mao-j1')).queryAllByTestId(/^peca-/).every((p) => p.disabled)).toBe(true);
  expect(within(screen.getByTestId('mao-j2')).queryAllByTestId(/^peca-/).every((p) => p.disabled)).toBe(true);
});

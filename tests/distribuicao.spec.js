// Testes de peças, distribuição e de quem começa (Gustavo — G2, G3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, pecasNaMao, jogarPeca, pecasDaMesa } from './helpers.js';

async function novaPartida() {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}

test('TC-DO-01 nova partida: 7 peças para cada um e 14 no monte', async () => {
  await novaPartida();
  expect(pecasNaMao('j1')).toHaveLength(7);
  expect(pecasNaMao('j2')).toHaveLength(7);
  expect(screen.getByTestId('monte-qtd')).toHaveTextContent(/^14$/);
  expect(pecasDaMesa()).toHaveLength(0);
});

test('TC-DO-02 peças distribuídas são do duplo-seis e não se repetem (20 partidas)', async () => {
  for (let i = 0; i < 20; i++) {
    await novaPartida();
    const ids = [...pecasNaMao('j1'), ...pecasNaMao('j2')].map((p) => p.getAttribute('data-testid'));
    expect(ids).toHaveLength(14);
    for (const id of ids) {
      const [, a, b] = id.match(/^peca-([0-6])-([0-6])$/) ?? [];
      expect(a, `${id} não é uma peça de 0-0 a 6-6`).toBeDefined();
      expect(Number(a)).toBeLessThanOrEqual(Number(b));
    }
    expect(new Set(ids).size).toBe(14);
  }
});

// Testes de jogar peças na mesa (Gustavo — G4, G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, pecasNaMao, jogarPeca, pecasDaMesa, CENARIO_JOGADAS } from './helpers.js';

// CENARIO_JOGADAS: J1 = 6-6, 1-3, 0-0 · J2 = 3-6, 1-6, 2-2 · monte vazio.
/** J1 joga 6-6 e J2 joga 3-6 → pontas 6 e 3. */
async function ateTC06(user) {
  await jogarPeca(user, 'j1', '6-6');
  await jogarPeca(user, 'j2', '3-6');
}
/** ... e J1 joga 1-3 → pontas 6 e 1. */
async function ateTC07(user) {
  await ateTC06(user);
  await jogarPeca(user, 'j1', '1-3');
}

test('TC-DO-06 a peça encaixa na ponta com o mesmo número', async () => {
  const user = await abrirJogo(CENARIO_JOGADAS);
  await ateTC06(user);
  expect(pecasDaMesa()).toEqual(['6-6', '6-3']); // pontas iguais (6 e 6): entra à direita
  expect(screen.getByTestId('ponta-esquerda')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
});

test('TC-DO-07 a peça é girada para encaixar', async () => {
  const user = await abrirJogo(CENARIO_JOGADAS);
  await ateTC07(user); // 1-3 só encaixa no 3
  expect(pecasDaMesa()).toEqual(['6-6', '6-3', '3-1']);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('escolha-lado')).not.toBeVisible();
});
